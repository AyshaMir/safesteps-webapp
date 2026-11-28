const express = require('express');
const { requireAuth } = require('../middleware/auth');

const {
  getPrepare,
  updatePlan,
  updateChecklist,
  addContact,
  updateContact,
  deleteContact,
} = require('../controllers/prepareController');

const router = express.Router();

// All Prepare endpoints require authentication
router.use(requireAuth);

// Preparedness summary
router.get('/', getPrepare);

// Emergency plan
router.put('/plan', updatePlan);

// Kit checklist
router.put('/checklist', updateChecklist);

// Emergency contacts
router.post('/contacts', addContact);
router.put('/contacts/:id', updateContact);
router.delete('/contacts/:id', deleteContact);

module.exports = router;