const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/database');
const db = require('./models');
const authRoutes = require('./routes/auth.routes');
const propertyRoutes = require('./routes/property.routes');
const userRoutes = require('./routes/user.routes');
const registerRequestRoutes = require('./routes/registerRequest.routes');
const cityRoutes = require('./routes/city.routes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3333',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection and sync
const initializeDatabase = async () => {
  await connectDB();

  // Sync all models with database
  // Changed from { alter: true } to { alter: false } to prevent index duplication
  // Use migrations for schema changes in production
  await db.sequelize.sync({ alter: false });
  console.log('Database synced successfully');
};

initializeDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/register-requests', registerRequestRoutes);
app.use('/api/cities', cityRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Apartment Management API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
