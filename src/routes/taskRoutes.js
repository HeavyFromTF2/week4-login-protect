/**
 * Task Router.
 * Maps /tasks endpoints to taskController methods with authentication middleware protection.
 */

const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authenticateToken = require('../middlewares/authMiddleware');

// Protect all task endpoints with JWT authentication middleware
router.use(authenticateToken);

// GET /tasks - Fetch all tasks
router.get('/', taskController.getAllTasks);

// POST /tasks - Create a new task
router.post('/', taskController.createTask);

// GET /tasks/:id - Fetch a single task by ID
router.get('/:id', taskController.getTaskById);

// PUT /tasks/:id - Update an existing task
router.put('/:id', taskController.updateTask);

// DELETE /tasks/:id - Delete a task by ID
router.delete('/:id', taskController.deleteTask);

module.exports = router;