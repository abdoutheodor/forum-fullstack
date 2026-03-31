// Importation de l'instance axios configurée pour les appels API
import api from './api';

/**
 * Interface représentant un ami ou une demande d'ami
 * Utilisée pour typer les données reçues du backend
 */
export interface Friend {
  id: number;                                          // ID de la relation d'amitié
  user_id: number;                                     // ID de l'ami
  username: string;                                    // Nom d'utilisateur de l'ami
  email: string;                                       // Email de l'ami
  avatar?: string;                                     // URL de l'avatar (optionnel)
  status: 'pending' | 'accepted' | 'rejected';         // Statut de la demande
  created_at: string;                                  // Date de création de la demande
}

/**
 * Interface représentant un utilisateur dans les résultats de recherche
 */
export interface User {
  id: number;              // ID unique de l'utilisateur
  username: string;        // Nom d'utilisateur
  email: string;           // Email
  avatar?: string;         // URL de l'avatar (optionnel)
  bio?: string;            // Biographie (optionnel)
}

/**
 * Service de gestion des amis
 * Contient toutes les fonctions pour interagir avec l'API des amitiés
 */
export const friendService = {
  /**
   * Rechercher des utilisateurs par nom d'utilisateur ou email
   * @param query - Terme de recherche (nom d'utilisateur ou email)
   * @returns Liste des utilisateurs correspondant à la recherche
   */
  searchUsers: async (query: string): Promise<User[]> => {
    // Appel GET vers /api/users/search avec le paramètre query
    // encodeURIComponent encode les caractères spéciaux pour l'URL
    const response = await api.get(`/users/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },

  /**
   * Envoyer une demande d'ami à un utilisateur
   * @param receiverId - ID de l'utilisateur à qui envoyer la demande
   */
  sendRequest: async (receiverId: number) => {
    // Appel POST vers /api/friendships/request avec l'ID du destinataire
    const response = await api.post('/friendships/request', { receiverId });
    return response.data;
  },

  /**
   * Accepter une demande d'ami reçue
   * @param requesterId - ID de l'utilisateur qui a envoyé la demande
   */
  acceptRequest: async (requesterId: number) => {
    // Appel POST vers /api/friendships/accept
    const response = await api.post('/friendships/accept', { requesterId });
    return response.data;
  },

  /**
   * Rejeter une demande d'ami reçue
   * @param requesterId - ID de l'utilisateur qui a envoyé la demande
   */
  rejectRequest: async (requesterId: number) => {
    // Appel POST vers /api/friendships/reject
    const response = await api.post('/friendships/reject', { requesterId });
    return response.data;
  },

  /**
   * Supprimer un ami de sa liste
   * @param friendId - ID de l'ami à supprimer
   */
  removeFriend: async (friendId: number) => {
    // Appel DELETE vers /api/friendships/:friendId
    const response = await api.delete(`/friendships/${friendId}`);
    return response.data;
  },

  /**
   * Récupérer la liste de tous ses amis (statut 'accepted')
   * @returns Liste des amis
   */
  getFriends: async (): Promise<Friend[]> => {
    // Appel GET vers /api/friendships/list
    const response = await api.get('/friendships/list');
    return response.data;
  },

  /**
   * Récupérer les demandes d'ami reçues en attente
   * @returns Liste des demandes reçues (statut 'pending')
   */
  getPendingRequests: async (): Promise<Friend[]> => {
    // Appel GET vers /api/friendships/pending
    const response = await api.get('/friendships/pending');
    return response.data;
  },

  /**
   * Récupérer les demandes d'ami envoyées en attente
   * @returns Liste des demandes envoyées (statut 'pending')
   */
  getSentRequests: async (): Promise<Friend[]> => {
    // Appel GET vers /api/friendships/sent
    const response = await api.get('/friendships/sent');
    return response.data;
  },
};
