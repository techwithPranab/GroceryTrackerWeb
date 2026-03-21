'use strict';

const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// All authenticated users can read locations
router.get('/', locationController.getAll);

// Only admins can create, update or delete locations
router.post('/',     authorize('admin', 'superadmin'), locationController.create);
router.put('/:id',   authorize('admin', 'superadmin'), locationController.update);
router.delete('/:id',authorize('admin', 'superadmin'), locationController.remove);

module.exports = router;
