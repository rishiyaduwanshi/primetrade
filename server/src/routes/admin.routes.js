import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.mid.js';
import UserModel from '../models/user.model.js';
import appResponse from '../utils/appResponse.js';
import { NotFoundError } from '../utils/appError.js';
import { validate } from '../middlewares/validate.mid.js';
import { updateRoleSchema } from '../utils/schemas.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', async (req, res, next) => {
    try {
        const users = await UserModel.find().select('-password -refreshToken').sort({ createdAt: -1 });
        appResponse(res, { message: 'Users fetched successfully', data: users });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/v1/admin/users/{id}/role:
 *   patch:
 *     summary: Update user role (admin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: Role updated
 */
router.patch('/users/:id/role', validate(updateRoleSchema), async (req, res, next) => {
    try {
        const { role } = req.body;

        const user = await UserModel.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password -refreshToken');

        if (!user) throw new NotFoundError('User not found');

        appResponse(res, { message: 'User role updated', data: user });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete('/users/:id', async (req, res, next) => {
    try {
        if (req.params.id === req.user.id) throw new BadRequestError('Cannot delete yourself');

        const user = await UserModel.findByIdAndDelete(req.params.id);
        if (!user) throw new NotFoundError('User not found');

        appResponse(res, { message: 'User deleted successfully', data: {} });
    } catch (error) {
        next(error);
    }
});

export default router;
