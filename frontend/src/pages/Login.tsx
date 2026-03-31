// Page de connexion
// Formulaire pour s'authentifier avec email + mot de passe

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Composant Login : formulaire de connexion
 * - Valide le formulaire HTML natif (required, type="email")
 * - Utilise le contexte d'authentification pour la connexion
 * - Affiche un toast de succès/erreur
 * - Redirige vers l'accueil après connexion réussie
 */
export function Login() {
  // États des champs du formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // État de chargement pour désactiver le bouton pendant la requête
  const [loading, setLoading] = useState(false);

  // Récupération de la fonction login depuis le contexte global
  const { login } = useAuth();
  const navigate = useNavigate();

  /**
   * Gestion de la soumission du formulaire
   * Appelle login() du contexte, affiche les retours et redirige si succès
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Empêche le rechargement de la page (comportement par défaut du formulaire)
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Connexion réussie !');
      navigate('/'); // Redirection vers la page d'accueil
    } catch (error: any) {
      // Affichage du message d'erreur du backend ou message générique
      toast.error(error.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false); // Réactivation du bouton dans tous les cas
    }
  };

  return (
    // Fond dégradé bleu pour la page de connexion
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">

        {/* En-tête avec icône et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Connexion</h1>
          <p className="text-gray-600 mt-2">Connectez-vous à votre compte</p>
        </div>

        {/* Formulaire de connexion */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Champ Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"                             // Validation HTML native du format email
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required                                  // Champ obligatoire
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="votre@email.com"
            />
          </div>

          {/* Champ Mot de passe */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"                          // Masque les caractères saisis
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          {/* Bouton de soumission - désactivé pendant le chargement */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Lien vers la page d'inscription */}
        <p className="text-center text-gray-600 mt-6">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
