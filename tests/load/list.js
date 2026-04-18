// k6 load test — GET /api/audit-results с фильтрами.
// Usage: k6 run tests/load/list.js  (требует Postgres + `pnpm dev` на :3000)
// Порог p95 < 500ms, error rate < 1%.
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

const BASE = __ENV.BASE_URL || 'http://localhost:3000';
const EMAIL = __ENV.TEST_EMAIL || 'l2@example.com';
const PASSWORD = __ENV.TEST_PASSWORD || 'Password123!';

const listLatency = new Trend('list_latency', true);

export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '40s', target: 50 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    'list_latency{kind:list}': ['p(95)<500'],
  },
};

export function setup() {
  const csrfRes = http.get(`${BASE}/api/auth/csrf`);
  const csrf = csrfRes.json('csrfToken');
  const loginRes = http.post(
    `${BASE}/api/auth/callback/credentials`,
    {
      csrfToken: csrf,
      email: EMAIL,
      password: PASSWORD,
      callbackUrl: '/',
      redirect: 'false',
    },
    { redirects: 0 },
  );
  // Auth.js кладёт сессионный токен в cookie authjs.session-token (или __Secure-...).
  const cookies = loginRes.cookies;
  const sessionCookie = Object.entries(cookies).find(([k]) =>
    k.toLowerCase().includes('session-token'),
  );
  if (!sessionCookie) throw new Error('Не удалось получить сессионную куку');
  return { cookieName: sessionCookie[0], cookieValue: sessionCookie[1][0].value };
}

export default function (data) {
  const headers = {
    Cookie: `${data.cookieName}=${data.cookieValue}`,
  };
  const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const sev = severities[Math.floor(Math.random() * severities.length)];
  const res = http.get(
    `${BASE}/api/audit-results?pageSize=20&sortBy=foundAt&sortDir=desc&severity=${sev}`,
    { headers, tags: { kind: 'list' } },
  );
  listLatency.add(res.timings.duration, { kind: 'list' });
  check(res, {
    'status is 200': (r) => r.status === 200,
    'has items': (r) => !!r.json('items'),
  });
  sleep(0.2);
}
