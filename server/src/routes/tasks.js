const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for logged in user
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
    try {
        const tasks = await pool.query(
            'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );

        res.json(tasks.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a specific task
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
    try {
        const task = await pool.query(
            'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );

        if (task.rows.length === 0) {
            return res.status(404).json({ 
                error: 'Task not found or not authorized' 
            });
        }

        res.json(task.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, status, priority, due_date } = req.body;

        // Validation
        if (!title) {
            return res.status(400).json({ 
                error: 'Title is required' 
            });
        }

        const newTask = await pool.query(
            `INSERT INTO tasks 
             (user_id, title, description, status, priority, due_date) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [req.user.id, title, description, status || 'pending', 
             priority || 'medium', due_date]
        );

        res.status(201).json(newTask.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
router.put('/:id', auth, async (req, res) => {
    try {
        const { title, description, status, priority, due_date } = req.body;

        // First check if task exists and belongs to user
        const taskCheck = await pool.query(
            'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );

        if (taskCheck.rows.length === 0) {
            return res.status(404).json({ 
                error: 'Task not found or not authorized' 
            });
        }

        // Update task
        const updatedTask = await pool.query(
            `UPDATE tasks 
             SET title = COALESCE($1, title),
                 description = COALESCE($2, description),
                 status = COALESCE($3, status),
                 priority = COALESCE($4, priority),
                 due_date = COALESCE($5, due_date),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $6 AND user_id = $7
             RETURNING *`,
            [title, description, status, priority, due_date, 
             req.params.id, req.user.id]
        );

        res.json(updatedTask.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
    try {
        // Check if task exists and belongs to user
        const taskCheck = await pool.query(
            'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );

        if (taskCheck.rows.length === 0) {
            return res.status(404).json({ 
                error: 'Task not found or not authorized' 
            });
        }

        // Delete task
        await pool.query(
            'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );

        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;