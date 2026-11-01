# Project Management Tool

A Trello-style project management application with real-time collaboration, drag-and-drop boards, and team management. Built with React, Node.js, Express, MongoDB, and Socket.io.

## Features

- **Kanban Boards** - Create, organize, and manage project boards
- **Drag & Drop** - Move lists and cards with dnd-kit
- **Real-time Collaboration** - Socket.io for instant updates
- **Task Management** - Cards with descriptions, labels, checklists, and due dates
- **Team Collaboration** - Add members to boards and assign them to cards
- **User Authentication** - JWT-based login/register

## Tech Stack

| Layer            | Technology                        |
| ---------------- | --------------------------------- |
| Frontend         | React 18 + Vite + Tailwind CSS    |
| Drag & Drop      | @dnd-kit/core + @dnd-kit/sortable |
| Real-time        | Socket.io                         |
| Backend          | Node.js + Express                 |
| Database         | MongoDB + Mongoose                |
| Auth             | JWT (JSON Web Tokens)             |
| Containerization | Docker + Docker Compose           |

## Quick Start

### With Docker (Recommended)

```bash
# Start Docker Desktop first, then:
cd trailo
docker-compose up --build

# Seed the database (in new terminal):
docker exec -it trailo-server npm run seed
```

### Without Docker

```bash
# Backend (requires local MongoDB)
cd server
npm install
npm run dev

# Frontend (new terminal)
cd client
npm install
npm run dev
```

## Access

| Service     | URL                       |
| ----------- | ------------------------- |
| Frontend    | http://localhost:5174     |
| Backend API | http://localhost:5001/api |

## Demo Accounts

| Email            | Password | Role                     |
| ---------------- | -------- | ------------------------ |
| demo@trailo.com  | demo123  | Owner (has sample board) |
| admin@trailo.com | admin123 | Member                   |

## API Endpoints

### Auth

- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Profile
- `PUT /api/auth/profile` - Update profile

### Boards

- `GET /api/boards` - My boards
- `POST /api/boards` - Create board
- `GET /api/boards/:id` - Get board with lists & cards
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board
- `POST /api/boards/:id/members` - Add member
- `DELETE /api/boards/:id/members/:userId` - Remove member

### Lists

- `POST /api/lists` - Create list
- `GET /api/lists/board/:boardId` - Get lists
- `PUT /api/lists/:id` - Update list
- `DELETE /api/lists/:id` - Delete list

### Cards

- `POST /api/cards` - Create card
- `GET /api/cards/:id` - Get card
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card
- `PUT /api/cards/:id/move` - Move card between lists
- `PUT /api/cards/:id/members` - Assign member

## Real-time Events

| Event         | Trigger          | Payload      |
| ------------- | ---------------- | ------------ |
| `board:join`  | Join board room  | boardId      |
| `board:leave` | Leave board room | boardId      |
| `card:update` | Edit card        | cardId, data |
| `card:create` | Create card      | card         |
| `card:delete` | Delete card      | cardId       |
| `list:update` | Edit list        | listId, data |
| `list:create` | Create list      | list         |
| `list:delete` | Delete list      | listId       |
