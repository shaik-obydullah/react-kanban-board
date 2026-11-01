const List = require('../models/List');
const Board = require('../models/Board');
const Card = require('../models/Card');

exports.createList = async (req, res) => {
  try {
    const { boardId, title } = req.body;
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const listCount = await List.countDocuments({ board: boardId });
    const list = await List.create({
      title,
      board: boardId,
      position: listCount
    });

    board.lists.push(list._id);
    await board.save();

    res.status(201).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLists = async (req, res) => {
  try {
    const lists = await List.find({ board: req.params.boardId })
      .sort('position')
      .populate({
        path: 'cards',
        options: { sort: { position: 1 } },
        populate: {
          path: 'members',
          select: 'name email avatar'
        }
      });
    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateList = async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    if (req.body.title) {
      list.title = req.body.title;
      await list.save();
    }
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteList = async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    await Card.deleteMany({ list: list._id });
    await Board.findByIdAndUpdate(list.board, { $pull: { lists: list._id } });
    await list.deleteOne();

    res.json({ message: 'List deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateListPositions = async (req, res) => {
  try {
    const { lists } = req.body;
    const updates = lists.map((list, index) =>
      List.findByIdAndUpdate(list.id, { position: index })
    );
    await Promise.all(updates);
    res.json({ message: 'Lists reordered' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
