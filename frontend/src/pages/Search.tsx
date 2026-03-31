// Page de recherche de posts
// Permet de rechercher des posts par mots-clés dans le titre/contenu

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { postService, Post } from '../services/postService';
import { Search as SearchIcon, Heart, MessageSquare, User, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Composant Search : page de recherche
 * - Affiche un formulaire de recherche
 * - Exécute la recherche à la soumission du formulaire
 * - Affiche le nombre de résultats et les posts correspondants
 * - La section résultats est masquée jusqu'à la première recherche
 */
export function Search() {
  // État du champ de recherche
  const [query, setQuery] = useState('');
  // Résultats de la recherche
  const [results, setResults] = useState<Post[]>([]);
  // État de chargement pendant la requête
  const [loading, setLoading] = useState(false);
  // Indique si une recherche a déjà été effectuée (pour afficher/masquer la section résultats)
  const [searched, setSearched] = useState(false);

  /**
   * Exécute la recherche de posts par mots-clés
   * Utilise postService.searchPosts qui appelle GET /api/search?q=...
   */
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return; // Ne pas chercher si la requête est vide

    setLoading(true);
    setSearched(true); // Active l'affichage de la section résultats

    try {
      // Recherche par mots-clés dans le titre et le contenu des posts
      const data = await postService.searchPosts(query);
      setResults(data);
    } catch (error) {
      toast.error('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Formate une date ISO en format lisible (sans l'heure pour les résultats de recherche)
   */
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          {/* Section formulaire de recherche */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Rechercher</h1>

            {/* Formulaire : champ de texte + bouton de recherche */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher des posts..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                <SearchIcon className="w-5 h-5" />
                {loading ? 'Recherche...' : 'Rechercher'}
              </button>
            </form>
          </div>

          {/* Section résultats : visible uniquement après la première recherche */}
          {searched && (
            <div>
              {/* Compteur de résultats avec accord grammatical */}
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
              </h2>

              {/* Message "aucun résultat" ou liste des posts */}
              {results.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <p className="text-gray-500 text-lg">Aucun résultat trouvé</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {results.map((post) => (
                    // Carte de résultat similaire à la page Home
                    <div key={post.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
                      {/* Titre cliquable vers le détail du post */}
                      <Link to={`/posts/${post.id}`}>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition">
                          {post.title}
                        </h2>
                      </Link>

                      {/* Extrait du contenu (3 lignes max) */}
                      <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>

                      {/* Métadonnées du post */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          {/* Auteur */}
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="font-medium">{post.author_username}</span>
                          </div>
                          {/* Date */}
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {formatDate(post.created_at)}
                          </div>
                        </div>

                        {/* Statistiques : likes et commentaires */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Heart className="w-5 h-5" />
                            {post.likes_count}
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            {post.comments_count}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
