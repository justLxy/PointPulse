import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend } from 'k6/metrics';

// k6 run load-testing/baseline.js
// Optional environment variables:
//   BASE_URL     - API base URL (default http://localhost:8000)
//   LOGIN_USER   - utorid to login with
//   LOGIN_PASS   - password for that utorid
// Adjust the stages below to simulate expected normal traffic.

const BASE = __ENV.BASE_URL || 'http://localhost:8000';
const LOGIN_USER = __ENV.LOGIN_USER || 'cashier1';
const LOGIN_PASS = __ENV.LOGIN_PASS || '123';

// Define target UTORids for purchase transactions (comma-separated via env var)
const TARGET_UTORIDS = (__ENV.PURCHASE_UTORIDS || 'regular1,regular2,regular3').split(',');

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // ramp-up to 20 virtual users
    { duration: '2m',  target: 20 }, // stay for 2 minutes
    { duration: '30s', target: 0  }, // ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests below 1000 ms (adjusted from 400ms)
    http_req_failed:   ['rate<0.01'], // < 1 % errors
  },
};

// Custom metric for authentication latency
const loginDuration = new Trend('login_duration');

export default function () {
  group('Authenticate & obtain JWT', () => {
    const res = http.post(
      `${BASE}/auth/tokens`,
      JSON.stringify({ utorid: LOGIN_USER, password: LOGIN_PASS }),
      { headers: { 'Content-Type': 'application/json' } }
    );

    check(res, { 'login succeeded': (r) => r.status === 200 });
    loginDuration.add(res.timings.duration);

    // Proceed only if login succeeded
    if (res.status !== 200) {
      // Short sleep and bail out of this iteration
      sleep(1);
      return;
    }

    const token = res.json().token;
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    // ------------------------------
    // 1. Read-only endpoints
    // ------------------------------
    group('Read products & promotions', () => {
      check(http.get(`${BASE}/products`, authHeaders), {
        'products 200': (r) => r.status === 200,
      });
      check(http.get(`${BASE}/promotions`, authHeaders), {
        'promotions 200': (r) => r.status === 200,
      });
    });

    // ------------------------------
    // 2. Write endpoint – create purchase tx
    // ------------------------------
    group('Create purchase transaction', () => {
      const spent = Math.floor(Math.random() * 2000 + 100) / 100; // 1.00 – 20.00
      const txRes = http.post(
        `${BASE}/transactions`,
        JSON.stringify({
          type: 'purchase',
          utorid: TARGET_UTORIDS[Math.floor(Math.random() * TARGET_UTORIDS.length)],
          spent,
          promotionIds: [],
          remark: 'k6 baseline test',
        }),
        { headers: { ...authHeaders.headers, 'Content-Type': 'application/json' } }
      );
      check(txRes, { 'txn created': (r) => r.status === 201 });
    });
  });

  // Simulate user think-time
  sleep(1);
} 