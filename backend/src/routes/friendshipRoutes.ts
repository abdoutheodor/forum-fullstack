// Routes de gestion des amis
// Préfixe : /api/friendships (défini dans server.ts)
// Toutes les routes nécessitent une authentification

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriends,
  getPendingRequests,
  getSentRequests
} from '../controllers/friendshipController';

const router = Router();

/**
 * @swagger
 * /friendships/request:
 *   post:
 *     tags: [Friendships]
 *     summary: Envoyer une demande d'ami
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *             properties:
 *               receiverId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Demande envoyée
 *       401:
 *         description: Non authentifié
 */
router.post('/request', authenticate, sendFriendRequest);

/**
 * @swagger
 * /friendships/accept:
 *   post:
 *     tags: [Friendships]
 *     summary: Accepter une demande d'ami
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requesterId
 *             properties:
 *               requesterId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Demande acceptée
 *       401:
 *         description: Non authentifié
 */
router.post('/accept', authenticate, acceptFriendRequest);

// POST /api/friendships/reject → Refuse une demande d'ami reçue
// Body: { requesterId: number }
router.post('/reject', authenticate, rejectFriendRequest);

// DELETE /api/friendships/:friendId → Supprime un ami de sa liste
// Supprime la relation dans les deux sens
router.delete('/:friendId', authenticate, removeFriend);

/**
 * @swagger
 * /friendships/list:
 *   get:
 *     tags: [Friendships]
 *     summary: Liste de mes amis
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des amis
 *       401:
 *         description: Non authentifié
 */
router.get('/list', authenticate, getFriends);

/**
 * @swagger
 * /friendships/pending:
 *   get:
 *     tags: [Friendships]
 *     summary: Demandes d'ami reçues
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Demandes en attente
 *       401:
 *         description: Non authentifié
 */
router.get('/pending', authenticate, getPendingRequests);

// GET /api/friendships/sent → Récupère les demandes d'ami envoyées en attente
router.get('/sent', authenticate, getSentRequests);

export default router;
