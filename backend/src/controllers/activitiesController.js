const db = require('../config/db');
const axios = require('axios');

//functie pentru geocode 
const geocode = async (query) => {
  try {
    const response = await axios.get(
      'https://nominatim.openstreetmap.org/search', {
      params: { q: query, format: 'json', limit: 1 },
      headers: { 'User-Agent': 'TravelPlannerApp' }
    }
    );
    if(response.data.length > 0) {
      return{
        latitude: response.data[0].lat,
        longitude: response.data[0].lon
      };
    }
  } catch(err) {
    console.log('Geocoding failed: ', err.message);
  }
  return { latitude: null, longitude: null };
};

// POST create activity
exports.create = async (req, res) => {
  const { tripId } = req.params;
  const { name, category, day_number, start_time, price, notes} = req.body;

  if (!name || !day_number) {
    return res.status(400).json({ message: 'Name and day number are required' });
  }

  try {
    const [trips] = await db.query(
      `SELECT destinations.name as city, destinations.country
      FROM trips
      JOIN destinations ON trips.destination_id = destinations.id
      WHERE trips.id = ? AND trips.user_id = ?`,
      [tripId, req.user.id]
    );

    if(trips.length === 0) {
      return res.status(404).json({ message: 'Trip not found or not authorized' });
    } 

    const{ latitude, longitude } = await geocode(`${name}, ${trips[0].city}, ${trips[0].country}`);

    const [result] = await db.query(
      `INSERT INTO activities 
        (trip_id, name, category, day_number, start_time, latitude, longitude, price, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tripId, name, category || 'other', day_number, start_time, latitude, longitude, price || 0, notes]
    );

    res.status(201).json({ message: 'Activity added', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// PUT update activity
exports.update = async (req, res) => {
  const { id } = req.params;
  const { name, category, day_number, start_time, price, notes} = req.body;

  try {
    const[activities] = await db.query(
      `SELECT destinations.name as city, destinations.country
      FROM activities
      JOIN trips ON activities.trip_id = trips.id
      JOIN destinations ON trips.destination_id = destinations.id
      WHERE activities.id = ?`,
      [id]
    );

    const searchQuery = activities.length > 0
      ?`${name}, ${activities[0].city}, ${activities[0].country}`
      : name;

    const{ latitude, longitude } = await geocode(searchQuery);

    const [result] = await db.query(
      `UPDATE activities SET name = ?, category = ?, day_number = ?,
       start_time = ?, latitude = ?, longitude = ?, price = ?, notes = ?
       WHERE id = ? AND trip_id IN (SELECT id FROM trips WHERE user_id = ?)`,
      [name, category, day_number, start_time, latitude, longitude, price, notes, id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Activity not found or not authorized' });
    }

    res.json({ message: 'Activity updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// DELETE activity
exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(
      `DELETE FROM activities WHERE id = ? 
       AND trip_id IN (SELECT id FROM trips WHERE user_id = ?)`,
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Activity not found or not authorized' });
    }

    res.json({ message: 'Activity deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// GET cost breakdown for a trip
exports.getCost = async (req, res) => {
  const { tripId } = req.params;
  try {
    const [trips] = await db.query(
      'SELECT id FROM trips WHERE id = ? AND user_id = ?',
      [tripId, req.user.id]
    );
    if (trips.length === 0) {
      return res.status(404).json({ message: 'Trip not found or not authorized' });
    }

    const [rows] = await db.query(
      `SELECT category, SUM(price) as total
       FROM activities WHERE trip_id = ?
       GROUP BY category`,
      [tripId]
    );

    const [totalRow] = await db.query(
      'SELECT SUM(price) as grand_total FROM activities WHERE trip_id = ?',
      [tripId]
    );

    res.json({
      breakdown: rows,
      grand_total: totalRow[0].grand_total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};