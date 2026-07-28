/**
 * Task Controller.
 * Handles incoming HTTP requests, validates inputs, and sends HTTP responses.
 */

const taskRepository = require('../repositories/taskRepository');

const taskController = {
  // GET /tasks - Fetch all tasks with optional query filters (?search= or ?done=)
  async getAllTasks(req, res) {
    try {
      const tasks = await taskRepository.findAll(req.query);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // GET /tasks/:id - Fetch a single task by its primary key ID
  async getTaskById(req, res) {
    try {
      const task = await taskRepository.findById(req.params.id);
      if (!task) return res.status(404).json({ error: 'Task not found' });
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // POST /tasks - Create a new task (requires JSON body with 'title')
  async createTask(req, res) {
    try {
      const { title } = req.body;
      if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Title is required' });
      }

      const newTask = await taskRepository.create(title.trim());
      res.status(201).json(newTask);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // PUT /tasks/:id - Update an existing task's title and status
  async updateTask(req, res) {
    try {
      const { title, done } = req.body;
      if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Title is required' });
      }

      const updatedTask = await taskRepository.update(
        req.params.id,
        title.trim(),
        Boolean(done)
      );

      if (!updatedTask) return res.status(404).json({ error: 'Task not found' });
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // DELETE /tasks/:id - Remove a task by ID (returns HTTP 204 No Content)
  async deleteTask(req, res) {
    try {
      const deletedTask = await taskRepository.delete(req.params.id);
      if (!deletedTask) return res.status(404).json({ error: 'Task not found' });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = taskController;