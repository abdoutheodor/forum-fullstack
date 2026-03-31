// Routes de messagerie privée
// Préfixe : /api/messages (défini dans server.ts)
// Toutes les routes nécessitent une authentification

import { Router } from 'express';
import {
  sendMessage,
  getConversation,
  getUserConversations,
  getUnreadCount,
  deleteMessage,
  deleteConversation
} from '../controllers/messageController';
import { authenticate } from '../middleware/auth';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();

// Validation spécifique aux messages (définie localement car non partagée avec d'autres routes)
const messageValidation = [
  body('receiver_id').isInt().withMessage('ID du destinataire invalide'),          // Doit être un entier
  body('content').trim().notEmpty().withMessage('Le contenu du message ne peut pas être vide'),
  handleValidationErrors  // Collecte et retourne les erreurs si présentes
];

// POST /api/messages → Envoie un message privé à un autre utilisateur
// Body: { receiver_id: number, content: string }
router.post('/', authenticate, messageValidation, sendMessage);

// GET /api/messages/conversations → Liste toutes les conversations de l'utilisateur
// Retourne pour chaque conversation : l'interlocuteur et le dernier message
// IMPORTANT : doit être avant /conversation/:userId pour éviter la collision de routes
router.get('/conversations', authenticate, getUserConversations);

// GET /api/messages/unread-count → Nombre de messages non lus
// Utilisé pour le badge de notification
router.get('/unread-count', authenticate, getUnreadCount);

// GET /api/messages/conversation/:userId → Récupère les messages échangés avec un utilisateur
// Marque automatiquement les messages de l'interlocuteur comme lus
router.get('/conversation/:userId', authenticate, getConversation);

// DELETE /api/messages/:id → Supprime un message spécifique (seul l'expéditeur peut supprimer)
router.delete('/:id', authenticate, deleteMessage);

// DELETE /api/messages/conversation/:userId → Supprime toute la conversation avec un utilisateur
router.delete('/conversation/:userId', authenticate, deleteConversation);

export default router;
