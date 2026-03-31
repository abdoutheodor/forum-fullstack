// Contrôleur de recherche de posts
// Supporte trois modes de recherche : par mots-clés, par auteur ou par date

import { Request, Response } from 'express';
import { PostModel } from '../models/Post';

/**
 * Recherche des posts selon différents critères
 * Route: GET /api/search?q=motcle&limit=20
 *        GET /api/search?author=username&limit=20
 *        GET /api/search?date=2024-01-15&limit=20
 * Accessible sans authentification
 *
 * Les paramètres sont mutuellement exclusifs : q > author > date (par priorité)
 * Au moins un critère est obligatoire (validé par searchValidation middleware)
 */
export const searchPosts = async (req: Request, res: Response) => {
  try {
    // Extraction des paramètres de recherche depuis la query string
    const { q, author, date } = req.query;
    const limit = parseInt(req.query.limit as string) || 20;

    let posts;

    // Sélection du mode de recherche selon les paramètres fournis
    // Priorité : q (mots-clés) > author (auteur) > date
    if (q) {
      // Recherche textuelle dans le titre et le contenu du post
      posts = await PostModel.search(q as string, limit);
    } else if (author) {
      // Recherche par nom d'utilisateur de l'auteur (recherche partielle)
      posts = await PostModel.searchByAuthor(author as string, limit);
    } else if (date) {
      // Recherche par date de publication (format YYYY-MM-DD)
      posts = await PostModel.searchByDate(date as string, limit);
    } else {
      // Aucun critère fourni → erreur de validation (normalement bloqué par searchValidation)
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir au moins un critère de recherche (q, author, ou date)'
      });
    }

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
