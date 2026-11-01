import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { BoardProvider } from './context/BoardContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import BoardPage from './pages/BoardPage';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <AuthProvider>
        <BoardProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/board/:id"
                  element={
                    <ProtectedRoute>
                      <BoardPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
          <Toaster position="top-right" />
        </BoardProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
