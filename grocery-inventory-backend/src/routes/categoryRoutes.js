'use strict';

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// All authenticated users can read categories
router.get('/', categoryController.getAll);

// Only admins can create, update or delete categories
router.post('/',     authorize('admin', 'superadmin'), categoryController.create);
router.put('/:id',   authorize('admin', 'superadmin'), categoryController.update);
router.delete('/:id',authorize('admin', 'superadmin'), categoryController.remove);

module.exports = router;
