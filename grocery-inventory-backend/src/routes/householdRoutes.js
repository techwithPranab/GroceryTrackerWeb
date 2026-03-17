'use strict';

const express = require('express');
const router = express.Router();
const householdController = require('../controllers/householdController');
const { authenticate, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

router.use(authenticate);

router.post(
  '/',
  [body('name').trim().notEmpty().withMessage('Household name is required')],
  validate,
  householdController.createHousehold
);

router.get('/', householdController.getHousehold);
router.get('/members', householdController.getMembers);
router.get('/activity', householdController.getActivityLog);

router.post(
  '/invite',
  [body('email').isEmail().withMessage('Valid email is required').normalizeEmail()],
  validate,
  householdController.inviteMember
);

router.patch(
  '/members/:memberId/role',
  authorize('admin'),
  [body('role').isIn(['admin', 'member']).withMessage('Role must be admin or member')],
  validate,
  householdController.updateMemberRole
);

module.exports = router;
