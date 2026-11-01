require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Board = require('../models/Board');
const List = require('../models/List');
const Card = require('../models/Card');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding');

    await Promise.all([
      User.deleteMany({}),
      Board.deleteMany({}),
      List.deleteMany({}),
      Card.deleteMany({})
    ]);
    console.log('Collections cleared');

    const demoUser = await User.create({
      name: 'Demo User',
      email: 'demo@trailo.com',
      password: 'demo123',
      title: 'Project Manager'
    });
    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@trailo.com',
      password: 'admin123',
      title: 'Administrator'
    });
    console.log('Users created: demo@trailo.com / demo123, admin@trailo.com / admin123');

    const board = await Board.create({
      title: 'Product Launch',
      description: 'Plan and track the launch of our new mobile app',
      background: '#3b82f6',
      owner: demoUser._id,
      members: [adminUser._id]
    });

    const lists = await Promise.all([
      List.create({ title: 'Backlog', board: board._id, position: 0 }),
      List.create({ title: 'To Do', board: board._id, position: 1 }),
      List.create({ title: 'In Progress', board: board._id, position: 2 }),
      List.create({ title: 'Done', board: board._id, position: 3 })
    ]);

    board.lists = lists.map(l => l._id);
    await board.save();

    const cardsData = [
      {
        list: lists[0]._id,
        title: 'Research competitor apps',
        description: 'Analyze top 5 competitor mobile apps to identify feature gaps',
        labels: ['blue'],
        position: 0
      },
      {
        list: lists[0]._id,
        title: 'Define target audience personas',
        description: 'Create detailed user personas for our target market',
        labels: ['purple'],
        position: 1,
        members: [adminUser._id]
      },
      {
        list: lists[1]._id,
        title: 'Design onboarding flow',
        description: 'Create wireframes for the app onboarding experience',
        labels: ['orange'],
        position: 0,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        list: lists[1]._id,
        title: 'Set up CI/CD pipeline',
        description: 'Configure automated build and deployment pipeline',
        labels: ['green'],
        position: 1,
        checklist: [
          { text: 'Configure build server', checked: true },
          { text: 'Set up staging environment', checked: false },
          { text: 'Configure auto-deploy', checked: false }
        ]
      },
      {
        list: lists[2]._id,
        title: 'Implement user authentication',
        description: 'Build login and registration with social auth options',
        labels: ['red', 'green'],
        position: 0,
        members: [demoUser._id],
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        checklist: [
          { text: 'Email registration', checked: true },
          { text: 'Google OAuth', checked: true },
          { text: 'Password reset', checked: false }
        ]
      },
      {
        list: lists[2]._id,
        title: 'Build dashboard page',
        description: 'Create main dashboard with analytics widgets',
        labels: ['blue'],
        position: 1
      },
      {
        list: lists[3]._id,
        title: 'Setup project repository',
        description: 'Initialize repo with git flow and branch protection',
        labels: ['gray'],
        position: 0,
        completed: true
      }
    ];

    const cards = await Promise.all(cardsData.map(c => Card.create(c)));

    for (const list of lists) {
      const listCards = cards.filter(c => c.list.toString() === list._id.toString());
      list.cards = listCards.map(c => c._id);
      await list.save();
    }

    demoUser.boards = [board._id];
    adminUser.boards = [board._id];
    await Promise.all([demoUser.save(), adminUser.save()]);

    console.log(`Seeded: 1 board, ${lists.length} lists, ${cards.length} cards`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
