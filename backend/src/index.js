const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
const authRoutes = require('./routes/auth');
const destinationsRoutes = require('./routes/destinations');
const tripsRoutes = require('./routes/trips');
const activitiesRoutes = require('./routes/activities');
const favouritesRoutes = require('./routes/favourites');
const reviewsRoutes = require('./routes/reviews');
const profileRoutes = require('./routes/profile');
const recommendationsRoutes = require('./routes/recommendations');

const app = express();

app.use(cors());
app.use(express.json());

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationsRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/trips', activitiesRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/favourites', favouritesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/recommendations', recommendationsRoutes);


// Test route
app.get('/', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ message: 'Server is running and database is connected!' });
  } catch (error) {
    res.status(500).json({ message: 'Database connection failed', error });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});