// Middleware global de gestion des erreurs Express
// Ce fichier est le dernier middleware de la chaîne : il intercepte toutes les erreurs
// non gérées et retourne une réponse JSON cohérente au client

import { Request, Response, NextFunction } from 'express';

/**
 * Gestionnaire d'erreurs global
 * Signature Express spéciale avec 4 paramètres : Express reconnaît ce middleware comme gestionnaire d'erreurs
 *
 * @param err   - L'objet Error capturé (message + stack trace)
 * @param _req  - La requête HTTP (non utilisée ici, préfixée _ par convention)
 * @param res   - La réponse HTTP
 * @param _next - La fonction next (non utilisée mais requise par la signature Express)
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log de la stack trace complète dans la console du serveur pour le débogage
  console.error(err.stack);

  res.status(500).json({
    success: false,
    // Utilise le message de l'erreur s'il existe, sinon message générique
    message: err.message || 'Internal Server Error',
    // En mode développement seulement : inclure la stack trace dans la réponse
    // En production, on ne révèle pas les détails internes pour des raisons de sécurité
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
