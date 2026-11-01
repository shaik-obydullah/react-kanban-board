const express = require('express');
const router = express.Router();
const {
  createCard,
  getCard,
  updateCard,
  deleteCard,
  moveCard,
  assignMember,
  updateCardPositions
} = require('../controllers/cardController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createCard);
router.get('/:id', protect, getCard);
router.put('/:id', protect, updateCard);
router.delete('/:id', protect, deleteCard);
router.put('/:id/move', protect, moveCard);
router.put('/:id/members', protect, assignMember);
router.put('/positions/reorder', protect, updateCardPositions);

module.exports = router;
