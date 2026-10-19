const express = require('express');
const router  = express.Router();
const pool    = require('./db');

// GET all issues
router.get('/', async function(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM issues ORDER BY votes DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

// GET one issue by ID
router.get('/:id', async function(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM issues WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch issue' });
  }
});

// POST new issue
router.post('/', async function(req, res) {
  const { title, category, location, description, photo } = req.body;

  if (!title || !category || !location || !description) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO issues (title, category, location, description, photo)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, category, location, description, photo || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create issue' });
  }
});

// PATCH upvote
router.patch('/:id/upvote', async function(req, res) {
  try {
    const result = await pool.query(
      `UPDATE issues
       SET votes = votes + 1
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upvote' });
  }
});

// PATCH status (admin)
router.patch('/:id/status', async function(req, res) {
  const { status } = req.body;
  const allowed = ['pending', 'in-progress', 'resolved'];

  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const result = await pool.query(
      `UPDATE issues
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;