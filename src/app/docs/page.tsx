// Публичная страница с Swagger UI — грузится из CDN, чтобы не тащить тяжёлый пакет в bundle.
// Исключена из proxy (см. src/proxy.ts) настройкой matcher.
export const dynamic = 'force-static';

export default function SwaggerDocsPage() {
  return (
    <html lang="en">
      <head>
        <title>CFT Audit Portal API — Swagger</title>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css"
        />
      </head>
      <body style={{ margin: 0 }}>
        <div id="swagger-ui" />
        <script async src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js" />
        <script
          async
          dangerouslySetInnerHTML={{
            __html: `
              window.onload = function () {
                window.ui = SwaggerUIBundle({
                  url: '/api/docs/openapi.json',
                  dom_id: '#swagger-ui',
                  deepLinking: true,
                  persistAuthorization: true,
                });
              };
            `,
          }}
        />
      </body>
    </html>
  );
}
