const db = require('../config/db');
const axios = require('axios');

// GET all destinations
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT destinations.*,
             ROUND(AVG(reviews.rating), 1) as avg_rating,
             COUNT(reviews.id) as review_count
      FROM destinations
      LEFT JOIN reviews ON destinations.id = reviews.destination_id
      WHERE destinations.is_public = TRUE
      GROUP BY destinations.id
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// GET single destination with its attractions
exports.getOne = async (req, res) => {
  const { id } = req.params;
  try {
    const [destinations] = await db.query(
      'SELECT * FROM destinations WHERE id = ?', [id]
    );
    if (destinations.length === 0) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    res.json(destinations[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// POST create destination
exports.create = async (req, res) => {
  const { name, country, description, budget_accommodation, 
    budget_food, budget_transport,budget_activities, currency
  } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  try {
    //da fetch automat coordonatele
    let latitude = null;
    let longitude = null;
    let image_url = null;

    try{
      const geoResponse = await axios.get(
        `https://nominatim.openstreetmap.org/search`, {
          params: { q: `${name}, ${country}`, format: 'json', limit: 1 },
          headers: { 'User-Agent': 'TravelPlannerApp' }
        });
        if(geoResponse.data.length > 0) {
          latitude = geoResponse.data[0].lat;
          longitude = geoResponse.data[0].lon;
        }
    } catch(geoErr) {
      console.log('Could not fetch coordinates:', geoErr.message);
    }

    const [result] = await db.query(
      `INSERT INTO destinations 
        (name, country, description, image_url, budget_accommodation, 
         budget_food, budget_transport, budget_activities, currency, 
         is_custom, created_by_user_id, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?, ?)`,
      [name, country, description, image_url, budget_accommodation,
       budget_food, budget_transport, budget_activities,
       currency || 'EUR', req.user.id, latitude, longitude]
    );

    res.status(201).json({ message: 'Destination created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// DELETE destination
exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(
      'DELETE FROM destinations WHERE id = ? AND created_by_user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Destination not found or not authorized' });
    }

    res.json({ message: 'Destination deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};