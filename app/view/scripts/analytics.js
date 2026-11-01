/**
 * Helper de tracking Umami.
 *
 * Umami est chargé via le snippet dans `view/layout.php` (script auto-hébergé
 * sur umami.ilandols.com). Le trafic (pages vues, routes, referrers, pays,
 * navigateurs) est capté automatiquement ; ce helper ne sert qu'aux events
 * d'actions.
 *
 * Règle de confidentialité : ne jamais passer de donnée personnelle en
 * propriété (pseudo, email, mot de passe, contenu de commentaire...).
 * Uniquement des catégories ou des compteurs. Voir le catalogue dans
 * `analytics-events.md` (racine du repo).
 *
 * Le `?.` est volontaire : si le script Umami n'est pas (encore) chargé,
 * l'appel ne fait rien au lieu de planter.
 *
 * @typedef {Object} Umami
 * @property {(name: string, props?: Record<string, unknown>) => void} track
 *
 * @param {string} name
 * @param {Record<string, unknown>} [props]
 * @returns {void}
 */
export const trackEvent = (name, props) => {
	window.umami?.track(name, props)
}
