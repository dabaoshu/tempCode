import { inv } from "mathjs"

const sin = Math.sin
const cos = Math.cos
const tan = Math.tan
const atan2 = nj.arctan2
const pi = Math.PI

let rou = 1050
let Cd = 0.89
let g = 9.81
let K = 10000

let dt = 0.02
let control_step = 10

class StructureParameters {
  constructor() {
    this.length = 1
    this.mass = 900
    this.fbl = rou * g * 0.8
    this.Ix = 600
    this.Iy = 600
    this.Iz = 400
    this.position_mass = nj.array([0, 0, -0.3]) // 重心
    this.position_fbl = nj.array([0, 0, 0.3]) // 浮心
  }
}

class DynamicParameters extends StructureParameters {
  constructor() {
    super()
    this.Xu = -0.1254
    this.Xuu = -0.28
    this.Xuabsu = -0.048
    this.Xdu = -0.2134
    this.Xvv = -0.6138
    this.Xrr = -0.9601
    this.Xvr = 0.4933

    this.Yv = -0.221
    this.Yvv = -0.65
    this.Ydv = -0.3052
    this.Ydr = -0.001663
    this.Yv = -0.4996
    this.Yr = -0.3811
    this.Yvabsv = -0.069
    this.Yrabsv = -0.5514
    this.Yrabsr = -0.1453
    this.Ystar = 0.001214

    this.Zw = -0.25
    this.Zww = -0.64
    this.Zwabsw = -0.1732
    this.Zdw = -0.4889
    this.Zdq = -0.4229

    this.Mdw = -0.003689
    this.Mq = -0.762
    this.Mdq = -0.02804
    this.Mqabsq = -0.0679

    this.Ndv = -0.0007436
    this.Ndr = -0.02525
    this.Nr = -0.3552
    this.Nv = -0.09146
    this.Ndr = -0.1233
    this.Nrabsr = -0.042

    this.Kdp = -0.1233
    this.Kp = -0.6023
    this.Kpabsp = -0.044
    console.log("DynamicParameters init done!")
  }
}

class ROV extends DynamicParameters {
  constructor() {
    super()
    const M = [
      [this.mass - this.Xdu * K, 0, 0, 0, 0, 0],
      [0, this.mass - this.Ydv * K, 0, 0, 0, 0],
      [0, 0, this.mass - this.Zdw * K, 0, 0, 0],
      [0, 0, 0, this.Ix - this.Kdp * K, 0, 0],
      [0, 0, 0, 0, this.Iy - this.Mdq * K, 0],
      [0, 0, 0, 0, 0, this.Iz - this.Ndr * K],
    ]
    const M_ = inv(M)
    this.M = nj.array(M)
    this.M_ = nj.array(M_)
    this.state = nj.array(
      [0, 0, 0, pi * 0.0, pi * 0.0, pi * 0.0, 0, 0, 0, 0, 0, 0],
      'float32'
    )
    this.f = nj.array([0, 0, 0, 0, 0, 0], 'float32')
    this.t = [0.0]
    this.X = [nj.array(this.state)]
    this.last_state = nj.array(this.state)
  }

