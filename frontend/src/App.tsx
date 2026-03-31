// Composant racine de l'application
// Configure le routeur, le contexte global d'authentification et toutes les routes

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
// Contexte global d'authentification (fournit user, login, logout à toute l'appli)
import { AuthProvider } from './context/AuthContext';
// Composant de protection des routes (redirige vers /login si non connecté)
import { ProtectedRoute } from './components/ProtectedRoute';
// Barre de navigation persistante en haut de toutes les pages
import { Navbar } from './components/Navbar';
// Import de toutes les pages de l'application
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { PostDetail } from './pages/PostDetail';
import { CreatePost } from './pages/CreatePost';
import { Messages } from './pages/Messages';
import { Profile } from './pages/Profile';
import { Search } from './pages/Search';
import { Friends } from './pages/Friends';

function App() {
  return (
    // AuthProvider enveloppe tout pour que toutes les pages accèdent au contexte d'auth
    <AuthProvider>
      {/* BrowserRouter utilise l'API History du navigateur pour la navigation */}
      <Router>
        {/* Fond gris clair pour toute l'application */}
        <div className="min-h-screen bg-gray-50">
          {/* Navbar affichée sur TOUTES les pages */}
          <Navbar />
          {/* Toaster pour les notifications toast (succès, erreur) en haut à droite */}
          <Toaster position="top-right" />
          <Routes>
            {/* Routes publiques : accessibles sans authentification */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<Search />} />
            <Route path="/posts/:id" element={<PostDetail />} />

            {/* Routes protégées : redirigent vers /login si l'utilisateur n'est pas connecté */}
            <Route
              path="/create-post"
              element={
                <ProtectedRoute>
                  <CreatePost />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/friends"
              element={
                <ProtectedRoute>
                  <Friends />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
