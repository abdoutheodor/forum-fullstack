// Configuration Axios de base pour les services
// Ce fichier est utilisé par tous les services (authService, postService, etc.)
// Il est similaire à utils/api.ts mais sans les endpoints groupés par domaine

import axios from 'axios';

// URL de base lue depuis les variables d'environnement Vite
// Définie dans .env : VITE_API_URL=http://localhost:5000/api
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Instance Axios partagée par tous les services
 * Configure l'URL de base et le header Content-Type pour toutes les requêtes
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Intercepteur de requête : injection automatique du token JWT
 * Lit le token depuis localStorage et l'ajoute à l'en-tête Authorization
 * Format : "Bearer <token>" (attendu par le middleware authenticate du backend)
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Intercepteur de réponse : gestion automatique des erreurs 401
 * Si l'API répond 401 (token invalide ou expiré) :
 * - Supprime le token et les données utilisateur du localStorage
 * - Redirige vers la page de connexion
 * Différence avec utils/api.ts : ne montre PAS de toast d'erreur automatique
 */
api.interceptors.response.use(
  // Cas succès : réponse retournée sans modification
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Nettoyage complet du localStorage (token + données utilisateur mises en cache)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirection hard vers /login (recharge complète la page)
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
