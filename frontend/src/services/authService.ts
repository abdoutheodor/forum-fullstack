// Service d'authentification
// Encapsule toutes les opérations liées à l'authentification et au profil utilisateur
// Gère aussi la persistance de la session dans localStorage

import api from './api';

/** Données nécessaires pour l'inscription */
export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

/** Données nécessaires pour la connexion */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Interface User locale du service (plus détaillée que types/index.ts)
 * Correspond exactement aux données renvoyées par le backend
 */
export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;   // URL de l'avatar (optionnel)
  bio?: string;      // Biographie (optionnel)
  is_admin: boolean; // true = accès aux fonctions d'administration dans l'UI
}

/**
 * Service centralisé pour toutes les opérations d'authentification
 */
export const authService = {
  /**
   * Inscription d'un nouvel utilisateur
   * Stocke le token et les données utilisateur dans localStorage après inscription
   * @returns L'objet utilisateur créé
   */
  async register(data: RegisterData) {
    const response = await api.post('/auth/register', data);
    if (response.data.success) {
      // Stockage du token JWT pour les prochaines requêtes
      localStorage.setItem('token', response.data.data.token);
      // Récupération du profil complet (l'inscription ne retourne que userId + token)
      const user = await this.getProfile();
      // Mise en cache du profil pour éviter une requête API à chaque rechargement
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    }
    throw new Error(response.data.message);
  },

  /**
   * Connexion d'un utilisateur existant
   * Stocke le token et les données utilisateur dans localStorage
   * @returns L'objet utilisateur connecté
   */
  async login(data: LoginData) {
    const response = await api.post('/auth/login', data);
    if (response.data.success) {
      // Stockage du token JWT
      localStorage.setItem('token', response.data.data.token);
      // Stockage du profil complet en cache local
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      return response.data.data.user;
    }
    throw new Error(response.data.message);
  },

  /**
   * Récupère le profil de l'utilisateur connecté depuis le serveur
   * Nécessite un token valide dans localStorage
   * @returns Les données fraîches du profil
   */
  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile');
    return response.data.data;
  },

  /**
   * Met à jour l'avatar et/ou la bio du profil connecté
   * Après mise à jour, rafraîchit le cache localStorage avec le nouveau profil
   * @returns Le profil mis à jour
   */
  async updateProfile(avatar?: string, bio?: string) {
    const response = await api.put('/auth/profile', { avatar, bio });
    if (response.data.success) {
      // Récupération du profil mis à jour pour rafraîchir le cache
      const user = await this.getProfile();
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    }
    throw new Error(response.data.message);
  },

  /**
   * Déconnecte l'utilisateur
   * Supprime toutes les données de session du localStorage et redirige vers /login
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  /**
   * Récupère l'utilisateur courant depuis le cache localStorage
   * Utilisé pour l'initialisation rapide sans requête API
   * @returns L'utilisateur en cache ou null si non connecté
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Vérifie si un token est présent dans localStorage
   * Ne valide PAS l'expiration ou la validité du token (le backend s'en charge)
   * @returns true si un token existe
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};
