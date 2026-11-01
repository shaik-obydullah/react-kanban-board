const Card = require('../models/Card');
const List = require('../models/List');

exports.createCard = async (req, res) => {
  try {
    const { listId, title } = req.body;
    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const cardCount = await Card.countDocuments({ list: listId });
    const card = await Card.create({
      title,
      list: listId,
      board: list.board,
      position: cardCount
    });

    list.cards.push(card._id);
    await list.save();

    const populatedCard = await Card.findById(card._id)
      .populate('members', 'name email avatar');
    res.status(201).json(populatedCard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id)
      .populate('members', 'name email avatar')
      .populate('list', 'title');
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }
    res.json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCard = async (req, res) => {
  try {
    const { title, description, labels, dueDate, completed, checklist } = req.body;
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    if (title !== undefined) card.title = title;
    if (description !== undefined) card.description = description;
    if (labels !== undefined) card.labels = labels;
    if (dueDate !== undefined) card.dueDate = dueDate;
    if (completed !== undefined) card.completed = completed;
    if (checklist !== undefined) card.checklist = checklist;

    await card.save();

    const populatedCard = await Card.findById(card._id)
      .populate('members', 'name email avatar')
      .populate('list', 'title');
    res.json(populatedCard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    await List.findByIdAndUpdate(card.list, { $pull: { cards: card._id } });
    await card.deleteOne();

    res.json({ message: 'Card deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.moveCard = async (req, res) => {
  try {
    const { newListId, position } = req.body;
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    if (card.list.toString() !== newListId) {
      await List.findByIdAndUpdate(card.list, { $pull: { cards: card._id } });
      await List.findByIdAndUpdate(newListId, { $push: { cards: card._id } });
      card.list = newListId;
    }

    card.position = position;
    await card.save();

    res.json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.assignMember = async (req, res) => {
  try {
    const { userId, remove } = req.body;
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    if (remove) {
      card.members = card.members.filter(m => m.toString() !== userId);
    } else if (!card.members.includes(userId)) {
      card.members.push(userId);
    }

    await card.save();
    const populatedCard = await Card.findById(card._id)
      .populate('members', 'name email avatar')
      .populate('list', 'title');
    res.json(populatedCard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCardPositions = async (req, res) => {
  try {
    const { cards } = req.body;
    const updates = cards.map((card, index) =>
      Card.findByIdAndUpdate(card.id, { position: index })
    );
    await Promise.all(updates);
    res.json({ message: 'Cards reordered' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
