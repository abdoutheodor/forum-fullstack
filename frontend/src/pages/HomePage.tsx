// Page d'accueil de présentation (landing page)
// Note : Ce composant n'est pas utilisé dans App.tsx (remplacé par Home.tsx)
// Il était probablement la version initiale de la page d'accueil

import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * Page d'accueil de présentation
 * Affiche :
 * - Un message de bienvenue
 * - 3 cards présentant les fonctionnalités (Discussions, Communauté, Recherche)
 * - Des boutons d'action adaptés selon l'état de connexion
 */
export function HomePage() {
  // Récupération de l'utilisateur connecté pour adapter l'affichage
  const { user } = useAuth()

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        Bienvenue sur notre Forum de Discussion
      </h1>

      <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
        Un espace d'échange où vous pouvez partager vos idées, poser des questions et interagir avec une communauté passionnée.
      </p>

      {/* Section des 3 fonctionnalités principales */}
      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">

        {/* Card Discussions */}
        <div className="card">
          <div className="text-primary-600 mb-4">
            {/* Icône SVG de bulle de discussion */}
            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Discussions</h3>
          <p className="text-gray-600">
            Participez à des discussions enrichissantes sur divers sujets
          </p>
        </div>

        {/* Card Communauté */}
        <div className="card">
          <div className="text-primary-600 mb-4">
            {/* Icône SVG de groupe de personnes */}
            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Communauté</h3>
          <p className="text-gray-600">
            Rejoignez une communauté active et bienveillante
          </p>
        </div>

        {/* Card Recherche */}
        <div className="card">
          <div className="text-primary-600 mb-4">
            {/* Icône SVG de loupe */}
            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Recherche</h3>
          <p className="text-gray-600">
            Trouvez facilement les sujets qui vous intéressent
          </p>
        </div>
      </div>

      {/* Section CTA (Call To Action) - s'adapte selon l'état de connexion */}
      <div className="space-y-4">
        {user ? (
          // Utilisateur connecté : accès rapide aux fonctionnalités principales
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              Bienvenue, {user.username} !
            </h2>
            <div className="space-x-4">
              <Link to="/posts" className="btn btn-primary">
                Voir les posts
              </Link>
              <Link to="/create-post" className="btn btn-primary">
                Créer un post
              </Link>
            </div>
          </div>
        ) : (
          // Utilisateur non connecté : invitation à rejoindre la communauté
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              Rejoignez notre communauté
            </h2>
            <div className="space-x-4">
              <Link to="/register" className="btn btn-primary">
                S'inscrire
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Se connecter
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
