import 'dotenv/config';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const connectionString = process.env['DATABASE_URL'];
if (!connectionString) throw new Error('DATABASE_URL is not set');

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const DEFAULT_PASSWORD = 'Password123!';
const BCRYPT_ROUNDS = 10;

faker.seed(42); // детерминированный seed для воспроизводимости

const SYSTEM_NAMES = [
  { name: 'Интернет-банк', module: 'web-ib' },
  { name: 'Мобильное приложение', module: 'mobile' },
  { name: 'АБС Ядро', module: 'abs-core' },
  { name: 'Платёжный шлюз', module: 'payment-gw' },
  { name: 'Процессинг карт', module: 'card-proc' },
  { name: 'CRM операторов', module: 'crm' },
];

const CATEGORIES = [
  'Аутентификация',
  'Шифрование данных',
  'Логирование',
  'Сетевая безопасность',
  'Управление доступом',
  'Защита от инъекций',
  'Конфигурация',
  'Уязвимость зависимостей',
];

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
const STATUSES = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CONFIRMED'] as const;

async function main() {
  console.log('🌱 Очистка таблиц...');
  await db.auditLog.deleteMany();
  await db.comment.deleteMany();
  await db.auditResult.deleteMany();
  await db.system.deleteMany();
  await db.user.deleteMany();

  console.log('🌱 Создание пользователей...');
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, BCRYPT_ROUNDS);
  const [admin, l1, l2, l3] = await Promise.all([
    db.user.create({
      data: { email: 'admin@example.com', name: 'Алексей Админов', passwordHash, role: 'ADMIN' },
    }),
    db.user.create({
      data: { email: 'l1@example.com', name: 'Иван L1', passwordHash, role: 'L1' },
    }),
    db.user.create({
      data: { email: 'l2@example.com', name: 'Мария L2', passwordHash, role: 'L2' },
    }),
    db.user.create({
      data: { email: 'l3@example.com', name: 'Сергей L3', passwordHash, role: 'L3' },
    }),
  ]);

  console.log('🌱 Создание справочника систем...');
  const systems = await Promise.all(SYSTEM_NAMES.map((s) => db.system.create({ data: s })));

  const analysts = [l1, l2, l3];

  console.log('🌱 Создание аудит-результатов...');
  const resultsCount = 35;
  for (let i = 0; i < resultsCount; i++) {
    const severity = faker.helpers.arrayElement(SEVERITIES);
    const status = faker.helpers.arrayElement(STATUSES);
    const foundAt = faker.date.recent({ days: 90 });
    const dueAt = faker.date.soon({ days: 30, refDate: foundAt });
    const resolvedAt =
      status === 'RESOLVED' || status === 'CONFIRMED'
        ? faker.date.between({ from: foundAt, to: new Date() })
        : null;
    const assignee = faker.helpers.arrayElement(analysts);
    const system = faker.helpers.arrayElement(systems);

    const result = await db.auditResult.create({
      data: {
        title: faker.helpers.arrayElement([
          'Отсутствие MFA для привилегированных учётных записей',
          'Слабое шифрование журналов транзакций',
          'Отсутствие rate-limit на эндпоинте /login',
          'Устаревшая версия OpenSSL с CVE',
          'Логи содержат PII в открытом виде',
          'TLS 1.0 разрешён на балансировщике',
          'SQL injection в endpoint поиска клиента',
          'XSS в поле "комментарий" оператора',
          'Секреты в git истории (обнаружены gitleaks)',
          'IAM роли с избыточными правами *:*',
        ]),
        systemId: system.id,
        category: faker.helpers.arrayElement(CATEGORIES),
        description: faker.lorem.paragraphs({ min: 1, max: 3 }, '\n\n'),
        severity,
        status,
        assigneeId: assignee.id,
        foundAt,
        dueAt,
        resolvedAt,
        riskScore: faker.number.int({ min: 10, max: 100 }),
      },
    });

    // Пара комментариев на часть записей
    if (faker.number.int({ min: 0, max: 3 }) > 1) {
      const commenter = faker.helpers.arrayElement([l2, l3]);
      await db.comment.create({
        data: {
          auditResultId: result.id,
          authorId: commenter.id,
          content: faker.lorem.sentences({ min: 1, max: 3 }),
        },
      });
    }

    // История изменений — начальное создание
    await db.auditLog.create({
      data: {
        entityType: 'AuditResult',
        entityId: result.id,
        action: 'create',
        actorId: assignee.id,
        diff: { status: [null, status], severity: [null, severity] },
      },
    });

    // Случайное обновление статуса
    if (faker.datatype.boolean({ probability: 0.4 })) {
      const newStatus = faker.helpers.arrayElement(STATUSES);
      if (newStatus !== status) {
        await db.auditLog.create({
          data: {
            entityType: 'AuditResult',
            entityId: result.id,
            action: 'status_change',
            actorId: faker.helpers.arrayElement([l2.id, l3.id]),
            diff: { status: [status, newStatus] },
          },
        });
      }
    }
  }

  console.log(`✅ Готово:
  users:    ${4}
  systems:  ${systems.length}
  results:  ${resultsCount}
  accounts: admin@example.com / l1@example.com / l2@example.com / l3@example.com
  password: ${DEFAULT_PASSWORD}
  actors used in logs: admin=${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
