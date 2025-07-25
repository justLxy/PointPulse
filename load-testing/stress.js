import http from 'k6/http';
import { check, group, sleep } from 'k6';

const BASE = __ENV.BASE_URL || 'http://localhost:8000';
const LOGIN_USER = __ENV.LOGIN_USER || 'cashier1';
const LOGIN_PASS = __ENV.LOGIN_PASS || '123';

const TARGET_UTORIDS = (__ENV.PURCHASE_UTORIDS || 'regular1,regular2,regular3').split(',');

export const options = {
  stages: [
    { duration: '1m', target: 20 },   // warm-up
    { duration: '2m', target: 50 },   // moderate load
    { duration: '2m', target: 100 },  // heavy load
    { duration: '2m', target: 150 },  // breakpoint load
    { duration: '2m', target: 200 },  // extreme load
    { duration: '2m', target: 0 },    // cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1500'],   // allow slower p95 under stress (adjusted from 600ms)
    http_req_failed:   ['rate<0.02'],   // <2% errors acceptable
  },
};

export default function () {
  // Authenticate
  const loginRes = http.post(`${BASE}/auth/tokens`, JSON.stringify({
    utorid: LOGIN_USER,
    password: LOGIN_PASS,
  }), { headers: { 'Content-Type': 'application/json' } });

  check(loginRes, { 'login 200': (r) => r.status === 200 });
  if (loginRes.status !== 200) {
    sleep(1);
    return;
  }

  const token = loginRes.json().token;
  const authHeaders = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };

  // Randomly pick a scenario to increase realism
  const rnd = Math.random();

  if (rnd < 0.4) {
    // Read-heavy scenario
    check(http.get(`${BASE}/products`, authHeaders), { 'products 200': (r) => r.status === 200 });
    check(http.get(`${BASE}/promotions`, authHeaders), { 'promotions 200': (r) => r.status === 200 });
  } else if (rnd < 0.8) {
    // Write scenario: purchase
    const spent = Math.floor(Math.random() * 5000 + 200) / 100; // 2.00 – 50.00
    const txRes = http.post(`${BASE}/transactions`, JSON.stringify({
      type: 'purchase',
      utorid: TARGET_UTORIDS[Math.floor(Math.random() * TARGET_UTORIDS.length)],
      spent,
      promotionIds: [],
      remark: 'k6 stress test',
    }), authHeaders);
    check(txRes, { 'txn 201': (r) => r.status === 201 });
  } else {
    // Mixed: fetch user profile
    const meRes = http.get(`${BASE}/users/me`, authHeaders);
    check(meRes, { 'me 200': (r) => r.status === 200 });
  }

  sleep(0.5);
} 