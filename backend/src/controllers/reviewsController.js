const db = require('../config/db');

// GET all reviews
exports.getAll = async (req, res) => {
    try {
        const[rows] = await db.query(
            `SELECT reviews.id, reviews.rating, reviews.comment, reviews.created_at,
            users.username
            FROM reviews
            JOIN users ON reviews.user_id = users.id
            WHERE reviews.destination_id = ?`,
            [req.params.destination_id]
        );
        res.json(rows);
    } catch(error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// POST add review
exports.add = async (req, res) => {
    const { rating, comment } = req.body;
    const { destination_id } = req.params;
    try {
        const [result] = await db.query(
            'INSERT INTO reviews (user_id, destination_id, rating, comment) VALUES (?, ?, ?, ?)',
            [req.user.id, destination_id, rating, comment]
        );
    res.status(201).json({ message: 'Review added!', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// DELETE review
exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(
      'DELETE FROM reviews WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};