// Routes des likes
// Préfixe : /api (défini dans server.ts)
// Les URLs complètes sont : /api/posts/:postId/like et /api/posts/:postId/likes

import { Router } from 'express';
import { toggleLike, getPostLikes } from '../controllers/likeController';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/posts/:postId/like → Bascule le like (like/unlike) sur un post
// Comportement toggle : like si pas encore liké, unlike si déjà liké
// Nécessite : token JWT (on doit savoir qui like)
router.post('/posts/:postId/like', authenticate, toggleLike);

// GET /api/posts/:postId/likes → Récupère le nombre de likes et l'état du like de l'utilisateur
// Retourne : { count: number, userLiked: boolean }
// Nécessite : token JWT (pour savoir si l'utilisateur courant a liké)
router.get('/posts/:postId/likes', authenticate, getPostLikes);

export default router;
