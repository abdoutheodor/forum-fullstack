// Page de profil utilisateur
// Permet de consulter et modifier son profil (avatar, bio)

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { User, Mail, Edit2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Composant Profile : page de profil de l'utilisateur connecté
 * - Affiche les informations du profil (avatar, nom, email, bio, badge admin)
 * - Permet d'activer un mode édition pour modifier l'avatar et la bio
 * - Annuler les modifications restaure les valeurs d'origine
 *
 * Route protégée : accessible uniquement aux utilisateurs connectés
 */
export function Profile() {
  // Récupération de l'utilisateur connecté et de la fonction de mise à jour du contexte
  const { user, updateUser } = useAuth();

  // État du mode édition (true = formulaire visible, false = vue lecture)
  const [editing, setEditing] = useState(false);

  // États des champs d'édition initialisés avec les valeurs actuelles du profil
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [bio, setBio] = useState(user?.bio || '');

  // État de chargement pendant la sauvegarde
  const [loading, setLoading] = useState(false);

  /**
   * Sauvegarde les modifications du profil
   * Met à jour le contexte global et le localStorage avec le nouveau profil
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Appel API pour mettre à jour le profil
      const updatedUser = await authService.updateProfile(avatar, bio);
      // Mise à jour du contexte global (toutes les composantes qui lisent user seront mises à jour)
      updateUser(updatedUser);
      setEditing(false); // Retour au mode lecture
      toast.success('Profil mis à jour !');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  // Si l'utilisateur n'est pas chargé (ne devrait pas arriver grâce à ProtectedRoute)
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">

            {/* En-tête avec titre et bouton "Modifier" */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
              {/* Bouton "Modifier" visible uniquement en mode lecture */}
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Edit2 className="w-5 h-5" />
                  Modifier
                </button>
              )}
            </div>

            {editing ? (
              /* Mode édition : formulaire de modification */
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Champ URL de l'avatar (type="url" pour la validation native) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de l'avatar
                  </label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                {/* Champ Bio (textarea multiligne) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Parlez-nous de vous..."
                  />
                </div>

                {/* Boutons Enregistrer et Annuler */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  {/* Annuler : restaure les valeurs originales et retourne en mode lecture */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setAvatar(user.avatar || ''); // Restauration de l'avatar original
                      setBio(user.bio || '');       // Restauration de la bio originale
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              /* Mode lecture : affichage des informations du profil */
              <div className="space-y-6">

                {/* Section avatar + nom + email + badge admin */}
                <div className="flex items-center gap-6">
                  {user.avatar ? (
                    // Avatar personnalisé si une URL est définie
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    // Avatar par défaut (icône User) si pas d'avatar défini
                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-12 h-12 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{user.username}</h2>
                    <div className="flex items-center gap-2 text-gray-600 mt-1">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                    {/* Badge "Administrateur" visible uniquement pour les admins */}
                    {user.is_admin && (
                      <span className="inline-block mt-2 bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-semibold">
                        Administrateur
                      </span>
                    )}
                  </div>
                </div>

                {/* Section Bio (masquée si vide) */}
                {user.bio && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Bio</h3>
                    {/* whitespace-pre-wrap préserve les sauts de ligne de la bio */}
                    <p className="text-gray-700 whitespace-pre-wrap">{user.bio}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
