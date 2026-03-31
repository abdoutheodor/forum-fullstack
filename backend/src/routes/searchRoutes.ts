// Routes de recherche de posts
// Préfixe : /api/search (défini dans server.ts)

import { Router } from 'express';
import { searchPosts } from '../controllers/searchController';
import { searchValidation } from '../middleware/validation';

const router = Router();

// GET /api/search?q=motcle          → Recherche par mots-clés (titre ou contenu)
// GET /api/search?author=username   → Recherche par nom d'auteur
// GET /api/search?date=YYYY-MM-DD   → Recherche par date de publication
// Paramètre commun optionnel : &limit=20
//
// searchValidation valide les paramètres avant d'appeler le contrôleur
// Au moins un des paramètres (q, author, date) doit être fourni
router.get('/', searchValidation, searchPosts);

export default router;
