import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBoard } from '../context/BoardContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import ListComponent from '../components/ListComponent';
import CardModal from '../components/CardModal';
import { Plus, ArrowLeft, Copy, Trash2 } from 'lucide-react';

const backgrounds = [
  { color: '#3b82f6', name: 'blue' },
  { color: '#22c55e', name: 'green' },
  { color: '#ef4444', name: 'red' },
  { color: '#8b5cf6', name: 'purple' },
  { color: '#f59e0b', name: 'orange' }
];

export default function BoardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { board, setBoard, joinBoard, leaveBoard } = useBoard();
  const [loading, setLoading] = useState(true);
  const [addingList, setAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    joinBoard(id);
    return () => leaveBoard(id);
  }, [id]);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const { data } = await api.get(`/boards/${id}`);
        setBoard(data);
      } catch (error) {
        toast.error('Failed to load board');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, [id]);

  const createList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    try {
      const { data } = await api.post('/lists', {
        boardId: id,
        title: newListTitle.trim()
      });
      setBoard(prev => ({
        ...prev,
        lists: [...prev.lists, data]
      }));
      setNewListTitle('');
      setAddingList(false);
      toast.success('List created');
    } catch (error) {
      toast.error('Failed to create list');
    }
  };

  const copyBoardLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Board link copied');
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!board) return null;

  const isOwner = board.owner?._id === user._id || board.owner === user._id;

  return (
    <div
      className="min-h-[calc(100vh-64px)] flex flex-col"
      style={{ backgroundColor: board.background }}
    >
      <div className="backdrop-blur-sm bg-black/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-white hover:bg-white/10 p-2 rounded-lg transition">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{board.title}</h1>
              {board.description && (
                <p className="text-white/80 text-sm">{board.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 mr-2">
              <div className="w-8 h-8 rounded-full bg-white text-primary-600 flex items-center justify-center text-xs font-bold ring-2 ring-white/50">
                {board.owner?.name?.charAt(0).toUpperCase() || 'O'}
              </div>
              {board.members?.map((member) => (
                <div
                  key={member._id}
                  className="w-8 h-8 rounded-full bg-white text-primary-600 flex items-center justify-center text-xs font-bold ring-2 ring-white/50"
                  title={member.name}
                >
                  {member.name?.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
            <button onClick={copyBoardLink} className="text-white hover:bg-white/10 p-2 rounded-lg transition" title="Copy link">
              <Copy className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <div className="flex gap-4 items-start h-full">
          {board.lists?.map((list, index) => (
            <ListComponent
              key={list._id}
              list={list}
              board={board}
              setBoard={setBoard}
              index={index}
              onOpenCard={setSelectedCard}
              isOwner={isOwner}
              currentUser={user}
            />
          ))}

          {addingList ? (
            <form onSubmit={createList} className="w-72 bg-black/40 rounded-xl p-3 flex-shrink-0">
              <input
                type="text"
                autoFocus
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="Enter list title..."
                className="w-full bg-white rounded-lg px-3 py-2 text-sm outline-none mb-2"
                onBlur={() => setAddingList(false)}
              />
              <button type="submit" className="bg-white/90 text-gray-800 px-3 py-2 rounded-lg text-sm font-medium hover:bg-white transition">
                Add List
              </button>
            </form>
          ) : (
            <button
              onClick={() => setAddingList(true)}
              className="w-72 bg-black/30 hover:bg-black/40 text-white rounded-xl p-4 flex items-center gap-2 flex-shrink-0 transition"
            >
              <Plus className="h-5 w-5" />
              Add another list
            </button>
          )}
        </div>
      </div>

      {selectedCard && (
        <CardModal
          card={selectedCard}
          board={board}
          setBoard={setBoard}
          onClose={() => setSelectedCard(null)}
          isOwner={isOwner}
          currentUser={user}
        />
      )}
    </div>
  );
}
