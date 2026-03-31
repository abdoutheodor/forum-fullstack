// Page de création d'un post
// Formulaire pour publier un nouveau post sur le forum

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService } from '../services/postService';
import { PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Composant CreatePost : formulaire de création de post
 * - Route protégée (accessible uniquement aux utilisateurs connectés via ProtectedRoute)
 * - Validation côté client : titre et contenu ne doivent pas être vides
 * - Redirige vers le post créé après publication réussie
 */
export function CreatePost() {
  // États des champs du formulaire
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  // État de chargement pour désactiver le bouton pendant l'envoi
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * Gestion de la soumission du formulaire
   * Valide les champs, crée le post et redirige vers sa page de détail
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation côté client : les champs ne doivent pas être vides ou remplis d'espaces
    if (!title.trim() || !content.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    // Validation des longueurs minimales (alignées avec le backend)
    if (title.trim().length < 3) {
      toast.error('Le titre doit contenir au moins 3 caractères');
      return;
    }

    if (content.trim().length < 10) {
      toast.error('Le contenu doit contenir au moins 10 caractères');
      return;
    }

    setLoading(true);

    try {
      const response = await postService.createPost({ title, content });
      toast.success('Post créé avec succès !');
      // Redirection vers la page du post créé (response.data.postId retourné par le backend)
      navigate(`/posts/${response.data.postId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création du post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">

            {/* En-tête avec icône et titre */}
            <div className="flex items-center gap-3 mb-6">
              <PlusCircle className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Créer un nouveau post</h1>
            </div>

            {/* Formulaire de création */}
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Champ Titre */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Titre
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  minLength={3}   // Minimum 3 caractères (validation backend)
                  maxLength={255} // Maximum 255 caractères (validation backend)
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Un titre accrocheur... (min. 3 caractères)"
                />
              </div>

              {/* Champ Contenu (textarea multiligne) */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Contenu
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  minLength={10}   // Minimum 10 caractères (validation backend)
                  rows={12}        // Hauteur initiale de la zone de texte
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
                  placeholder="Partagez vos idées... (min. 10 caractères)"
                />
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-4">
                {/* Bouton de publication - désactivé pendant le chargement */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Publication...' : 'Publier'}
                </button>

                {/* Bouton Annuler : redirige vers l'accueil sans créer le post */}
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