  dxdt(state) {
    let f = this.f
    let tempArray = state.slice(6)
    let u = tempArray.get(0)
    let v = tempArray.get(1)
    let w = tempArray.get(2)
    let p = tempArray.get(3)
    let q = tempArray.get(4)
    let r = tempArray.get(5)
    const W = this.mass * g
    let B = this.fbl

    tempArray = this.position_mass
    let xg = tempArray.get(0)
    let yg = tempArray.get(1)
    let zg = tempArray.get(2)

    tempArray = this.position_fbl
    let xb = tempArray.get(0)
    let yb = tempArray.get(1)
    let zb = tempArray.get(2)
    let m = this.mass
    let Ix = this.Ix
    let Iy = this.Iy
    let Iz = this.Iz

    tempArray = state.slice([3, 6])
    let x4 = tempArray.get(0)
    let x5 = tempArray.get(1)
    let x6 = tempArray.get(2)
    let c6 = cos(x6)
    let c5 = cos(x5)
    let c4 = cos(x4)
    let s4 = sin(x4)
    let s5 = sin(x5)
    let s6 = sin(x6)

    let M_ = this.M_ // 惯性矩阵

    let c = [
      [0, 0, 0, 0, (m - this.Zdw * K) * w, -(m - this.Ydv * K) * v],
      [0, 0, 0, -(m - this.Zdw * K) * w, 0, (m - this.Xdu * K) * u],
      [0, 0, 0, (m - this.Ydv * K) * v, -(m - this.Xdu * K) * u, 0],
      [
        0,
        (m - this.Zdw * K) * w,
        -(m - this.Ydv * K) * v,
        0,
        (Iz - this.Ndr * K) * r,
        -(Iy - this.Mdq * K) * q,
      ],
      [
        -(m - this.Zdw * K) * w,
        0,
        (m - this.Xdu * K) * u,
        -(Iz - this.Ndr * K) * r,
        0,
        (Ix - this.Kdp * K) * p,
      ],
      [
        (m - this.Ydv * K) * v,
        -(m - this.Xdu * K) * u,
        0,
        (Iy - this.Mdq * K) * q,
        -(Ix - this.Kdp * K) * p,
        0,
      ],
    ]
    let C = nj.array(c) // 阻尼矩阵

    let Gg = [
      [(W - B) * s5],
      [-(W - B) * c5 * s4],
      [-(W - B) * c5 * c4],
      [-(yg * W - yb * B) * c5 * c4 + (zg * W - zb * B) * c5 * s4],
      [(zg * W - zb * B) * s5 + (xg * W - xb * B) * c5 * c4],
      [-(xg * W - xb * B) * c5 * s4 - (yg * W - yb * B) * s5],
    ]
    let G = nj.array(Gg) // 精力学矩阵

    let d = [
      [this.Xu + this.Xuabsu * Math.abs(u), 0, 0, 0, 0, 0],
      [0, this.Yv + this.Yvabsv * Math.abs(v), 0, 0, 0, 0],
      [0, 0, this.Zw + this.Zwabsw * Math.abs(w), 0, 0, 0],
      [0, 0, 0, this.Kp + this.Kpabsp * Math.abs(p), 0, 0],
      [0, 0, 0, 0, this.Mq + this.Mqabsq * Math.abs(q), 0],
      [0, 0, 0, 0, 0, this.Nr + this.Nrabsr * Math.abs(r)],
    ]
    let D = nj.array(d).multiply(-K) // 惯性流体力矩阵

    let C_ = C.dot(state.slice([6, 12]).reshape(-1, 1)).multiply(-1)
    C_ = C_.add(G)
      .subtract(D.dot(state.slice([6, 12]).reshape(-1, 1)))
      .add(f.reshape(-1, 1))

    let a = M_.dot(C_)
    let T = nj.array([
      [c6 * c5, -s6 * c4 + c6 * s5 * s4, s6 * s4 + c6 * c4 * s5, 0, 0, 0],
      [s6 * c5, c6 * c4 + s4 * s5 * s6, -c6 * s4 + c4 * s5 * s6, 0, 0, 0],
      [-s5, c5 * s4, c5 * c4, 0, 0, 0],
      [0, 0, 0, 1, s4 * tan(x5), c4 * tan(x5)],
      [0, 0, 0, 0, c4, -s4],
      [0, 0, 0, 0, s4 / c5, c4 / c5],
    ]) // 旋转变换矩阵

    let sa = T.dot(state.slice([6, 12]).reshape(-1, 1))
    
    let aArray = a.selection.data
    let saArray = sa.selection.data
    let dxdtArray = saArray.concat(aArray)
    return nj.array(dxdtArray)
  }

  ode45(h) {
    let k1 = this.dxdt(this.state).multiply(h)
    let temp = this.state.add(k1.multiply(0.5))
    let k2 = this.dxdt(temp).multiply(h)
    temp = this.state.add(k2.multiply(0.5))
    let k3 = this.dxdt(temp).multiply(h)
    temp = this.state.add(k3)
    let k4 = this.dxdt(temp).multiply(h)
    this.state = this.state.add(
        k1.add(
            k2.multiply(2)
        ).add(
            k3.multiply(2)
        ).add(k4).divide(6)
    )
  }

  step(n_step, action = nj.zeros((6, 1))) {
    this.f = action
    this.t = this.t.slice(-1)
    for (let i = 0; i < n_step; i++) {
      this.ode45(dt)
      this.t.push(this.t.slice(-1) + dt)
    }
    const deta_state = this.state.subtract(this.last_state)
    this.last_state = this.state
    return deta_state
  }

  reset(state) {
    this.state = nj.array(state, 'float32')
    this.f = nj.array([0, 0, 0, 0, 0, 0], 'float32')
    this.t = [0.0]
    this.X = this.state.selection.data
    this.last_state = this.state
  }
}

const rov = new ROV()
// const action = nj.array([0.0, 0.0, 0.0, 0.0, 0.0, 0.0])
// const x = rov.step(400, action)
// console.log(x)


export default rov