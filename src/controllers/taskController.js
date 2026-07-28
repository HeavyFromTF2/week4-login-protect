const taskRepository = require('../repositories/taskRepository');

const taskController = {
  async getAllTasks(req, res) {
    try {
      const tasks = await taskRepository.findAll(req.query);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getTaskById(req, res) {
    try {
      const task = await taskRepository.findById(req.params.id);
      if (!task) return res.status(404).json({ error: 'Task not found' });
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

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