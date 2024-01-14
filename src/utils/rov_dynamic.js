import "./numjs.min";

const np = window.nj;
const { sin, cos, tan, atan2, norm, inv, PI: pi } = np;
const rou = 1050;
const Cd = 0.89;
const g = 9.81;
const K = 10000;

const dt = 0.02;
const control_step = 10;

class StructureParameters {
  constructor() {
    this.length = 1;
    this.mass = 900;
    this.fbl = rou * g * 0.8;
    this.Ix = 600;
    this.Iy = 600;
    this.Iz = 400;
    this.position_mass = np.array([0, 0, -0.3]);
    this.position_fbl = np.array([0, 0, 0.3]);
    console.log("StructureParameters init done!");
  }
}

class DynamicParameters extends StructureParameters {
  constructor() {
    super();

    this.Xu = -0.1254;
    this.Xuu = -0.28;
    this.Xuabsu = -0.048;
    this.Xdu = -0.2134;
    this.Xvv = -0.6138;
    this.Xrr = -0.9601;
    this.Xvr = 0.4933;

    this.Yv = -0.221;
    this.Yvv = -0.65;
    this.Ydv = -0.3052;
    this.Ydr = -0.001663;
    this.Yv = -0.4996;
    this.Yr = -0.3811;
    this.Yvabsv = -0.069;
    this.Yrabsv = -0.5514;
    this.Yrabsr = -0.1453;
    this.Ystar = 0.001214;

    this.Zw = -0.25;
    this.Zww = -0.64;
    this.Zwabsw = -0.1732;
    this.Zdw = -0.4889;
    this.Zdq = -0.4229;

    this.Mdw = -0.003689;
    this.Mq = -0.762;
    this.Mdq = -0.02804;
    this.Mqabsq = -0.0679;

    this.Ndv = -0.0007436;
    this.Ndr = -0.02525;
    this.Nr = -0.3552;
    this.Nv = -0.09146;
    this.Ndr = -0.1233;
    this.Nrabsr = -0.042;

    this.Kdp = -0.1233;
    this.Kp = -0.6023;
    this.Kpabsp = -0.044;
    console.log("DynamicParameters init done!");
  }
}

export class ROV extends DynamicParameters {
  constructor() {
    super();
    this.M = np.array([
      [this.mass - this.Xdu * K, 0, 0, 0, 0, 0],
      [0, this.mass - this.Ydv * K, 0, 0, 0, 0],
      [0, 0, this.mass - this.Zdw * K, 0, 0, 0],
      [0, 0, 0, this.Ix - this.Kdp * K, 0, 0],
      [0, 0, 0, 0, this.Iy - this.Mdq * K, 0],
      [0, 0, 0, 0, 0, this.Iz - this.Ndr * K],
    ]);

    this.M_ = inv(this.M);

    this.state = np.array(
      [0, 0, 0, pi * 0.0, pi * 0.5, pi * 0.0, 0, 0, 0, 0, 0, 0],
      { dtype: "float32" }
    );

    this.f = np.zeros((6, 1));
    this.t = [0.0];
    this.X = [np.array(this.state)];
    this.lastState = np.array(this.state);
  }

  dxdt(state) {
    //...计算状态微分
    const f = this.f;
    const [u, v, w, p, q, r] = state.slice(6);

    const W = this.mass * g;
    const B = this.fbl;
    const [xg, yg, zg] = this.position_mass;
    const [xb, yb, zb] = this.position_fbl;

    const m = this.mass;
    const Ix = this.Ix;
    const Iy = this.Iy;
    const Iz = this.Iz;

    const [x4, x5, x6] = state.slice(3, 6);

    const c6 = cos(x6);
    const c5 = cos(x5);
    const c4 = cos(x4);
    const s4 = sin(x4);
    const s5 = sin(x5);
    const s6 = sin(x6);

    const M_ = this.M_;

    const C = np.array([
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
    ]);

    const G = np.array([
      [(W - B) * s5],
      [-(W - B) * c5 * s4],
      [-(W - B) * c5 * c4],
      [-(yg * W - yb * B) * c5 * c4 + (zg * W - zb * B) * c5 * s4],
      [(zg * W - zb * B) * s5 + (xg * W - xb * B) * c5 * c4],
      [-(xg * W - xb * B) * c5 * s4 - (yg * W - yb * B) * s5],
    ]);

    const D = np.array([
      [this.Xu + this.Xuabsu * abs(u), 0, 0, 0, 0, 0],
      [0, this.Yv + this.Yvabsv * abs(v), 0, 0, 0, 0],
      [0, 0, this.Zw + this.Zwabsw * abs(w), 0, 0, 0],
      [0, 0, 0, this.Kp + this.Kpabsp * abs(p), 0, 0],
      [0, 0, 0, 0, this.Mq + this.Mqabsq * abs(q), 0],
      [0, 0, 0, 0, 0, this.Nr + this.Nrabsr * abs(r)],
    ]);

    const a = np.matmul(
      M_,
      np
        .subtract(
          np.subtract(G, np.matmul(D, state.slice(6, 12))),
          np.matmul(C, state.slice(6, 12))
        )
        .concat(f)
    );

    const T = np.array([
      [c6 * c5, -s6 * c4 + c6 * s5 * s4, s6 * s4 + c6 * c4 * s5, 0, 0, 0],
      [s6 * c5, c6 * c4 + s4 * s5 * s6, -c6 * s4 + c4 * s5 * s6, 0, 0, 0],
      [-s5, c5 * s4, c5 * c4, 0, 0, 0],
      [0, 0, 0, 1, s4 * tan(x5), c4 * tan(x5)],
      [0, 0, 0, 0, c4, -s4],
      [0, 0, 0, 0, s4 / c5, c4 / c5],
    ]);

    const sa = np.matmul(T, state.slice(6, 12));
    const dxdt = np.concatenate([sa, a]);

    return dxdt;
  }

  ode45(h) {
    const k1 = h * this.dxdt(this.state);

    const k2 = h * this.dxdt(np.add(this.state, np.multiply(k1, 0.5)));

    const k3 = h * this.dxdt(np.add(this.state, np.multiply(k2, 0.5)));

    const k4 = h * this.dxdt(np.add(this.state, k3));

    this.state = np.add(
      np.multiply(
        np.add(np.add(k1, np.multiply(k2, 2)), np.multiply(k3, 2)),
        1 / 6
      ),
      np.multiply(k4, 1 / 6)
    );

    this.X.push(np.array(this.state));
  }

  step(nStep = control_step, action = np.zeros((6, 1))) {
    console.log(control_step,action);

    this.f = action;
    this.t = [this.t[this.t.length - 1]];
    this.X = [np.array(this.state)];

    for (let i = 0; i < n_step; i++) {
      this.ode45(dt);
      this.t.push(this.t[this.t.length - 1] + dt);
    }

    let state_list = np.array(this.X);
    let deta_state = this.state - this.last_state;
    this.last_state = this.state;

    return deta_state;
  }

  reset(state) {
    this.state = np.array(state, (dtype = np.float32));
    this.f = np.array([0, 0, 0, 0, 0, 0], (dtype = np.float32));
    this.t = [0.0];
    this.X = [np.array(this.state)];
    this.last_state = np.array(this.state);
  }
}
