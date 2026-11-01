import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Layout, Users } from 'lucide-react';

const backgrounds = [
  { color: '#3b82f6', name: 'blue' },
  { color: '#22c55e', name: 'green' },
  { color: '#ef4444', name: 'red' },
  { color: '#8b5cf6', name: 'purple' },
  { color: '#f59e0b', name: 'orange' },
  { color: '#06b6d4', name: 'cyan' }
];

export default function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [background, setBackground] = useState(backgrounds[0].color);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const { data } = await api.get('/boards');
      setBoards(data);
    } catch (error) {
      console.error('Failed to fetch boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const { data } = await api.post('/boards', {
        title: title.trim(),
        description,
        background
      });
      setBoards(prev => [data, ...prev]);
      setTitle('');
      setDescription('');
      setShowCreate(false);
      toast.success('Board created');
      navigate(`/board/${data._id}`);
    } catch (error) {
      toast.error('Failed to create board');
    }
  };

  const deleteBoard = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this board permanently?')) return;
    try {
      await api.delete(`/boards/${id}`);
      setBoards(prev => prev.filter(b => b._id !== id));
      toast.success('Board deleted');
    } catch (error) {
      toast.error('Failed to delete board');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Boards</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Create Board
          </button>
        </div>

        {showCreate && (
          <form onSubmit={createBoard} className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Board Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Product Launch"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this board about?"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
                <div className="flex gap-2">
                  {backgrounds.map((bg) => (
                    <button
                      key={bg.color}
                      type="button"
                      onClick={() => setBackground(bg.color)}
                      className={`w-10 h-10 rounded-lg transition ${background === bg.color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                      style={{ backgroundColor: bg.color }}
                      title={bg.name}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition">
                Create
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="border border-gray-300 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </form>
        )}

        {boards.length === 0 ? (
          <div className="text-center py-20">
            <Layout className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No boards yet. Create your first project board!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <Link
                key={board._id}
                to={`/board/${board._id}`}
                className="group rounded-xl p-6 h-40 flex flex-col justify-between text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition cursor-pointer relative"
                style={{ backgroundColor: board.background }}
              >
                <div>
                  <h3 className="text-xl font-bold mb-2">{board.title}</h3>
                  {board.description && (
                    <p className="text-sm opacity-90 line-clamp-2">{board.description}</p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm opacity-90">
                    <Users className="h-4 w-4" />
                    <span>{board.members?.length || 0} members</span>
                  </div>
                  <button
                    onClick={(e) => deleteBoard(e, board._id)}
                    className="opacity-0 group-hover:opacity-100 text-white hover:text-red-200 transition"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
