// Point d'entrée de l'application React
// Ce fichier monte l'application dans l'élément HTML #root défini dans index.html

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css' // Import des styles globaux (Tailwind CSS + classes personnalisées)

// React.StrictMode active des vérifications supplémentaires en développement :
// - Détecte les effets de bord non intentionnels
// - Avertit sur l'utilisation de méthodes dépréciées
// - N'a aucun impact en production
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
