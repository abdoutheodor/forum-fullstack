// Service de gestion des commentaires
// Encapsule tous les appels API liés aux commentaires des posts

import api from './api';

/**
 * Interface représentant un commentaire tel que retourné par l'API
 */
export interface Comment {
  id: number;
  content: string;
  author_id: number;           // ID de l'auteur du commentaire
  author_username: string;     // Nom d'utilisateur de l'auteur (résolu par JOIN côté backend)
  author_avatar?: string;      // Avatar de l'auteur (optionnel)
  post_id: number;             // ID du post auquel appartient le commentaire
  parent_comment_id?: number;  // ID du commentaire parent (undefined = commentaire racine)
  created_at: string;          // Date ISO de publication
  replies?: Comment[];         // Réponses imbriquées (rempli côté frontend si nécessaire)
}

/**
 * Données nécessaires pour créer un commentaire
 */
export interface CreateCommentData {
  content: string;
  parent_comment_id?: number; // Si défini → réponse à un autre commentaire
}

/**
 * Service centralisé pour toutes les opérations sur les commentaires
 */
export const commentService = {
  /**
   * Récupère tous les commentaires d'un post
   * Retourne tous les commentaires (racines et réponses mélangés)
   * L'organisation en arbre est faite côté frontend si besoin
   * @param postId - ID du post dont on veut les commentaires
   */
  async getPostComments(postId: number): Promise<Comment[]> {
    const response = await api.get(`/posts/${postId}/comments`);
    return response.data.data; // L'API enveloppe les données dans { success, data }
  },

  /**
   * Crée un nouveau commentaire sur un post
   * Si data.parent_comment_id est défini, le commentaire est une réponse à un autre
   *
   * @param postId - ID du post à commenter
   * @param data   - Contenu du commentaire et éventuellement l'ID du commentaire parent
   */
  async createComment(postId: number, data: CreateCommentData) {
    const response = await api.post(`/posts/${postId}/comments`, data);
    return response.data;
  },

  /**
   * Supprime un commentaire
   * Seul l'auteur (ou un admin) peut supprimer (vérifié côté backend)
   * @param commentId - ID du commentaire à supprimer
   */
  async deleteComment(commentId: number) {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },
};
