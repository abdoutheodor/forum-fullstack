// Page d'inscription
// Formulaire pour créer un nouveau compte utilisateur

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Composant Register : formulaire d'inscription
 * - Validation côté client : correspondance des mots de passe, longueur minimale
 * - Validation supplémentaire côté serveur (unicité email/username)
 * - Connecte automatiquement l'utilisateur après inscription réussie
 */
export function Register() {
  // États des champs du formulaire
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Confirmation du mot de passe (vérification côté client uniquement)
  const [loading, setLoading] = useState(false);

  // Récupération de la fonction register depuis le contexte global
  const { register } = useAuth();
  const navigate = useNavigate();

  /**
   * Gestion de la soumission du formulaire
   * Effectue des validations côté client avant d'envoyer la requête
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation 1 : les deux mots de passe doivent correspondre
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    // Validation 2 : longueur minimale du mot de passe (cohérence avec le backend)
    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      // register() crée le compte ET connecte l'utilisateur automatiquement
      await register(username, email, password);
      toast.success('Inscription réussie !');
      navigate('/'); // Redirection vers l'accueil après inscription
    } catch (error: any) {
      // Le backend peut retourner des erreurs comme "Email déjà utilisé"
      toast.error(error.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">

        {/* En-tête avec icône et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Inscription</h1>
          <p className="text-gray-600 mt-2">Créez votre compte</p>
        </div>

        {/* Formulaire d'inscription */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Champ Nom d'utilisateur */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Nom d'utilisateur
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}   // Cohérence avec la validation backend (min 3 caractères)
              maxLength={50}  // Cohérence avec la validation backend (max 50 caractères)
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="john_doe"
            />
          </div>

          {/* Champ Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6} // Cohérence avec la validation backend (min 6 caractères)
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          {/* Champ Confirmation du mot de passe (vérification côté client uniquement) */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
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
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>

        {/* Lien vers la page de connexion */}
        <p className="text-center text-gray-600 mt-6">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
