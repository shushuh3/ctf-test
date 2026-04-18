// k6 load test — GET /api/audit-results/[id].
// Ожидания: p95 < 300ms (одна запись по primary key), error rate < 1%.
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

const BASE = __ENV.BASE_URL || 'http://localhost:3000';
const EMAIL = __ENV.TEST_EMAIL || 'l2@example.com';
const PASSWORD = __ENV.TEST_PASSWORD || 'Password123!';

const detailLatency = new Trend('detail_latency', true);

export const options = {
  stages: [
    { duration: '10s', target: 20 },
    { duration: '40s', target: 100 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    'detail_latency{kind:detail}': ['p(95)<300'],
  },
};

export function setup() {
  const csrf = http.get(`${BASE}/api/auth/csrf`).json('csrfToken');
  const loginRes = http.post(
    `${BASE}/api/auth/callback/credentials`,
    { csrfToken: csrf, email: EMAIL, password: PASSWORD, callbackUrl: '/', redirect: 'false' },
    { redirects: 0 },
  );
  const cookies = loginRes.cookies;
  const sessionCookie = Object.entries(cookies).find(([k]) =>
    k.toLowerCase().includes('session-token'),
  );
  if (!sessionCookie) throw new Error('Не удалось получить сессионную куку');
  const headers = { Cookie: `${sessionCookie[0]}=${sessionCookie[1][0].value}` };

  // Грузим первую страницу результатов чтобы собрать 20 валидных id
  const list = http.get(`${BASE}/api/audit-results?pageSize=20`, { headers });
  const ids = list.json('items').map((r) => r.id);
  if (!ids.length) throw new Error('В БД нет аудит-результатов — сначала прогоните сиды');
  return { cookie: headers.Cookie, ids };
}

export default function (data) {
  const id = data.ids[Math.floor(Math.random() * data.ids.length)];
  const res = http.get(`${BASE}/api/audit-results/${id}`, {
    headers: { Cookie: data.cookie },
    tags: { kind: 'detail' },
  });
  detailLatency.add(res.timings.duration, { kind: 'detail' });
  check(res, {
    'status is 200': (r) => r.status === 200,
    'has id': (r) => r.json('id') === id,
  });
  sleep(0.1);
}
