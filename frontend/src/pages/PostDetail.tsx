// Page de détail d'un post
// Affiche le contenu complet d'un post avec ses commentaires et les interactions

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postService, Post } from '../services/postService';
import { commentService, Comment } from '../services/commentService';
import { useAuth } from '../context/AuthContext';
import { Heart, MessageSquare, Clock, User, Trash2, Edit, Send } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Composant PostDetail : page de détail d'un post
 * Fonctionnalités :
 * - Affiche le post complet (titre, contenu, auteur, date, likes)
 * - Liste les commentaires avec support des réponses imbriquées
 * - Permet de liker/unliker le post
 * - Permet d'ajouter un commentaire ou une réponse
 * - Permet à l'auteur (ou admin) de supprimer le post ou les commentaires
 */
export function PostDetail() {
  // Récupération de l'ID du post depuis l'URL (/posts/:id)
  const { id } = useParams<{ id: string }>();
  // Utilisateur connecté (null si non connecté)
  const { user } = useAuth();
  const navigate = useNavigate();

  // États du composant
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');                 // Contenu du nouveau commentaire
  const [replyTo, setReplyTo] = useState<number | null>(null);     // ID du commentaire auquel répondre (null = pas de réponse)
  const [loading, setLoading] = useState(true);

  // Chargement du post et des commentaires au montage (et quand l'ID change)
  useEffect(() => {
    if (id) {
      loadPost();
      loadComments();
    }
  }, [id]);

  /**
   * Charge les données du post depuis l'API
   * Redirige vers l'accueil si le post n'existe pas
   */
  const loadPost = async () => {
    try {
      const data = await postService.getPostById(Number(id));
      setPost(data);
    } catch (error) {
      toast.error('Post non trouvé');
      navigate('/'); // Post introuvable → retour à l'accueil
    } finally {
      setLoading(false);
    }
  };

  /**
   * Charge la liste des commentaires du post
   * Gère l'erreur silencieusement (console uniquement) pour ne pas bloquer l'affichage du post
   */
  const loadComments = async () => {
    try {
      const data = await commentService.getPostComments(Number(id));
      setComments(data);
    } catch (error) {
      console.error('Erreur chargement commentaires');
    }
  };

  /**
   * Like/unlike le post courant (toggle)
   * Recharge le post pour mettre à jour le compteur
   */
  const handleLike = async () => {
    if (!post) return;
    try {
      await postService.likePost(post.id);
      loadPost(); // Rechargement pour refléter le nouveau compteur
    } catch (error) {
      toast.error('Erreur lors du like');
    }
  };

  /**
   * Supprime le post après confirmation de l'utilisateur
   * Redirige vers l'accueil après suppression
   */
  const handleDeletePost = async () => {
    // window.confirm affiche une boîte de dialogue native de confirmation
    if (!post || !window.confirm('Supprimer ce post ?')) return;
    try {
      await postService.deletePost(post.id);
      toast.success('Post supprimé');
      navigate('/');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  /**
   * Soumet un nouveau commentaire (ou une réponse si replyTo est défini)
   * Réinitialise le formulaire et recharge les commentaires après soumission
   */
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return; // Ne pas soumettre un commentaire vide

    try {
      await commentService.createComment(Number(id), {
        content: newComment,
        parent_comment_id: replyTo || undefined, // undefined = commentaire racine
      });
      setNewComment('');  // Réinitialisation du champ texte
      setReplyTo(null);   // Annulation du mode réponse
      loadComments();     // Rechargement de la liste
      toast.success('Commentaire ajouté');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du commentaire');
    }
  };

  /**
   * Supprime un commentaire après confirmation
   * Recharge la liste des commentaires après suppression
   */
  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Supprimer ce commentaire ?')) return;
    try {
      await commentService.deleteComment(commentId);
      loadComments();
      toast.success('Commentaire supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  /**
   * Formate une date ISO en format lisible en français
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

  /**
   * Rendu récursif d'un commentaire et de ses réponses imbriquées
   * @param comment - Le commentaire à afficher
   * @param depth   - Profondeur d'imbrication (0 = racine, 1 = réponse, etc.)
   */
  const renderComment = (comment: Comment, depth = 0) => (
    // Indentation visuelle proportionnelle à la profondeur (ml-8 = 2rem)
    <div key={comment.id} className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-4'}`}>
      <div className="bg-gray-50 rounded-lg p-4">

        {/* En-tête du commentaire : auteur, date et bouton suppression */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span className="font-medium">{comment.author_username}</span>
            <Clock className="w-4 h-4 ml-2" />
            <span>{formatDate(comment.created_at)}</span>
          </div>
          {/* Bouton suppression visible uniquement pour l'auteur du commentaire ou un admin */}
          {user && (user.id === comment.author_id || user.is_admin) && (
            <button
              onClick={() => handleDeleteComment(comment.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Contenu du commentaire */}
        <p className="text-gray-800 mb-2">{comment.content}</p>

        {/* Bouton "Répondre" visible uniquement si connecté */}
        {user && (
          <button
            onClick={() => setReplyTo(comment.id)} // Active le mode réponse à ce commentaire
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Répondre
          </button>
        )}
      </div>

      {/* Rendu récursif des réponses au commentaire */}
      {comment.replies?.map((reply) => renderComment(reply, depth + 1))}
    </div>
  );

  // Affichage du spinner pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Post non trouvé (ne devrait pas arriver car loadPost redirige déjà)
  if (!post) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          {/* Section principale : contenu du post */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">

            {/* Titre et boutons d'action (modifier/supprimer) */}
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
              {/* Boutons visibles uniquement pour l'auteur du post ou un admin */}
              {user && (user.id === post.author_id || user.is_admin) && (
                <div className="flex gap-2">
                  {/* Lien vers la page d'édition */}
                  <Link
                    to={`/posts/${post.id}/edit`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  {/* Bouton de suppression */}
                  <button
                    onClick={handleDeletePost}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Métadonnées : auteur et date */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <Link
                  to={`/profile/${post.author_id}`}
                  className="hover:text-blue-600 font-medium"
                >
                  {post.author_username}
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {formatDate(post.created_at)}
              </div>
            </div>

            {/* Contenu complet du post (whitespace-pre-wrap préserve les sauts de ligne) */}
            <p className="text-gray-800 text-lg mb-6 whitespace-pre-wrap">{post.content}</p>

            {/* Barre d'interactions : likes et nombre de commentaires */}
            <div className="flex items-center gap-6 pt-4 border-t">
              {/* Bouton like : rouge si déjà liké */}
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 hover:text-red-600 transition ${
                  post.user_has_liked ? 'text-red-600' : 'text-gray-600'
                }`}
              >
                <Heart className={`w-6 h-6 ${post.user_has_liked ? 'fill-current' : ''}`} />
                <span className="font-semibold">{post.likes_count}</span>
              </button>
              {/* Compteur de commentaires (non cliquable ici, déjà sur la même page) */}
              <div className="flex items-center gap-2 text-gray-600">
                <MessageSquare className="w-6 h-6" />
                <span className="font-semibold">{post.comments_count}</span>
              </div>
            </div>
          </div>

          {/* Section des commentaires */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Commentaires ({comments.length})
            </h2>

            {/* Formulaire d'ajout de commentaire (visible uniquement si connecté) */}
            {user && (
              <form onSubmit={handleSubmitComment} className="mb-8">
                {/* Indicateur de mode "réponse" avec bouton d'annulation */}
                {replyTo && (
                  <div className="mb-2 text-sm text-gray-600">
                    Réponse à un commentaire -{' '}
                    <button
                      type="button"
                      onClick={() => setReplyTo(null)} // Annule le mode réponse
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Annuler
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Ajouter un commentaire..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  {/* Bouton d'envoi avec icône */}
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 rounded-lg hover:bg-blue-700 transition"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            )}

            {/* Liste des commentaires ou message "aucun commentaire" */}
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucun commentaire pour le moment</p>
            ) : (
              <div className="space-y-4">
                {/* Rendu récursif de chaque commentaire (depth=0 pour les racines) */}
                {comments.map((comment) => renderComment(comment))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
