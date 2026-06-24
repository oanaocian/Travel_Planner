const db = require('../config/db');

// GET all trips for logged in user
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT trips.*, destinations.name as destination_name, 
       destinations.country as destination_country
       FROM trips 
       JOIN destinations ON trips.destination_id = destinations.id
       WHERE trips.user_id = ?`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// GET single trip with all activities
exports.getOne = async (req, res) => {
  const { id } = req.params;
  try {
    const [trips] = await db.query(
      `SELECT trips.*, destinations.name as destination_name,
       destinations.country as destination_country,
       destinations.latitude as destination_latitude,
       destinations.longitude as destination_longitude
       FROM trips
       JOIN destinations ON trips.destination_id = destinations.id
       WHERE trips.id = ? AND trips.user_id = ?`,
      [id, req.user.id]
    );

    if (trips.length === 0) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const [activities] = await db.query(
      'SELECT * FROM activities WHERE trip_id = ? ORDER BY day_number, start_time',
      [id]
    );

    const days = {};
    activities.forEach(activity => {
      if (!days[activity.day_number]) {
        days[activity.day_number] = [];
      }
      days[activity.day_number].push(activity);
    });

    res.json({ ...trips[0], days });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// GET all public trips (no auth required)
exports.getPublic = async (req, res) => {
  try {
    const [trips] = await db.query(
      `SELECT trips.*, destinations.name as destination_name,
       destinations.country as destination_country,
       users.username
       FROM trips
       JOIN destinations ON trips.destination_id = destinations.id
       JOIN users ON trips.user_id = users.id
       WHERE trips.is_public = 1
       ORDER BY trips.id DESC`
    );

    // fetch activities for each public trip
    const result = await Promise.all(trips.map(async (trip) => {
      const [activities] = await db.query(
        'SELECT * FROM activities WHERE trip_id = ? ORDER BY day_number, start_time',
        [trip.id]
      );
      const days = {};
      activities.forEach(activity => {
        if (!days[activity.day_number]) days[activity.day_number] = [];
        days[activity.day_number].push(activity);
      });
      return { ...trip, days };
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// PATCH toggle public/private
exports.togglePublic = async (req, res) => {
  const { id } = req.params;
  try {
    const [trips] = await db.query(
      'SELECT is_public FROM trips WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (trips.length === 0) {
      return res.status(404).json({ message: 'Trip not found or not authorized' });
    }

    const newValue = trips[0].is_public ? 0 : 1;

    await db.query(
      'UPDATE trips SET is_public = ? WHERE id = ? AND user_id = ?',
      [newValue, id, req.user.id]
    );

    res.json({ message: 'Updated', is_public: newValue });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// POST create trip
exports.create = async (req, res) => {
  const { destination_id, title, start_date, end_date, currency, description } = req.body;

  if (!destination_id || !title) {
    return res.status(400).json({ message: 'Destination and title are required' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO trips (user_id, destination_id, title, start_date, end_date, currency, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, destination_id, title, start_date, end_date, currency || 'EUR', description]
    );

    res.status(201).json({ message: 'Trip created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// PUT update trip
exports.update = async (req, res) => {
  const { id } = req.params;
  const { title, start_date, end_date, currency, description } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE trips SET title = ?, start_date = ?, end_date = ?, 
       currency = ?, description = ?
       WHERE id = ? AND user_id = ?`,
      [title, start_date, end_date, currency, description, id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Trip not found or not authorized' });
    }

    res.json({ message: 'Trip updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// DELETE trip
exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(
      'DELETE FROM trips WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Trip not found or not authorized' });
    }

    res.json({ message: 'Trip deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// POST copy a public trip to current user's account
exports.copyTrip = async (req, res) => {
  const { id } = req.params;
  try {
    // verify trip exists and is public
    const [trips] = await db.query(
      `SELECT trips.*, destinations.name as destination_name
       FROM trips
       JOIN destinations ON trips.destination_id = destinations.id
       WHERE trips.id = ? AND trips.is_public = 1`,
      [id]
    );

    if (trips.length === 0) {
      return res.status(404).json({ message: 'Trip not found or not public' });
    }

    const original = trips[0];

    // create new trip for current user — private by default
    const [result] = await db.query(
      `INSERT INTO trips (user_id, destination_id, title, start_date, end_date, currency, description, is_public)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [req.user.id, original.destination_id, `${original.title} (copy)`, 
        original.start_date, original.end_date, original.currency, original.description]
    );

    const newTripId = result.insertId;

    // copy all activities
    const [activities] = await db.query(
      'SELECT * FROM activities WHERE trip_id = ?',
      [id]
    );

    if (activities.length > 0) {
      const values = activities.map(a =>
        [newTripId, a.name, a.category, a.day_number, a.start_time, a.price, a.notes, a.latitude, a.longitude]
      );
      await db.query(
        `INSERT INTO activities (trip_id, name, category, day_number, start_time, price, notes, latitude, longitude)
         VALUES ?`,
        [values]
      );
    }

    res.status(201).json({ message: 'Trip copied', id: newTripId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};