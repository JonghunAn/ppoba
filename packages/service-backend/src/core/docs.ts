import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const SWAGGER_UI_VERSION = '5.11.0';
const CDN_BASE = `https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/${SWAGGER_UI_VERSION}`;

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    // .setTitle(`스웨거 문서 (${getSourceVersion()})`)
    .setTitle(`ppoba main api`)
    .setDescription('backend')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Serve swagger JSON endpoint
  const globalPrefix = '/v1';
  const httpAdapter = app.getHttpAdapter();

  httpAdapter.get(`${globalPrefix}/api-docs/swagger.json`, (_req: any, res: any) => {
    res.type('application/json').send(document);
  });

  // Serve Swagger UI HTML from CDN (no local swagger-ui-dist files needed)
  httpAdapter.get(`${globalPrefix}/api-docs`, (_req: any, res: any) => {
    res.type('text/html').send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ppoba API Docs</title>
  <link rel="stylesheet" href="${CDN_BASE}/swagger-ui.min.css" />
  <style>html { box-sizing: border-box; overflow-y: scroll; } body { margin: 0; background: #fafafa; }</style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="${CDN_BASE}/swagger-ui-bundle.min.js"></script>
  <script src="${CDN_BASE}/swagger-ui-standalone-preset.min.js"></script>
  <script>
    window.onload = function () {
      SwaggerUIBundle({
        url: '${globalPrefix}/api-docs/swagger.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        plugins: [SwaggerUIBundle.plugins.DownloadUrl],
        layout: 'StandaloneLayout',
      });
    };
  </script>
</body>
</html>`);
  });
}
