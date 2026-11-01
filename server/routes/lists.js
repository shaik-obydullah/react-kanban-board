const express = require('express');
const router = express.Router();
const {
  createList,
  getLists,
  updateList,
  deleteList,
  updateListPositions
} = require('../controllers/listController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createList);
router.get('/board/:boardId', protect, getLists);
router.put('/positions', protect, updateListPositions);
router.put('/:id', protect, updateList);
router.delete('/:id', protect, deleteList);

module.exports = router;
