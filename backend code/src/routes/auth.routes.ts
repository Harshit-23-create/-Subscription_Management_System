import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { UserRole } from '../types/roles';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from '../schemas/auth.schema';

const router = Router();

router.post('/register', validate({ body: registerSchema }), AuthController.register);
router.post('/login', validate({ body: loginSchema }), AuthController.login);
router.post('/refresh-token', validate({ body: refreshTokenSchema }), AuthController.refreshToken);

router.get('/profile', authenticate, AuthController.getProfile);
router.post(
  '/change-password',
  authenticate,
  validate({ body: changePasswordSchema }),
  AuthController.changePassword
);

router.get(
  '/users',
  authenticate,
  authorize(UserRole.ADMIN),
  AuthController.listUsers
);

export default router;

