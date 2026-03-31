/**
 * Interfaces TypeScript représentant les entités de la base de données
 * Ces types sont utilisés dans toute l'application pour garantir la cohérence des données
 */

/**
 * Représente un utilisateur de la plateforme
 */
export interface User {
  id: number;           // Identifiant unique auto-incrémenté
  username: string;     // Nom d'utilisateur unique
  email: string;        // Adresse email unique (utilisée pour la connexion)
  password: string;     // Mot de passe hashé avec bcrypt (jamais envoyé au client)
  avatar?: string;      // URL de l'image de profil (optionnel)
  bio?: string;         // Courte biographie de l'utilisateur (optionnel)
  is_admin: boolean;    // true = accès aux routes admin
  is_banned: boolean;   // true = accès bloqué à l'API
  created_at: Date;     // Date de création du compte
  updated_at: Date;     // Date de dernière modification
}

/**
 * Représente un post (article) publié dans le forum
 */
export interface Post {
  id: number;           // Identifiant unique auto-incrémenté
  user_id: number;      // Clé étrangère vers l'auteur (users.id)
  title: string;        // Titre du post
  content: string;      // Corps du post (texte complet)
  likes_count: number;  // Compteur de likes (mis à jour par trigger ou manuellement)
  created_at: Date;     // Date de publication
  updated_at: Date;     // Date de dernière modification
}

/**
 * Représente un commentaire sur un post
 * Supporte les réponses imbriquées via parent_comment_id
 */
export interface Comment {
  id: number;                   // Identifiant unique auto-incrémenté
  post_id: number;              // Clé étrangère vers le post commenté
  user_id: number;              // Clé étrangère vers l'auteur du commentaire
  parent_comment_id?: number;   // Si défini, ce commentaire est une réponse à un autre commentaire
  content: string;              // Texte du commentaire
  created_at: Date;             // Date de publication
  updated_at: Date;             // Date de dernière modification
}

/**
 * Représente un "like" associant un utilisateur à un post
 * La combinaison (user_id, post_id) est unique pour éviter les doublons
 */
export interface Like {
  id: number;       // Identifiant unique auto-incrémenté
  user_id: number;  // Clé étrangère vers l'utilisateur qui a liké
  post_id: number;  // Clé étrangère vers le post liké
  created_at: Date; // Date du like
}

/**
 * Représente un signalement d'un utilisateur par un autre
 * Utilisé par les administrateurs pour la modération
 */
export interface Report {
  id: number;                                      // Identifiant unique auto-incrémenté
  reporter_id: number;                             // ID de l'utilisateur qui fait le signalement
  reported_user_id: number;                        // ID de l'utilisateur signalé
  reason: string;                                  // Motif du signalement
  status: 'pending' | 'reviewed' | 'resolved';    // État du traitement par les admins
  created_at: Date;                                // Date du signalement
}
