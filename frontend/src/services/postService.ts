// Service de gestion des posts
// Encapsule tous les appels API liés aux posts du forum

import api from './api';

/**
 * Interface représentant un post tel que retourné par l'API backend
 * Utilise le format snake_case (convention Python/SQL) contrairement à types/index.ts (camelCase)
 */
export interface Post {
  id: number;
  title: string;
  content: string;
  author_id: number;           // ID de l'auteur
  author_username: string;     // Nom d'utilisateur de l'auteur (résolu par JOIN côté backend)
  author_avatar?: string;      // Avatar de l'auteur (optionnel)
  created_at: string;          // Date ISO de publication
  updated_at: string;          // Date ISO de dernière modification
  likes_count: number;         // Nombre total de likes
  comments_count: number;      // Nombre total de commentaires
  user_has_liked?: boolean;    // true si l'utilisateur connecté a liké (optionnel)
}

/** Données requises pour créer ou modifier un post */
export interface CreatePostData {
  title: string;
  content: string;
}

/**
 * Service centralisé pour toutes les opérations sur les posts
 */
export const postService = {
  /**
   * Récupère tous les posts du forum (triés du plus récent au plus ancien)
   * @returns Tableau de posts avec infos auteur
   */
  async getAllPosts(): Promise<Post[]> {
    const response = await api.get('/posts');
    return response.data.data; // L'API enveloppe les données dans { success, data }
  },

  /**
   * Récupère un post spécifique par son ID
   * @param id - ID du post
   * @returns Le post avec les données de l'auteur
   */
  async getPostById(id: number): Promise<Post> {
    const response = await api.get(`/posts/${id}`);
    return response.data.data;
  },

  /**
   * Crée un nouveau post
   * Nécessite un token JWT valide dans localStorage
   * @returns La réponse complète (contient { success, data: { postId } })
   */
  async createPost(data: CreatePostData) {
    const response = await api.post('/posts', data);
    return response.data;
  },

  /**
   * Met à jour un post existant
   * Seul l'auteur du post peut le modifier (vérifié côté backend)
   * @returns La réponse de confirmation
   */
  async updatePost(id: number, data: CreatePostData) {
    const response = await api.put(`/posts/${id}`, data);
    return response.data;
  },

  /**
   * Supprime un post
   * Seul l'auteur (ou un admin) peut supprimer (vérifié côté backend)
   */
  async deletePost(id: number) {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },

  /**
   * Récupère tous les posts d'un utilisateur spécifique
   * Utilisé pour afficher les posts dans le profil d'un utilisateur
   * @param userId - ID de l'utilisateur dont on veut les posts
   */
  async getUserPosts(userId: number): Promise<Post[]> {
    const response = await api.get(`/posts/user/${userId}`);
    return response.data.data;
  },

  /**
   * Like ou unlike un post (comportement toggle)
   * Si déjà liké → retire le like, sinon → ajoute le like
   * Met à jour likes_count côté backend automatiquement
   * @returns { liked: boolean } indiquant l'état résultant
   */
  async likePost(postId: number) {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },

  /**
   * Recherche des posts selon différents critères
   * Construit dynamiquement les paramètres de query string
   *
   * @param query  - Mots-clés à rechercher dans le titre/contenu (paramètre ?q=)
   * @param author - Nom d'auteur (paramètre ?author=)
   * @param date   - Date de publication au format YYYY-MM-DD (paramètre ?date=)
   * @returns Posts correspondant aux critères
   */
  async searchPosts(query: string, author?: string, date?: string): Promise<Post[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (author) params.append('author', author);
    if (date) params.append('date', date);

    const response = await api.get(`/search?${params.toString()}`);
    return response.data.data;
  },
};
