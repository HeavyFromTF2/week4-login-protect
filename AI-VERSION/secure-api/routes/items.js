const express = require('express');
const { body, param, validationResult } = require('express-validator');
const supabase = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: 'Validation error', details: errors.array() });
    return true;
  }
  return false;
}

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: List all items belonging to the authenticated user
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of items
 *       401:
 *         description: Unauthorized
 */
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: 'Server error', message: error.message });
  return res.json({ items: data });
});

/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     summary: Get a single item by id
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item found
 *       404:
 *         description: Not found
 */
router.get('/:id', [param('id').isUUID().withMessage('Invalid id')], async (req, res) => {
  if (handleValidation(req, res)) return;

  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: 'Server error', message: error.message });
  if (!data) return res.status(404).json({ error: 'Not found', message: 'Item not found' });
  return res.json({ item: data });
});

/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: Create a new item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item created
 *       400:
 *         description: Validation error
 */
router.post(
  '/',
  [
    body('title').isString().trim().notEmpty().withMessage('Title is required'),
    body('description').optional().isString().trim(),
  ],
  async (req, res) => {
    if (handleValidation(req, res)) return;

    const { title, description } = req.body;

    const { data, error } = await supabase
      .from('items')
      .insert({ title, description: description || null, user_id: req.user.id })
      .select('*')
      .single();

    if (error) return res.status(500).json({ error: 'Server error', message: error.message });
    return res.status(201).json({ item: data });
  }
);

/**
 * @swagger
 * /api/items/{id}:
 *   put:
 *     summary: Update an existing item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
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
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item updated
 *       404:
 *         description: Not found
 */
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid id'),
    body('title').optional().isString().trim().notEmpty(),
    body('description').optional().isString().trim(),
  ],
  async (req, res) => {
    if (handleValidation(req, res)) return;

    const updates = {};
    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.description !== undefined) updates.description = req.body.description;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('*')
      .maybeSingle();

    if (error) return res.status(500).json({ error: 'Server error', message: error.message });
    if (!data) return res.status(404).json({ error: 'Not found', message: 'Item not found' });
    return res.json({ item: data });
  }
);

/**
 * @swagger
 * /api/items/{id}:
 *   delete:
 *     summary: Delete an item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item deleted
 *       404:
 *         description: Not found
 */
router.delete('/:id', [param('id').isUUID().withMessage('Invalid id')], async (req, res) => {
  if (handleValidation(req, res)) return;

  const { data, error } = await supabase
    .from('items')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select('id')
    .maybeSingle();

  if (error) return res.status(500).json({ error: 'Server error', message: error.message });
  if (!data) return res.status(404).json({ error: 'Not found', message: 'Item not found' });
  return res.json({ message: 'Item deleted', id: data.id });
});

module.exports = router;
