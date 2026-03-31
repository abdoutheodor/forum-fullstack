// Routes des utilisateurs (profils publics et recherche)
// Préfixe : /api/users (défini dans server.ts)

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { searchUsers, getUserById } from '../controllers/userController';

const router = Router();

/**
 * @swagger
 * /users/search:
 *   get:
 *     tags: [Users]
 *     summary: Rechercher des utilisateurs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Résultats de recherche
 *       401:
 *         description: Non authentifié
 */
router.get('/search', authenticate, searchUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Profil public d'un utilisateur
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Profil utilisateur
 *       401:
 *         description: Non authentifié
 */
router.get('/:id', authenticate, getUserById);

export default router;
