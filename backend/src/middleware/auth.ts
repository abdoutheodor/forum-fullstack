// Importation des types Express pour typer les paramètres des fonctions middleware
import { Request, Response, NextFunction } from 'express';
// Importation de la bibliothèque jsonwebtoken pour vérifier les tokens JWT
import jwt from 'jsonwebtoken';
// Importation du modèle User pour accéder aux données utilisateur
import { UserModel } from '../models/User';

/**
 * Interface AuthRequest qui étend Request d'Express
 * Ajoute une propriété 'user' optionnelle contenant les infos de l'utilisateur authentifié
 * Cette interface est utilisée dans tous les contrôleurs qui nécessitent l'authentification
 */
export interface AuthRequest extends Request {
  user?: {
    id: number;           // ID unique de l'utilisateur
    email: string;        // Email de l'utilisateur
    is_admin: boolean;    // Indique si l'utilisateur est administrateur
  };
}

/**
 * Middleware d'authentification
 * Vérifie que l'utilisateur a un token JWT valide dans l'en-tête Authorization
 * Si valide, ajoute les informations utilisateur à req.user
 * Sinon, renvoie une erreur 401 (Non autorisé)
 */
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Extraction du token depuis l'en-tête Authorization (format: "Bearer TOKEN")
    // split(' ')[1] récupère la partie après "Bearer "
    const token = req.headers.authorization?.split(' ')[1];

    // Si aucun token n'est fourni, retourner une erreur 401
    if (!token) {
      res.status(401).json({ success: false, message: 'Token manquant' });
      return;
    }

    // Vérification et décodage du token JWT avec la clé secrète
    // Si le token est invalide ou expiré, une exception sera levée
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Récupération des informations complètes de l'utilisateur depuis la base de données
    const user = await UserModel.findById(decoded.id);
    
    // Si l'utilisateur n'existe plus en base de données, retourner une erreur
    if (!user) {
      res.status(401).json({ success: false, message: 'Utilisateur non trouvé' });
      return;
    }

    // Vérification si l'utilisateur est banni
    // Si oui, interdire l'accès avec un code 403 (Forbidden)
    if (user.is_banned) {
      res.status(403).json({ success: false, message: 'Utilisateur banni' });
      return;
    }

    // Ajout des informations utilisateur à l'objet Request
    // Ces informations seront accessibles dans tous les contrôleurs suivants
    req.user = {
      id: user.id,
      email: user.email,
      is_admin: user.is_admin
    };

    // Passage au middleware/contrôleur suivant
    next();
  } catch (error) {
    // En cas d'erreur (token invalide, expiré, etc.), retourner une erreur 401
    res.status(401).json({ success: false, message: 'Token invalide' });
    return;
  }
};

/**
 * Middleware de vérification des droits administrateur
 * Doit être utilisé APRÈS le middleware authenticate
 * Vérifie que l'utilisateur authentifié a les droits d'administrateur
 */
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // Vérification si l'utilisateur est admin
  // Si non, retourner une erreur 403 (Forbidden)
  if (!req.user?.is_admin) {
    res.status(403).json({ success: false, message: 'Accès réservé aux administrateurs' });
    return;
  }
  // Si admin, passer au contrôleur suivant
  next();
};
