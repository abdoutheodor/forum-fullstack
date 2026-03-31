// Routes d'administration
// Préfixe : /api/admin (défini dans server.ts)
// Toutes les routes nécessitent : token JWT valide + droits administrateur (sauf createReport)

import { Router } from 'express';
import {
  getAllUsers,
  banUser,
  deletePostByAdmin,
  deleteCommentByAdmin,
  createReport,
  getAllReports,
  updateReportStatus
} from '../controllers/adminController';
import { authenticate, isAdmin } from '../middleware/auth';
import { reportValidation, idParamValidation } from '../middleware/validation';

const router = Router();

// ─── Gestion des utilisateurs ───────────────────────────────────────────────

/**
 * @swagger
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Liste tous les utilisateurs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès admin requis
 */
router.get('/users', authenticate, isAdmin, getAllUsers);

/**
 * @swagger
 * /admin/users/{id}/ban:
 *   post:
 *     tags: [Admin]
 *     summary: Bannir/débannir un utilisateur
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - is_banned
 *             properties:
 *               is_banned:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Statut modifié
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès admin requis
 */
router.post('/users/:id/ban', authenticate, isAdmin, idParamValidation, banUser);

// ─── Modération du contenu ──────────────────────────────────────────────────

// DELETE /api/admin/posts/:id → Supprime n'importe quel post (sans restriction de propriété)
// Accès : admin uniquement
router.delete('/posts/:id', authenticate, isAdmin, idParamValidation, deletePostByAdmin);

// DELETE /api/admin/comments/:id → Supprime n'importe quel commentaire
// Accès : admin uniquement
router.delete('/comments/:id', authenticate, isAdmin, idParamValidation, deleteCommentByAdmin);

// ─── Gestion des signalements ───────────────────────────────────────────────

// POST /api/admin/reports → Crée un signalement contre un utilisateur
// Accès : tout utilisateur authentifié (pas besoin d'être admin pour signaler)
router.post('/reports', authenticate, reportValidation, createReport);

/**
 * @swagger
 * /admin/reports:
 *   get:
 *     tags: [Admin]
 *     summary: Liste des signalements
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, reviewed, resolved]
 *     responses:
 *       200:
 *         description: Liste des signalements
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès admin requis
 */
router.get('/reports', authenticate, isAdmin, getAllReports);

// PUT /api/admin/reports/:id/status → Met à jour le statut d'un signalement
// Body: { status: 'pending' | 'reviewed' | 'resolved' }
// Accès : admin uniquement
router.put('/reports/:id/status', authenticate, isAdmin, idParamValidation, updateReportStatus);

export default router;
