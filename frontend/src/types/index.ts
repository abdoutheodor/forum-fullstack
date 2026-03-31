/**
 * Interfaces TypeScript utilisées dans tout le frontend
 * Ces types correspondent aux données reçues de l'API backend
 */

/**
 * Représente un utilisateur de la plateforme
 */
export interface User {
  id: number
  username: string
  email: string
  role: 'user' | 'admin'  // Rôle déterminant les permissions dans l'interface
  avatar?: string          // URL de l'image de profil (optionnel)
  createdAt: string        // Date ISO de création du compte
}

/**
 * Représente un post du forum avec les données de l'auteur enrichies
 */
export interface Post {
  id: number
  title: string
  content: string
  authorId: number
  author: User              // Données de l'auteur (objet imbriqué)
  createdAt: string
  updatedAt: string
  likes: number             // Nombre total de likes
  comments: number          // Nombre total de commentaires
  isLiked?: boolean         // true si l'utilisateur connecté a liké ce post (optionnel)
}

/**
 * Représente un commentaire sur un post
 * Supporte les réponses imbriquées via le tableau replies
 */
export interface Comment {
  id: number
  content: string
  authorId: number
  author: User              // Données de l'auteur du commentaire
  postId: number
  createdAt: string
  updatedAt: string
  replies?: Comment[]       // Réponses imbriquées (optionnel, chargé séparément)
}

/**
 * Réponse de l'API lors de l'authentification (login/register)
 */
export interface AuthResponse {
  user: User    // Données de l'utilisateur connecté
  token: string // Token JWT à stocker dans localStorage
}

/**
 * Données nécessaires pour la connexion
 */
export interface LoginCredentials {
  email: string
  password: string
}

/**
 * Données nécessaires pour l'inscription
 */
export interface RegisterData {
  username: string
  email: string
  password: string
}

/**
 * Données pour créer un nouveau post
 */
export interface CreatePostData {
  title: string
  content: string
}

/**
 * Données pour créer un commentaire
 */
export interface CreateCommentData {
  content: string
  postId: number
  parentId?: number  // ID du commentaire parent si c'est une réponse (optionnel)
}

/**
 * Filtres disponibles pour la recherche de posts
 * Tous les champs sont optionnels (au moins un doit être fourni côté API)
 */
export interface SearchFilters {
  q?: string       // Recherche par mots-clés dans le titre/contenu
  author?: string  // Recherche par nom d'auteur
  date?: string    // Recherche par date (format YYYY-MM-DD)
}
