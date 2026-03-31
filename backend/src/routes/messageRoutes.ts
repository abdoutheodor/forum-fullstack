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

/**
 * @swagger
 * /messages:
 *   post:
 *     tags: [Messages]
 *     summary: Envoyer un message privé
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiver_id
 *               - content
 *             properties:
 *               receiver_id:
 *                 type: integer
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message envoyé
 *       401:
 *         description: Non authentifié
 */
router.post('/', authenticate, messageValidation, sendMessage);

/**
 * @swagger
 * /messages/conversations:
 *   get:
 *     tags: [Messages]
 *     summary: Liste de mes conversations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des conversations
 *       401:
 *         description: Non authentifié
 */
router.get('/conversations', authenticate, getUserConversations);

// GET /api/messages/unread-count → Nombre de messages non lus
// Utilisé pour le badge de notification
router.get('/unread-count', authenticate, getUnreadCount);

/**
 * @swagger
 * /messages/conversation/{userId}:
 *   get:
 *     tags: [Messages]
 *     summary: Messages avec un utilisateur
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Messages de la conversation
 *       401:
 *         description: Non authentifié
 */
router.get('/conversation/:userId', authenticate, getConversation);

// DELETE /api/messages/:id → Supprime un message spécifique (seul l'expéditeur peut supprimer)
router.delete('/:id', authenticate, deleteMessage);

// DELETE /api/messages/conversation/:userId → Supprime toute la conversation avec un utilisateur
router.delete('/conversation/:userId', authenticate, deleteConversation);

export default router;
