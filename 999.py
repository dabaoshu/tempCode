from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import matplotlib
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import warnings
warnings.filterwarnings("ignore")
matplotlib.use('TkAgg')
plt.rcParams['font.family'] = 'SimHei'  # 设置为中文黑体
plt.rcParams['font.family'] = 'SimSun'  # 设置为宋体


sin = np.sin
cos = np.cos
tan = np.tan
atan2 = np.arctan2
norm = np.linalg.norm
inv = np.linalg.inv
pi = np.pi


rou = 1050
Cd = 0.89
g = 9.81
K = 10000

dt = 0.02
control_step = 10


class StructureParameters:
    def __init__(self):
        self.length = 1
        self.mass = 900
        self.fbl = rou * g * 0.8
        self.Ix = 600
        self.Iy = 600
        self.Iz = 400
        self.position_mass = np.array([0, 0, -0.3])     # 重心
        self.position_fbl = np.array([0, 0, 0.3])     # 浮心
        print('StructureParameters init done!')


class DynamicParameters(StructureParameters):
    def __init__(self):
        super(DynamicParameters, self).__init__()
        self.Xu = -0.1254
        self.Xuu = -0.28
        self.Xuabsu = -0.048
        self.Xdu = -0.2134
        self.Xvv = -0.6138
        self.Xrr = -0.9601
        self.Xvr = 0.4933

        self.Yv = -0.2210
        self.Yvv = -0.65
        self.Ydv = -0.3052
        self.Ydr = -0.001663
        self.Yv = -0.4996
        self.Yr = -0.3811
        self.Yvabsv = -0.0690
        self.Yrabsv = -0.5514
        self.Yrabsr = -0.1453
        self.Ystar = 0.001214

        self.Zw = -0.25
        self.Zww = -0.64
        self.Zwabsw = -0.1732
        self.Zdw = -0.4889
        self.Zdq = -0.4229

        self.Mdw = -0.003689
        self.Mq = -0.7620
        self.Mdq = -0.02804
        self.Mqabsq = -0.0679

        self.Ndv = -0.0007436
        self.Ndr = -0.02525
        self.Nr = -0.3552
        self.Nv = -0.09146
        self.Ndr = -0.1233
        self.Nrabsr = -0.042

        self.Kdp = -0.1233
        self.Kp = -0.6023
        self.Kpabsp = -0.044
        print('DynamicParameters init done!')


