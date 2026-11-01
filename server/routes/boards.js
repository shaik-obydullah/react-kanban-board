const express = require('express');
const router = express.Router();
const {
  getMyBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  addMember,
  removeMember
} = require('../controllers/boardController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getMyBoards);
router.post('/', protect, createBoard);
router.get('/:id', protect, getBoard);
router.put('/:id', protect, updateBoard);
router.delete('/:id', protect, deleteBoard);
router.post('/:id/members', protect, addMember);
router.delete('/:id/members/:userId', protect, removeMember);

module.exports = router;
