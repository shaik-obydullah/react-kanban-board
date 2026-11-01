import { createContext, useContext, useState } from 'react';
import socket from '../utils/socket';

const BoardContext = createContext();

export const useBoard = () => useContext(BoardContext);

export const BoardProvider = ({ children }) => {
  const [board, setBoard] = useState(null);
  const [connected, setConnected] = useState(false);

  const joinBoard = (boardId) => {
    socket.connect();
    socket.emit('board:join', boardId);
    setConnected(true);
  };

  const leaveBoard = (boardId) => {
    if (boardId) {
      socket.emit('board:leave', boardId);
    }
    socket.disconnect();
    setConnected(false);
  };

  const emitCardUpdate = (boardId, cardId, data) => {
    socket.emit('card:update', { boardId, cardId, data });
  };

  const emitCardCreate = (boardId, card) => {
    socket.emit('card:create', { boardId, card });
  };

  const emitCardDelete = (boardId, cardId) => {
    socket.emit('card:delete', { boardId, cardId });
  };

  const emitListUpdate = (boardId, listId, data) => {
    socket.emit('list:update', { boardId, listId, data });
  };

  const emitListCreate = (boardId, list) => {
    socket.emit('list:create', { boardId, list });
  };

  const emitListDelete = (boardId, listId) => {
    socket.emit('list:delete', { boardId, listId });
  };

  const emitBoardUpdate = (boardId, data) => {
    socket.emit('board:update', { boardId, data });
  };

  return (
    <BoardContext.Provider value={{
      board,
      setBoard,
      connected,
      joinBoard,
      leaveBoard,
      emitCardUpdate,
      emitCardCreate,
      emitCardDelete,
      emitListUpdate,
      emitListCreate,
      emitListDelete,
      emitBoardUpdate
    }}>
      {children}
    </BoardContext.Provider>
  );
};
