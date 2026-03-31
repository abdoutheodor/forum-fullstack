// Importation des hooks React nécessaires pour créer un contexte global
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Importation du service d'authentification et du type User
import { authService, User } from '../services/authService';

/**
 * Interface définissant le type du contexte d'authentification
 * Contient toutes les fonctions et données liées à l'authentification
 */
interface AuthContextType {
  user: User | null;                                                    // Utilisateur connecté (null si non connecté)
  loading: boolean;                                                     // Indique si le chargement initial est en cours
  login: (email: string, password: string) => Promise<void>;            // Fonction de connexion
  register: (username: string, email: string, password: string) => Promise<void>;  // Fonction d'inscription
  logout: () => void;                                                   // Fonction de déconnexion
  updateUser: (user: User) => void;                                     // Fonction pour mettre à jour les infos utilisateur
}

/**
 * Création du contexte d'authentification
 * Ce contexte sera accessible dans toute l'application via useAuth()
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Composant Provider qui enveloppe l'application
 * Fournit le contexte d'authentification à tous les composants enfants
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // État pour stocker l'utilisateur connecté (null si non connecté)
  const [user, setUser] = useState<User | null>(null);
  // État pour indiquer si l'initialisation de l'auth est en cours
  const [loading, setLoading] = useState(true);

  /**
   * Hook useEffect qui s'exécute au montage du composant
   * Vérifie si un utilisateur est déjà connecté (token dans localStorage)
   */
  useEffect(() => {
    const initAuth = async () => {
      // Récupération de l'utilisateur depuis le localStorage
      const currentUser = authService.getCurrentUser();
      // Si un utilisateur existe et que le token est valide
      if (currentUser && authService.isAuthenticated()) {
        try {
          // Récupération des données fraîches depuis le serveur
          const freshUser = await authService.getProfile();
          setUser(freshUser);
        } catch (error) {
          // Si erreur (token expiré, etc.), déconnecter l'utilisateur
          authService.logout();
        }
      }
      // Fin du chargement initial
      setLoading(false);
    };

    // Exécution de l'initialisation
    initAuth();
  }, []);  // [] = s'exécute une seule fois au montage

  /**
   * Fonction de connexion
   * Appelle le service d'authentification et met à jour l'état utilisateur
   */
  const login = async (email: string, password: string) => {
    // Appel au service de connexion (stocke le token et retourne les données utilisateur)
    const userData = await authService.login({ email, password });
    // Mise à jour de l'état avec les données utilisateur
    setUser(userData);
  };

  /**
   * Fonction d'inscription
   * Crée un nouveau compte et connecte automatiquement l'utilisateur
   */
  const register = async (username: string, email: string, password: string) => {
    // Appel au service d'inscription
    const userData = await authService.register({ username, email, password });
    // Mise à jour de l'état avec les données utilisateur
    setUser(userData);
  };

  /**
   * Fonction de déconnexion
   * Supprime le token du localStorage et réinitialise l'état utilisateur
   */
  const logout = () => {
    // Suppression du token du localStorage
    authService.logout();
    // Réinitialisation de l'état utilisateur
    setUser(null);
  };

  /**
   * Fonction pour mettre à jour les informations utilisateur
   * Utilisée après modification du profil par exemple
   */
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  // Fourniture du contexte à tous les composants enfants
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personnalisé pour accéder au contexte d'authentification
 * Doit être utilisé à l'intérieur d'un composant enveloppé par AuthProvider
 * @returns Le contexte d'authentification avec user, login, logout, etc.
 * @throws Erreur si utilisé en dehors d'un AuthProvider
 */
export const useAuth = () => {
  // Récupération du contexte
  const context = useContext(AuthContext);
  // Vérification que le hook est bien utilisé dans un AuthProvider
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
