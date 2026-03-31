// Configuration Axios et définition des endpoints de l'API
// Ce fichier (utils/api.ts) est utilisé par hooks/useAuth et d'autres composants
// Note : services/api.ts est une configuration similaire utilisée par les services

import axios from 'axios'
import toast from 'react-hot-toast'

// URL de base de l'API, configurée via variable d'environnement Vite
// VITE_API_URL doit être défini dans .env pour la production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

/**
 * Instance Axios configurée avec l'URL de base et le header JSON
 * Tous les appels API doivent utiliser cette instance pour bénéficier des intercepteurs
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Intercepteur de requête : injecte automatiquement le token JWT dans chaque requête
 * Le token est lu depuis localStorage (stocké lors de la connexion)
 * Format attendu par le backend : "Bearer <token>"
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Intercepteur de réponse : gestion globale des erreurs HTTP
 * - Affiche un toast d'erreur pour toutes les erreurs
 * - Déconnecte automatiquement l'utilisateur si la réponse est 401 (token expiré/invalide)
 */
api.interceptors.response.use(
  // Cas succès : retourne la réponse sans modification
  (response) => response,
  (error) => {
    // Extraction du message d'erreur du backend ou message générique
    const message = error.response?.data?.message || 'Une erreur est survenue'
    // Affichage du toast d'erreur en haut à droite de l'écran
    toast.error(message)

    if (error.response?.status === 401) {
      // Token invalide ou expiré : nettoyage du localStorage et redirection vers /login
      localStorage.removeItem('token')
      window.location.href = '/login'
    }

    // On re-lance l'erreur pour que les composants puissent aussi la gérer si nécessaire
    return Promise.reject(error)
  }
)

/**
 * Endpoints d'authentification
 * Utilisés pour la connexion, l'inscription et la récupération du profil
 */
export const authAPI = {
  // POST /api/auth/login → Connexion avec email/password
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),

  // POST /api/auth/register → Inscription avec username/email/password
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),

  // GET /api/auth/profile → Profil de l'utilisateur connecté (nécessite token)
  getProfile: () =>
    api.get('/auth/profile'),
}

/**
 * Endpoints des posts
 * Opérations CRUD sur les posts + likes et commentaires
 */
export const postsAPI = {
  // GET /api/posts → Liste tous les posts
  getAll: () =>
    api.get('/posts'),

  // GET /api/posts/:id → Un post spécifique
  getById: (id: number) =>
    api.get(`/posts/${id}`),

  // POST /api/posts → Crée un post (authentification requise)
  create: (data: { title: string; content: string }) =>
    api.post('/posts', data),

  // PUT /api/posts/:id → Modifie un post (auteur uniquement)
  update: (id: number, data: { title: string; content: string }) =>
    api.put(`/posts/${id}`, data),

  // DELETE /api/posts/:id → Supprime un post (auteur ou admin)
  delete: (id: number) =>
    api.delete(`/posts/${id}`),

  // POST /api/posts/:id/like → Like/unlike un post (toggle)
  like: (id: number) =>
    api.post(`/posts/${id}/like`),

  // GET /api/posts/:id/comments → Commentaires d'un post
  getComments: (id: number) =>
    api.get(`/posts/${id}/comments`),

  // POST /api/posts/:postId/comments → Ajoute un commentaire (parentId pour les réponses)
  addComment: (postId: number, data: { content: string; parentId?: number }) =>
    api.post(`/posts/${postId}/comments`, data),

  // DELETE /api/comments/:id → Supprime un commentaire (auteur ou admin)
  deleteComment: (id: number) =>
    api.delete(`/comments/${id}`),
}

/**
 * Endpoints d'administration (réservés aux admins)
 */
export const adminAPI = {
  // GET /api/admin/users → Liste tous les utilisateurs
  getUsers: () =>
    api.get('/admin/users'),

  // POST /api/admin/users/:id/ban → Banne un utilisateur
  banUser: (id: number) =>
    api.post(`/admin/users/${id}/ban`),

  // GET /api/admin/reports → Liste tous les signalements
  getReports: () =>
    api.get('/admin/reports'),
}

/**
 * Endpoints de recherche
 */
export const searchAPI = {
  // GET /api/search?q=...&author=...&date=... → Recherche de posts
  search: (params: { q?: string; author?: string; date?: string }) =>
    api.get('/search', { params }),
}
