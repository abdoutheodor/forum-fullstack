// Middlewares de validation des entrées utilisateur
// Utilise la bibliothèque express-validator pour définir des règles de validation
// et les appliquer avant d'atteindre les contrôleurs

import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware intermédiaire qui collecte les erreurs de validation accumulées
 * par les règles précédentes et retourne une réponse 400 si des erreurs existent.
 * Doit être placé EN DERNIER dans chaque tableau de validation.
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  // Si des erreurs existent, on les renvoie au client avec le statut 400 Bad Request
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }
  // Aucune erreur : on passe au contrôleur suivant
  next();
};

/**
 * Règles de validation pour l'inscription d'un nouvel utilisateur
 * Vérifie le format de l'username, de l'email et la longueur du mot de passe
 */
export const registerValidation = [
  body('username')
    .trim()                                   // Suppression des espaces en début/fin
    .isLength({ min: 3, max: 50 })            // Entre 3 et 50 caractères
    .withMessage('Le nom d\'utilisateur doit contenir entre 3 et 50 caractères'),
  body('email')
    .trim()
    .isEmail()                                // Format email valide (xxx@xxx.xx)
    .withMessage('Email invalide'),
  body('password')
    .isLength({ min: 6 })                     // Au moins 6 caractères pour la sécurité
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  handleValidationErrors                      // Collecte et retourne les erreurs si présentes
];

/**
 * Règles de validation pour la connexion
 * Vérifie que l'email est valide et que le mot de passe est fourni
 */
export const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email invalide'),
  body('password')
    .notEmpty()                               // Le champ ne doit pas être vide
    .withMessage('Mot de passe requis'),
  handleValidationErrors
];

/**
 * Règles de validation pour la création et modification d'un post
 * Vérifie les longueurs du titre et du contenu
 */
export const postValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 255 })           // Titre entre 3 et 255 caractères
    .withMessage('Le titre doit contenir entre 3 et 255 caractères'),
  body('content')
    .trim()
    .isLength({ min: 10 })                    // Contenu d'au moins 10 caractères
    .withMessage('Le contenu doit contenir au moins 10 caractères'),
  handleValidationErrors
];

/**
 * Règles de validation pour la création d'un commentaire
 * Vérifie que le contenu n'est ni vide ni trop long
 */
export const commentValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })          // Entre 1 et 1000 caractères
    .withMessage('Le commentaire doit contenir entre 1 et 1000 caractères'),
  handleValidationErrors
];

/**
 * Règles de validation pour la création d'un signalement
 * Vérifie que l'ID de l'utilisateur signalé est un entier et que la raison est fournie
 */
export const reportValidation = [
  body('reported_user_id')
    .isInt()                                  // Doit être un nombre entier
    .withMessage('ID utilisateur invalide'),
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })          // Entre 10 et 500 caractères pour forcer une explication
    .withMessage('La raison doit contenir entre 10 et 500 caractères'),
  handleValidationErrors
];

/**
 * Règle de validation pour les paramètres d'URL de type :id
 * Vérifie que l'ID passé dans l'URL est bien un entier (protège contre les injections)
 */
export const idParamValidation = [
  param('id')
    .isInt()                                  // L'ID doit être un entier valide
    .withMessage('ID invalide'),
  handleValidationErrors
];

/**
 * Règles de validation pour les paramètres de recherche
 * Tous les champs sont optionnels mais doivent respecter un format si fournis
 */
export const searchValidation = [
  query('q')
    .optional()                               // Paramètre facultatif
    .trim()
    .isLength({ min: 1 })                     // Si fourni, doit contenir au moins 1 caractère
    .withMessage('Requête de recherche invalide'),
  query('author')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Nom d\'auteur invalide'),
  query('date')
    .optional()
    .isDate()                                 // Format de date valide (YYYY-MM-DD)
    .withMessage('Date invalide (format: YYYY-MM-DD)'),
  handleValidationErrors
];
