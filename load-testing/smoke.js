// Lightweight smoke test to verify that critical endpoints are up.
// Run with: k6 run load-testing/smoke.js

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = __ENV.BASE_URL || 'http://localhost:8000';

export const options = {
  vus: 1,
  duration: '10s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  // Ping public endpoints without authentication
  check(http.get(`${BASE}/products`), {
    'products ok': (r) => r.status === 200,
  });

  // Quick auth flow (optional) -- we don't fail the entire smoke if login is unauthorized
  const loginRes = http.post(`${BASE}/auth/tokens`, JSON.stringify({
    utorid: __ENV.LOGIN_USER || 'cashier1',
    password: __ENV.LOGIN_PASS || '123',
  }), { headers: { 'Content-Type': 'application/json' }, expected_response: false });

  // Accept 200 or 401 as "okay" for smoke purposes
  check(loginRes, { 'login reachable': (r) => r.status === 200 || r.status === 401 });

  sleep(1);
} 