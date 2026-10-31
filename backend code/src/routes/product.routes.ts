import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { UserRole } from '../types/roles';
import {
  createProductSchema,
  updateProductSchema,
  listProductQuerySchema,
} from '../schemas/product.schema';
import { idParamSchema } from '../schemas/common.schema';

const router = Router();

// Public can list active products
router.get(
  '/',
  validate({ query: listProductQuerySchema }),
  ProductController.listProducts
);

router.get(
  '/:id',
  validate({ params: idParamSchema }),
  ProductController.getProductById
);

// Admin/Staff only for modification
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.STAFF),
  validate({ body: createProductSchema }),
  ProductController.createProduct
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.STAFF),
  validate({ params: idParamSchema, body: updateProductSchema }),
  ProductController.updateProduct
);

export default router;

