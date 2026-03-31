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

// POST /api/friendships/request → Envoie une demande d'ami
// Body: { receiverId: number }
router.post('/request', authenticate, sendFriendRequest);

// POST /api/friendships/accept → Accepte une demande d'ami reçue
// Body: { requesterId: number }
router.post('/accept', authenticate, acceptFriendRequest);

// POST /api/friendships/reject → Refuse une demande d'ami reçue
// Body: { requesterId: number }
router.post('/reject', authenticate, rejectFriendRequest);

// DELETE /api/friendships/:friendId → Supprime un ami de sa liste
// Supprime la relation dans les deux sens
router.delete('/:friendId', authenticate, removeFriend);

// GET /api/friendships/list → Récupère la liste des amis (relations acceptées)
router.get('/list', authenticate, getFriends);

// GET /api/friendships/pending → Récupère les demandes d'ami reçues en attente
router.get('/pending', authenticate, getPendingRequests);

// GET /api/friendships/sent → Récupère les demandes d'ami envoyées en attente
router.get('/sent', authenticate, getSentRequests);

export default router;
