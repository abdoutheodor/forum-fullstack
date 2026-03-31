// Routes d'authentification
// Préfixe : /api/auth (défini dans server.ts)

import { Router } from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { registerValidation, loginValidation } from '../middleware/validation';

const router = Router();

// POST /api/auth/register → Inscription d'un nouvel utilisateur
// Middlewares : registerValidation (valide username/email/password avant d'appeler le contrôleur)
router.post('/register', registerValidation, register);

// POST /api/auth/login → Connexion et obtention d'un token JWT
// Middlewares : loginValidation (valide email/password)
router.post('/login', loginValidation, login);

// GET /api/auth/profile → Récupère le profil de l'utilisateur connecté
// Middlewares : authenticate (vérifie le token JWT)
router.get('/profile', authenticate, getProfile);

// PUT /api/auth/profile → Met à jour le profil (avatar, bio)
// Middlewares : authenticate (vérifie le token JWT)
router.put('/profile', authenticate, updateProfile);

export default router;
