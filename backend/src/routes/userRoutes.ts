// Routes des utilisateurs (profils publics et recherche)
// Préfixe : /api/users (défini dans server.ts)

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { searchUsers, getUserById } from '../controllers/userController';

const router = Router();

// GET /api/users/search?query=motcle → Recherche des utilisateurs par username ou email
// Exclut l'utilisateur courant des résultats
// Nécessite : token JWT (pour identifier qui cherche et s'exclure)
// IMPORTANT : cette route doit être déclarée AVANT /:id pour ne pas être capturée par elle
router.get('/search', authenticate, searchUsers);

// GET /api/users/:id → Récupère le profil public d'un utilisateur
// Nécessite : token JWT (les profils ne sont visibles que par les membres connectés)
router.get('/:id', authenticate, getUserById);

export default router;
