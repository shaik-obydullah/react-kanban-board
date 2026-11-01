const cardHandler = (io, socket) => {
  socket.on('board:join', (boardId) => {
    socket.join(`board:${boardId}`);
  });

  socket.on('board:leave', (boardId) => {
    socket.leave(`board:${boardId}`);
  });

  socket.on('card:update', ({ boardId, cardId, data }) => {
    io.to(`board:${boardId}`).emit('card:updated', { cardId, data });
  });

  socket.on('card:create', ({ boardId, card }) => {
    io.to(`board:${boardId}`).emit('card:created', { card });
  });

  socket.on('card:delete', ({ boardId, cardId }) => {
    io.to(`board:${boardId}`).emit('card:deleted', { cardId });
  });

  socket.on('list:update', ({ boardId, listId, data }) => {
    io.to(`board:${boardId}`).emit('list:updated', { listId, data });
  });

  socket.on('list:create', ({ boardId, list }) => {
    io.to(`board:${boardId}`).emit('list:created', { list });
  });

  socket.on('list:delete', ({ boardId, listId }) => {
    io.to(`board:${boardId}`).emit('list:deleted', { listId });
  });

  socket.on('board:update', ({ boardId, data }) => {
    io.to(`board:${boardId}`).emit('board:updated', { data });
  });
};

module.exports = cardHandler;
