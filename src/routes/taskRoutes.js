/**
 * Task Router.
 * Maps HTTP verbs and URL paths to their corresponding controller functions.
 */

const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Define API routes for /tasks
router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;