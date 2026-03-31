// Barre de navigation principale
// Affichée sur toutes les pages, s'adapte selon l'état de connexion de l'utilisateur

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Icônes de la bibliothèque Lucide React
import { MessageCircle, User, LogOut, Home, Search, PlusCircle, Shield, Users } from 'lucide-react';

/**
 * Composant Navbar
 * Affiche différents liens selon que l'utilisateur est connecté ou non :
 * - Non connecté : liens Connexion / Inscription
 * - Connecté    : liens Amis, Messages, Créer un post, Profil, (Admin si admin), Déconnexion
 */
export function Navbar() {
  // Récupération de l'utilisateur connecté et de la fonction de déconnexion depuis le contexte
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /**
   * Gère la déconnexion : appelle logout() puis redirige vers la page d'accueil
   */
  const handleLogout = () => {
    logout();
    navigate('/'); // Redirection vers l'accueil après déconnexion
  };

  return (
    // sticky top-0 z-50 : la navbar reste visible même lors du défilement
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          {/* Logo / Lien vers l'accueil */}
          <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <MessageCircle className="w-8 h-8" />
            Forum
          </Link>

          {/* Menu de navigation (masqué sur mobile, visible sur md et plus) */}
          <div className="hidden md:flex items-center space-x-6">

            {/* Liens toujours visibles (connecté ou non) */}
            <Link to="/" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
              <Home className="w-5 h-5" />
              Accueil
            </Link>
            <Link to="/search" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
              <Search className="w-5 h-5" />
              Rechercher
            </Link>

            {user ? (
              // Liens visibles uniquement si l'utilisateur est connecté
              <>
                {/* Gestion des amis */}
                <Link to="/friends" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                  <Users className="w-5 h-5" />
                  Amis
                </Link>

                {/* Messagerie privée */}
                <Link to="/messages" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                  <MessageCircle className="w-5 h-5" />
                  Messages
                </Link>

                {/* Bouton de création de post (mis en avant avec fond bleu) */}
                <Link to="/create-post" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  <PlusCircle className="w-5 h-5" />
                  Créer un post
                </Link>

                <div className="flex items-center space-x-4">
                  {/* Lien vers le profil de l'utilisateur connecté */}
                  <Link to="/profile" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                    <User className="w-5 h-5" />
                    {user.username} {/* Affichage du nom de l'utilisateur connecté */}
                  </Link>

                  {/* Lien admin visible uniquement si l'utilisateur est administrateur */}
                  {user.is_admin && (
                    <Link to="/admin" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                      <Shield className="w-5 h-5" />
                      Admin
                    </Link>
                  )}

                  {/* Bouton de déconnexion */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition"
                  >
                    <LogOut className="w-5 h-5" />
                    Déconnexion
                  </button>
                </div>
              </>
            ) : (
              // Liens visibles si l'utilisateur n'est PAS connecté
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-blue-600 transition">
                  Connexion
                </Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
