import { z } from 'zod';
import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
  extendZodWithOpenApi,
  type RouteConfig,
} from '@asteasolutions/zod-to-openapi';

// Инициализация Zod с `.openapi()` методом — один раз на приложение.
extendZodWithOpenApi(z);

// Единый реестр. Фичи регистрируют свои роуты через `registerRoute`.
export const openApiRegistry = new OpenAPIRegistry();

export function registerRoute(config: RouteConfig): void {
  openApiRegistry.registerPath(config);
}

export function buildOpenApiDocument() {
  const generator = new OpenApiGeneratorV31(openApiRegistry.definitions);
  return generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'CFT Audit Portal API',
      version: '0.1.0',
      description:
        'Внутренний API для работы с результатами аудитов ИБ. Все даты — в UTC (ISO 8601).',
    },
    servers: [{ url: '/' }],
  });
}
