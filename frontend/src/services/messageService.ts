// Importation de l'instance axios configurée pour les appels API
import api from './api';

/**
 * Interface représentant un message privé
 * Utilisée pour typer les messages individuels dans une conversation
 */
export interface Message {
  id: number;                    // ID unique du message
  sender_id: number;             // ID de l'expéditeur
  receiver_id: number;           // ID du destinataire
  content: string;               // Contenu du message
  is_read: boolean;              // Indique si le message a été lu
  created_at: string;            // Date de création du message
  sender_username?: string;      // Nom d'utilisateur de l'expéditeur (optionnel)
  receiver_username?: string;    // Nom d'utilisateur du destinataire (optionnel)
}

/**
 * Interface représentant une conversation dans la liste des conversations
 * Contient un résumé de la conversation avec le dernier message
 */
export interface Conversation {
  user_id: number;           // ID de l'interlocuteur
  username: string;          // Nom d'utilisateur de l'interlocuteur
  avatar?: string;           // URL de l'avatar (optionnel)
  last_message: string;      // Dernier message de la conversation
  last_message_time: string; // Date du dernier message
  unread_count: number;      // Nombre de messages non lus
}

/**
 * Service de gestion des messages privés
 * Contient toutes les fonctions pour interagir avec l'API de messagerie
 */
export const messageService = {
  /**
   * Envoyer un message privé à un utilisateur
   * @param receiverId - ID du destinataire
   * @param content - Contenu du message
   */
  async sendMessage(receiverId: number, content: string) {
    // Appel POST vers /api/messages avec l'ID du destinataire et le contenu
    const response = await api.post('/messages', {
      receiver_id: receiverId,
      content,
    });
    return response.data;
  },

  /**
   * Récupérer tous les messages d'une conversation avec un utilisateur
   * @param userId - ID de l'interlocuteur
   * @param limit - Nombre maximum de messages à récupérer (par défaut 50)
   * @returns Liste des messages de la conversation
   */
  async getConversation(userId: number, limit = 50): Promise<Message[]> {
    // Appel GET vers /api/messages/conversation/:userId avec limite optionnelle
    const response = await api.get(`/messages/conversation/${userId}?limit=${limit}`);
    return response.data.data;
  },

  /**
   * Récupérer la liste de toutes les conversations de l'utilisateur
   * Retourne un résumé de chaque conversation avec le dernier message
   * @returns Liste des conversations
   */
  async getConversations(): Promise<Conversation[]> {
    // Appel GET vers /api/messages/conversations
    const response = await api.get('/messages/conversations');
    return response.data.data;
  },

  /**
   * Récupérer le nombre de messages non lus
   * Utile pour afficher un badge de notification
   * @returns Nombre de messages non lus
   */
  async getUnreadCount(): Promise<number> {
    // Appel GET vers /api/messages/unread-count
    const response = await api.get('/messages/unread-count');
    return response.data.data.unread_count;
  },

  /**
   * Supprimer un message spécifique
   * @param messageId - ID du message à supprimer
   */
  async deleteMessage(messageId: number) {
    // Appel DELETE vers /api/messages/:messageId
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },

  /**
   * Supprimer toute une conversation avec un utilisateur
   * @param userId - ID de l'interlocuteur
   */
  async deleteConversation(userId: number) {
    // Appel DELETE vers /api/messages/conversation/:userId
    const response = await api.delete(`/messages/conversation/${userId}`);
    return response.data;
  },
};
