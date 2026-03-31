// Composant de protection des routes
// Empêche l'accès aux pages réservées aux utilisateurs connectés

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode; // Le contenu de la page à protéger
}

/**
 * Wrapper de route qui vérifie l'authentification avant d'afficher la page
 *
 * Comportement :
 * 1. Pendant le chargement initial (vérification du token) → affiche un spinner
 * 2. Si non connecté → redirige vers /login (replace=true évite le retour en arrière)
 * 3. Si connecté → affiche la page protégée
 *
 * Utilisation dans App.tsx :
 * <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Récupération de l'état d'authentification depuis le contexte global
  const { user, loading } = useAuth();

  // Pendant l'initialisation de l'auth (vérification du token en localStorage)
  // On affiche un spinner pour éviter un flash de redirection non désiré
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {/* Spinner de chargement animé */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si aucun utilisateur connecté, redirection vers la page de connexion
  // replace=true remplace l'entrée d'historique (empêche le bouton "retour" de contourner la protection)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Utilisateur connecté : affichage de la page protégée
  return <>{children}</>;
};
