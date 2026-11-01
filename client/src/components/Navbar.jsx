import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trello, LogOut, User, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-primary-600 to-primary-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Trello className="h-8 w-8" />
            <span className="text-2xl font-bold">Trailo</span>
          </Link>

          {user && (
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-1 hover:text-primary-200 transition">
                <LayoutDashboard className="h-5 w-5" />
                <span className="hidden sm:inline">Boards</span>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
                <span className="hidden sm:inline font-medium">{user.name}</span>
              </div>
              <button onClick={handleLogout} className="hover:text-primary-200 transition">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
