float d2u_dphi2(float u, float rs) {
  return -u + 1.5 * rs * u * u;
}

// Performs a single RK4 step for the second-order ODE d2u/dphi2 = f(u) = - u + 1.5 * rs * u^2
// h = step size in phi (delta phi), uPrime = du/dphi, rs = Schwarzschild radius
// refer to: https://en.wikipedia.org/wiki/Schwarzschild_geodesics
void rk4StepSecondOrder(inout float u, inout float uPrime, float h, float rs) {
  float uPrime0 = uPrime;
  float k1 = d2u_dphi2(u, rs);
  float k2 = d2u_dphi2(u + 0.5 * h * uPrime0, rs);
  float k3 = d2u_dphi2(u + 0.5 * h * uPrime0 + 0.25 * h * h * k1, rs);
  float k4 = d2u_dphi2(u + h * uPrime0 + 0.5 * h * h * k2, rs);

  uPrime += (h / 6.0) * (k1 + 2.0 * k2 + 2.0 * k3 + k4);
  u += h * uPrime0 + (h * h / 6.0) * (k1 + k2 + k3);
}