class ROV(DynamicParameters):
    def __init__(self):
        super(ROV, self).__init__()
        self.M = np.array([[self.mass-self.Xdu*K, 0, 0, 0, 0, 0],
                           [0, self.mass-self.Ydv*K, 0, 0, 0, 0],
                           [0, 0, self.mass-self.Zdw*K, 0, 0, 0],
                           [0, 0, 0, self.Ix-self.Kdp*K, 0, 0],
                           [0, 0, 0, 0, self.Iy-self.Mdq*K, 0],
                           [0, 0, 0, 0, 0, self.Iz-self.Ndr*K]])
        self.M_ = inv(self.M)
        self.state = np.array([0, 0, 0, pi*0.5, pi*1.2, 0, 0, 0, 0, 0, 0, 0], dtype=np.float32)
        self.f = np.array([0, 0, 0, 0, 0, 0], dtype=np.float32)
        self.t = [0.0]
        self.X = [np.array(self.state)]

    def dxdt(self, state):
        f = self.f
        u, v, w, p, q, r = state[6:]
        W = self.mass*g
        B = self.fbl
        xg, yg, zg = self.position_mass[:]
        xb, yb, zb = self.position_fbl[:]
        m = self.mass
        Ix = self.Ix
        Iy = self.Iy
        Iz = self.Iz

        x4, x5, x6 = state[3:6]
        c6 = cos(x6)
        c5 = cos(x5)
        c4 = cos(x4)
        s4 = sin(x4)
        s5 = sin(x5)
        s6 = sin(x6)

        M_ = self.M_       # 惯性矩阵

        C = np.array([[0, 0, 0, 0, (m-self.Zdw*K)*w, -(m-self.Ydv*K)*v],
                      [0, 0, 0, -(m-self.Zdw*K)*w, 0, (m-self.Xdu*K)*u],
                      [0, 0, 0, (m-self.Ydv*K)*v, -(m-self.Xdu*K)*u, 0],
                      [0, (m-self.Zdw*K)*w, -(m-self.Ydv*K)*v, 0, (Iz-self.Ndr*K)*r, -(Iy-self.Mdq*K)*q],
                      [-(m-self.Zdw*K)*w, 0, (m-self.Xdu*K)*u, -(Iz-self.Ndr*K)*r, 0, (Ix-self.Kdp*K)*p],
                      [(m-self.Ydv*K)*v, -(m-self.Xdu*K)*u, 0, (Iy-self.Mdq*K)*q, -(Ix-self.Kdp*K)*p, 0]
                      ])           # 阻尼矩阵
        # print('C', C)

        G = np.array([[(W - B) * s5],
                      [-(W - B) * c5 * s4],
                      [-(W - B) * c5 * c4],
                      [-(yg * W - yb * B) * c5 * c4 + (zg * W - zb * B) * c5 * s4],
                      [(zg * W - zb * B) * s5 + (xg * W - xb * B) * c5 * c4],
                      [-(xg * W - xb * B) * c5 * s4 - (yg * W - yb * B) * s5]])    # 精力学矩阵
        # print('G', G)

        D = -K*np.array([[self.Xu+self.Xuabsu*abs(u), 0, 0, 0, 0, 0],
                         [0, self.Yv+self.Yvabsv*abs(v), 0, 0, 0, 0],
                         [0, 0, self.Zw+self.Zwabsw*abs(w), 0, 0, 0],
                         [0, 0, 0, self.Kp+self.Kpabsp*abs(p), 0, 0],
                         [0, 0, 0, 0, self.Mq+self.Mqabsq*abs(q), 0],
                         [0, 0, 0, 0, 0, self.Nr+self.Nrabsr*abs(r)]])    # 惯性流体力矩阵
        # print('D', D)

        a = M_.dot(-C.dot(state[6:12].reshape(-1, 1))+G-D.dot(state[6:12].reshape(-1, 1))+f.reshape(-1, 1))

        T = np.array([[c6*c5, -s6*c4+c6*s5*s4, s6*s4+c6*c4*s5, 0, 0, 0],
                      [s6*c5, c6*c4+s4*s5*s6, -c6*s4+c4*s5*s6, 0, 0, 0],
                      [-s5, c5*s4, c5*c4, 0, 0, 0],
                      [0, 0, 0, 1, s4*tan(x5), c4*tan(x5)],
                      [0, 0, 0, 0, c4, -s4],
                      [0, 0, 0, 0, s4/c5, c4/c5]])    # 旋转变换矩阵

        sa = T.dot(state[6:12].reshape(-1, 1))
        dxdt = np.concatenate([sa, a], axis=0)
        # print(dxdt.shape)
        return np.array(dxdt[:, 0])

    def ode45(self, h):
        k1 = h * self.dxdt(self.state)
        k2 = h * self.dxdt(self.state + 0.5 * k1)
        k3 = h * self.dxdt(self.state + 0.5 * k2)
        k4 = h * self.dxdt((self.state + k3))
        self.state += (k1 + 2 * k2 + 2 * k3 + k4) / 6
        self.X.append(np.array(self.state))

    def step(self, n_step=control_step, action=np.zeros((6, 1))):
        """
        :param n_step: 每一个动作作用步数
        :param action: 推进器产生的力和力矩
        :return: 返回值有两个，第一个是运行过程的所有状态列表，第二个是最终状态
        """
        self.f = action
        self.t = [self.t[-1]]
        self.X = [np.array(self.state)]
        for i in range(n_step):
            self.ode45(dt)
            self.t.append(self.t[-1]+dt)
        state_list = np.array(self.X)
        # self.t = [self.t[-1]]
        # self.X = [self.X[-1]]
        return state_list, self.t, self.state

    def reset(self, state):
        self.state = np.array(state, dtype=np.float32)
        self.f = np.array([0, 0, 0, 0, 0, 0], dtype=np.float32)
        self.t = [0.0]
        self.X = [np.array(self.state)]

    def render(self):
        state = np.array(self.X)
        t = np.array(self.t[:])
        fig = plt.figure(1)
        ax1 = fig.add_subplot(121)
        ax1.plot(t, state[:, 3], linewidth=2)
        ax1.plot(t, state[:, 4], linewidth=2)
        ax1.plot(t, state[:, 5], linewidth=2)
        ax1.set_title('旋转角度')
        ax2 = fig.add_subplot(122)
        ax2.plot(t, state[:, 0:3], linewidth=2)
        ax2.set_title('位置')
        plt.show()
        fig2 = plt.figure(2)
        ax3 = fig2.add_subplot(111, projection='3d')
        p1 = ax3.scatter(np.array([0.0]), np.array([0.0]), np.array([0.0]), s=50, c='b', marker='*')
        p2 = ax3.scatter(np.array([self.X[0][0]]), np.array(self.X[0][1]), np.array(self.X[0][2]),
                         s=100, c='g', marker='D')
        ax3.plot(state[:, 0], state[:, 1], state[:, 2], linewidth=2)
        plt.legend([p1, p2], ['target', 'start'], loc=0)
        ax3.set_title('轨迹')
        plt.show()


if __name__ == '__main__':
    rov = ROV()
    rov.step(n_step=500)
    rov.render()

app = Flask(__name__)
CORS(app)  # 允许所有来源的跨域请求
rov = ROV()


@app.route('/api/rov/step', methods=['POST'])
def step():
    data = request.get_json()
    n_step = data.get('n_step', control_step)
    action = np.array(data.get('action', [0, 0, 0, 0, 0, 0]))
    state_list, t, final_state = rov.step(n_step=n_step, action=action)
    response = {
        'state_list': state_list.tolist(),
        't': t,
        'final_state': final_state.tolist()
    }
    return jsonify(response)

@app.route('/api/rov/render', methods=['GET'])
def render():
    rov.render()
    return 'Rendered'

if __name__ == '__main__':
    app.run(debug=True)

