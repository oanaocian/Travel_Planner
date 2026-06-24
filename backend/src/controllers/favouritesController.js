const db = require('../config/db');

// GET all favourites
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT favourites.id, destinations.name, destinations.country,
            destinations.id as destination_id, destinations.image_url
            FROM favourites
            JOIN destinations ON favourites.destination_id = destinations.id
            WHERE favourites.user_id = ?`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// POST add to favourites
exports.add = async (req, res) => {
  const { destination_id } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO favourites (user_id, destination_id) VALUES (?, ?)',
      [req.user.id, destination_id]
    );
    res.status(201).json({ message: 'Added to favourites', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// DELETE favourite
exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(
      'DELETE FROM favourites WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Favourite not found or not authorized' });
    }

    res.json({ message: 'Removed from favourites' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};