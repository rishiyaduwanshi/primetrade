import Task from '../models/task.model.js';
import appResponse from '../utils/appResponse.js';
import { BadRequestError, NotFoundError } from '../utils/appError.js';

// ── Create Task ──────────────────────────────────────────────────────────────
export const createTask = async (req, res, next) => {
    try {
        const { title, description, status, priority } = req.body;

        if (!title) throw new BadRequestError('Title is required');

        const task = await Task.create({
            title,
            description,
            status,
            priority,
            owner: req.user.id,
        });

        appResponse(res, {
            statusCode: 201,
            message: 'Task created successfully',
            data: task,
        });
    } catch (error) {
        next(error);
    }
};

// ── Get all tasks (user sees own; admin sees all) ────────────────────────────
export const getTasks = async (req, res, next) => {
    try {
        const filter = req.user.role === 'admin' ? {} : { owner: req.user.id };

        const { status, priority, page = 1, limit = 10 } = req.query;
        if (status) filter.status = status;
        if (priority) filter.priority = priority;

        const skip = (Number(page) - 1) * Number(limit);

        const [tasks, total] = await Promise.all([
            Task.find(filter)
                .populate('owner', 'name email role')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Task.countDocuments(filter),
        ]);

        appResponse(res, {
            message: 'Tasks fetched successfully',
            data: {
                tasks,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit)),
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// ── Get single task ──────────────────────────────────────────────────────────
export const getTask = async (req, res, next) => {
    try {
        const filter =
            req.user.role === 'admin'
                ? { _id: req.params.id }
                : { _id: req.params.id, owner: req.user.id };

        const task = await Task.findOne(filter).populate('owner', 'name email role');
        if (!task) throw new NotFoundError('Task not found');

        appResponse(res, { message: 'Task fetched successfully', data: task });
    } catch (error) {
        next(error);
    }
};

// ── Update task ──────────────────────────────────────────────────────────────
export const updateTask = async (req, res, next) => {
    try {
        const { title, description, status, priority } = req.body;

        const filter =
            req.user.role === 'admin'
                ? { _id: req.params.id }
                : { _id: req.params.id, owner: req.user.id };

        const task = await Task.findOneAndUpdate(
            filter,
            { title, description, status, priority },
            { new: true, runValidators: true }
        );

        if (!task) throw new NotFoundError('Task not found');

        appResponse(res, { message: 'Task updated successfully', data: task });
    } catch (error) {
        next(error);
    }
};

// ── Delete task ──────────────────────────────────────────────────────────────
export const deleteTask = async (req, res, next) => {
    try {
        const filter =
            req.user.role === 'admin'
                ? { _id: req.params.id }
                : { _id: req.params.id, owner: req.user.id };

        const task = await Task.findOneAndDelete(filter);
        if (!task) throw new NotFoundError('Task not found');

        appResponse(res, { message: 'Task deleted successfully', data: {} });
    } catch (error) {
        next(error);
    }
};

// ── Admin: get all users' tasks summary ─────────────────────────────────────
export const getAdminStats = async (req, res, next) => {
    try {
        const stats = await Task.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        const total = await Task.countDocuments();

        appResponse(res, {
            message: 'Task stats fetched',
            data: { total, byStatus: stats },
        });
    } catch (error) {
        next(error);
    }
};
