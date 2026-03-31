// Hook d'authentification alternatif (version avec React Query)
// Note : Ce hook n'est PAS celui utilisé par les composants actuels
// Les composants utilisent useAuth depuis context/AuthContext.tsx
// Ce fichier utilise react-query pour le cache des données serveur

import { useContext, createContext, useEffect, useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { User } from '../types'
import { authAPI } from '../utils/api'

/**
 * Interface du contexte d'authentification (version React Query)
 */
interface AuthContextType {
  user: User | null
  isLoading: boolean                                                              // true pendant le chargement du profil
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
}

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Provider d'authentification utilisant React Query
 * Différence avec context/AuthContext.tsx :
 * - Utilise useQuery de react-query pour le cache automatique du profil
 * - Le profil est rechargé automatiquement quand enabled=true (quand token présent)
 * - Gère les erreurs de token via onError de useQuery
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Token stocké dans l'état local ET dans localStorage pour la persistance
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  )
  // Client React Query pour mettre à jour le cache manuellement
  const queryClient = useQueryClient()

  // Récupération du profil via React Query
  // enabled: !!token → ne fait la requête que si un token existe
  const { data: user, isLoading, error } = useQuery<User>(
    'profile',           // Clé du cache React Query
    authAPI.getProfile,  // Fonction de fetch
    {
      enabled: !!token,  // Désactivé si pas de token
      retry: false,      // Ne pas réessayer si la requête échoue (token invalide)
      onError: () => {
        // Si le profil est inaccessible (token expiré) → déconnexion
        setToken(null)
        localStorage.removeItem('token')
      },
    }
  )

  // Effet secondaire : si une erreur survient, nettoyer le token
  useEffect(() => {
    if (error) {
      setToken(null)
      localStorage.removeItem('token')
    }
  }, [error])

  /**
   * Connexion : appelle l'API, stocke le token, met à jour le cache React Query
   */
  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password })
      const { user: userData, token: newToken } = response.data

      setToken(newToken)
      localStorage.setItem('token', newToken)
      // Mise à jour manuelle du cache React Query avec les données de l'utilisateur
      queryClient.setQueryData('profile', userData)
    } catch (error) {
      throw error
    }
  }

  /**
   * Inscription : même comportement que login mais avec les données d'inscription
   */
  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await authAPI.register({ username, email, password })
      const { user: userData, token: newToken } = response.data

      setToken(newToken)
      localStorage.setItem('token', newToken)
      queryClient.setQueryData('profile', userData)
    } catch (error) {
      throw error
    }
  }

  /**
   * Déconnexion : supprime le token, vide le cache React Query
   */
  const logout = () => {
    setToken(null)
    localStorage.removeItem('token')
    queryClient.setQueryData('profile', null) // Vide le cache du profil
    queryClient.clear()                       // Vide tout le cache React Query
  }

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook pour accéder au contexte d'authentification (version React Query)
 * @throws Erreur si utilisé en dehors d'un AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
