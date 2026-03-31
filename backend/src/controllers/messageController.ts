// Contrôleur de messagerie privée
// Gère l'envoi, la consultation et la suppression de messages entre utilisateurs

import { Response } from 'express';
import { MessageModel } from '../models/Message';
import { AuthRequest } from '../middleware/auth';

/**
 * Envoie un message privé à un autre utilisateur
 * Route: POST /api/messages
 * Nécessite authentification
 *
 * Body: { receiver_id: number, content: string }
 */
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { receiver_id, content } = req.body;
    const senderId = req.user!.id;

    // Sécurité : un utilisateur ne peut pas s'envoyer un message à lui-même
    if (senderId === receiver_id) {
      res.status(400).json({ success: false, message: 'Vous ne pouvez pas vous envoyer un message à vous-même' });
      return;
    }

    const messageId = await MessageModel.create(senderId, receiver_id, content);

    res.status(201).json({
      success: true,
      message: 'Message envoyé avec succès',
      data: { messageId }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Récupère la conversation entre l'utilisateur connecté et un autre utilisateur
 * Route: GET /api/messages/conversation/:userId?limit=50
 * Nécessite authentification
 *
 * Marque automatiquement les messages de l'interlocuteur comme lus lors de la consultation
 * Les messages sont retournés dans l'ordre chronologique (du plus ancien au plus récent)
 */
export const getConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const otherUserId = parseInt(req.params.userId);  // ID de l'interlocuteur
    const limit = parseInt(req.query.limit as string) || 50;

    // Récupération des messages (retournés du plus récent au plus ancien par la BDD)
    const messages = await MessageModel.getConversation(userId, otherUserId, limit);

    // Marque comme lus les messages envoyés par l'interlocuteur vers l'utilisateur connecté
    // (l'utilisateur vient d'ouvrir la conversation, donc il a "lu" les messages)
    await MessageModel.markAsRead(otherUserId, userId);

    res.json({
      success: true,
      // .reverse() pour afficher du plus ancien au plus récent (ordre naturel d'une conversation)
      data: messages.reverse()
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Récupère la liste de toutes les conversations de l'utilisateur connecté
 * Route: GET /api/messages/conversations
 * Nécessite authentification
 *
 * Retourne pour chaque conversation : l'interlocuteur (id, username, avatar)
 * et le dernier message échangé
 */
export const getUserConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const conversations = await MessageModel.getUserConversations(userId);

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Récupère le nombre de messages non lus de l'utilisateur connecté
 * Route: GET /api/messages/unread-count
 * Nécessite authentification
 *
 * Utilisé pour afficher le badge de notification dans l'interface
 */
export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const count = await MessageModel.getUnreadCount(userId);

    res.json({
      success: true,
      data: { unread_count: count }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Supprime un message spécifique
 * Route: DELETE /api/messages/:id
 * Nécessite authentification
 *
 * Un utilisateur ne peut supprimer que les messages qu'IL a envoyés
 * (vérification de propriété via sender_id dans MessageModel.deleteMessage)
 */
export const deleteMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const messageId = parseInt(req.params.id);

    const deleted = await MessageModel.deleteMessage(messageId, userId);

    if (!deleted) {
      // Message inexistant ou l'utilisateur n'en est pas l'expéditeur
      res.status(404).json({ success: false, message: 'Message non trouvé ou non autorisé' });
      return;
    }

    res.json({
      success: true,
      message: 'Message supprimé avec succès'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Supprime toute la conversation avec un autre utilisateur
 * Route: DELETE /api/messages/conversation/:userId
 * Nécessite authentification
 *
 * Supprime tous les messages échangés dans les deux sens entre les deux utilisateurs
 * Attention : cette action est irréversible
 */
export const deleteConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const otherUserId = parseInt(req.params.userId);

    await MessageModel.deleteConversation(userId, otherUserId);

    res.json({
      success: true,
      message: 'Conversation supprimée avec succès'
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
