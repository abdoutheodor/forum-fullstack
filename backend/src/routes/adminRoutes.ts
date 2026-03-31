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

// GET /api/admin/users → Liste tous les utilisateurs (avec pagination)
// Accès : admin uniquement
router.get('/users', authenticate, isAdmin, getAllUsers);

// POST /api/admin/users/:id/ban → Banne ou débanne un utilisateur
// Body: { is_banned: boolean }
// Accès : admin uniquement
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

// GET /api/admin/reports → Liste tous les signalements (filtrables par statut)
// Accès : admin uniquement
router.get('/reports', authenticate, isAdmin, getAllReports);

// PUT /api/admin/reports/:id/status → Met à jour le statut d'un signalement
// Body: { status: 'pending' | 'reviewed' | 'resolved' }
// Accès : admin uniquement
router.put('/reports/:id/status', authenticate, isAdmin, idParamValidation, updateReportStatus);

export default router;
