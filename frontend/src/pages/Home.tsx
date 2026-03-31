// Page principale du forum (fil des posts)
// Affiche tous les posts du forum avec pagination et bouton like

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { postService, Post } from '../services/postService';
// Icônes de la bibliothèque Lucide React
import { Heart, MessageSquare, Clock, User } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Composant Home : page d'accueil du forum avec la liste des posts
 * - Charge les posts au montage du composant
 * - Permet de liker/unliker un post directement depuis la liste
 * - Affiche un spinner pendant le chargement
 */
export function Home() {
  // État local contenant la liste des posts chargés depuis l'API
  const [posts, setPosts] = useState<Post[]>([]);
  // État de chargement pour afficher le spinner
  const [loading, setLoading] = useState(true);

  // Chargement des posts au montage du composant (une seule fois)
  useEffect(() => {
    loadPosts();
  }, []);

  /**
   * Charge tous les posts depuis l'API backend
   * Gère les erreurs avec un toast de notification
   */
  const loadPosts = async () => {
    try {
      const data = await postService.getAllPosts();
      setPosts(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des posts');
    } finally {
      // setLoading(false) est appelé que la requête réussisse ou échoue
      setLoading(false);
    }
  };

  /**
   * Gère le like/unlike d'un post (toggle)
   * Recharge toute la liste après le like pour mettre à jour les compteurs
   * @param postId - ID du post à liker/unliker
   */
  const handleLike = async (postId: number) => {
    try {
      await postService.likePost(postId);
      // Rechargement de la liste pour refléter le nouveau compteur de likes
      loadPosts();
    } catch (error) {
      toast.error('Erreur lors du like');
    }
  };

  /**
   * Formate une date ISO en format lisible en français
   * Ex: "15 janvier 2024, 14:30"
   */
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Affichage du spinner pendant le chargement initial
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* En-tête de la page */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Bienvenue sur le Forum</h1>
            <p className="text-gray-600">Découvrez les dernières discussions</p>
          </div>

          {/* Cas où il n'y a aucun post */}
          {posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg">Aucun post pour le moment</p>
              <Link
                to="/create-post"
                className="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Créer le premier post
              </Link>
            </div>
          ) : (
            // Liste des posts
            <div className="space-y-6">
              {posts.map((post) => (
                // Carte de post avec effet hover
                <div key={post.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">

                  {/* Titre cliquable → redirige vers le détail du post */}
                  <Link to={`/posts/${post.id}`}>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition">
                      {post.title}
                    </h2>
                  </Link>

                  {/* Extrait du contenu (3 lignes max avec line-clamp) */}
                  <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>

                  {/* Métadonnées : auteur, date (à gauche) et likes/commentaires (à droite) */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      {/* Lien vers le profil de l'auteur */}
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <Link
                          to={`/profile/${post.author_id}`}
                          className="hover:text-blue-600 transition font-medium"
                        >
                          {post.author_username}
                        </Link>
                      </div>
                      {/* Date de publication */}
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {formatDate(post.created_at)}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Bouton like/unlike : rouge si déjà liké, gris sinon */}
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 hover:text-red-600 transition ${
                          post.user_has_liked ? 'text-red-600' : ''
                        }`}
                      >
                        {/* Cœur rempli si liké, contour sinon */}
                        <Heart className={`w-5 h-5 ${post.user_has_liked ? 'fill-current' : ''}`} />
                        {post.likes_count}
                      </button>

                      {/* Lien vers les commentaires (redirige vers le détail du post) */}
                      <Link
                        to={`/posts/${post.id}`}
                        className="flex items-center gap-2 hover:text-blue-600 transition"
                      >
                        <MessageSquare className="w-5 h-5" />
                        {post.comments_count}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
