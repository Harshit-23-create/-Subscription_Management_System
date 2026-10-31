import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import fs from 'fs';

const router = Router();

const candidatePaths = [
  path.join(__dirname, '../docs/openapi.json'),
  path.join(__dirname, '../../src/docs/openapi.json'),
  path.join(process.cwd(), 'src/docs/openapi.json'),
  path.join(process.cwd(), 'dist/docs/openapi.json'),
];

let openApiSpec: any = null;

for (const candidate of candidatePaths) {
  if (fs.existsSync(candidate)) {
    try {
      const content = fs.readFileSync(candidate, 'utf-8');
      openApiSpec = JSON.parse(content);
      break;
    } catch {
      // Continue to next candidate
    }
  }
}

if (!openApiSpec) {
  openApiSpec = {
    openapi: '3.1.0',
    info: { title: 'Subscription Management System API', version: '1.0.0' },
    paths: {},
  };
}

// Serve OpenAPI Spec JSON
router.get('/openapi.json', (req, res) => {
  res.json(openApiSpec);
});

// Serve Interactive Swagger UI
router.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

export default router;
