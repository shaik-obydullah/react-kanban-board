const Board = require('../models/Board');
const List = require('../models/List');
const Card = require('../models/Card');
const User = require('../models/User');

exports.getMyBoards = async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    })
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort('-updatedAt');

    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .populate({
        path: 'lists',
        options: { sort: { position: 1 } },
        populate: {
          path: 'cards',
          options: { sort: { position: 1 } },
          populate: {
            path: 'members',
            select: 'name email avatar'
          }
        }
      });

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const isMember = board.owner._id.toString() === req.user._id.toString() ||
      board.members.some(m => m._id.toString() === req.user._id.toString());

    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBoard = async (req, res) => {
  try {
    const { title, description, background } = req.body;

    const board = await Board.create({
      title,
      description,
      background: background || '#3b82f6',
      owner: req.user._id
    });

    await User.findByIdAndUpdate(req.user._id, { $push: { boards: board._id } });

    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can edit board' });
    }

    board.title = req.body.title || board.title;
    board.description = req.body.description !== undefined ? req.body.description : board.description;
    board.background = req.body.background || board.background;

    await board.save();
    res.json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can delete board' });
    }

    await Card.deleteMany({ board: board._id });
    await List.deleteMany({ board: board._id });
    await User.findByIdAndUpdate(req.user._id, { $pull: { boards: board._id } });
    await board.deleteOne();

    res.json({ message: 'Board deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can add members' });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!board.members.includes(user._id) && board.owner.toString() !== user._id.toString()) {
      board.members.push(user._id);
      await board.save();
    }

    const updatedBoard = await Board.findById(board._id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    res.json(updatedBoard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can remove members' });
    }

    board.members = board.members.filter(
      m => m.toString() !== req.params.userId
    );
    await board.save();

    const updatedBoard = await Board.findById(board._id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    res.json(updatedBoard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
