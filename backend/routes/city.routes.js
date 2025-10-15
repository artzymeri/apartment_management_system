const express = require('express');
const router = express.Router();
const { getAllCities, createCity, deleteCity, updateCity } = require('../controllers/city.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Public route - get all cities
router.get('/', getAllCities);

// Admin only routes
router.post('/', verifyToken, isAdmin, createCity);
router.put('/:id', verifyToken, isAdmin, updateCity);
router.delete('/:id', verifyToken, isAdmin, deleteCity);

module.exports = router;
