# Analytics Events · Umami (CraftyPic)

Catalogue des events trackés sur CraftyPic via Umami (instance auto-hébergée
`umami.ilandols.com`, site `craftypic.ilandols.com`).

Le **trafic** (pages vues, referrers, pays, navigateurs) est capté
automatiquement par le snippet dans `app/view/layout.php` · aucun event à poser.
CraftyPic étant une app PHP multi-pages, chaque navigation interne est un
rechargement complet, donc déjà comptée comme page vue : les tableaux ci-dessous
ne concernent que les **actions**.

> **Confidentialité** : aucune donnée personnelle en propriété (pas de pseudo,
> email, mot de passe ni contenu de commentaire). Uniquement des catégories ou
> des compteurs.
>
> **Méthode** : `track()` = helper `trackEvent()` de `app/view/scripts/analytics.js`
> (`window.umami?.track`). Tous les events sont posés au **point de succès** de
> la requête AJAX (ou, pour les confirmations serveur, sur la vue de succès).

---

## 🔐 Auth & compte

| Event                     | Déclencheur                                            | Props | Méthode   | Fichier    |
| ------------------------- | ------------------------------------------------------ | ----- | --------- | ---------- |
| `signin`                  | `POST /login` → 201                                    | –     | `track()` | `auth.js`  |
| `signup`                  | `POST /signup` → 201                                   | –     | `track()` | `auth.js`  |
| `logout`                  | `POST /logout` → 200                                   | –     | `track()` | `home.js`, `create.js`, `settings.js` |
| `password-forgot-request` | `POST /login/forgot-password` → 201                    | –     | `track()` | `auth.js`  |
| `password-reset`          | `POST /login/reinitialization` → 201                   | –     | `track()` | `auth.js`  |
| `account-activated`       | vue de succès d'activation (`/signup?token=…`)         | –     | `track()` (inline) | `auth_activate.php` |

---

## 🖼️ Galerie / feed

| Event          | Déclencheur                                       | Props | Méthode   | Fichier   |
| -------------- | ------------------------------------------------- | ----- | --------- | --------- |
| `pic-like`     | `POST /like` → 201 (like ajouté)                  | –     | `track()` | `pic.js`  |
| `pic-unlike`   | `POST /like` → 200 (like retiré)                  | –     | `track()` | `pic.js`  |
| `comment-post` | `POST /comment` → 201 · compteur seul, **aucun contenu** | – | `track()` | `pic.js`  |
| `pic-delete`   | `DELETE /?picId` → 200                            | –     | `track()` | `home.js` |

---

## 🎨 Éditeur / création

| Event                  | Déclencheur                                   | Props                  | Méthode   | Fichier     |
| ---------------------- | --------------------------------------------- | ---------------------- | --------- | ----------- |
| `editor-photo-capture` | prise d'une photo via la caméra               | –                      | `track()` | `create.js` |
| `editor-image-import`  | import d'une image depuis la galerie          | –                      | `track()` | `create.js` |
| `pic-create`           | `POST /create` → 201 (publication)            | `{ count: number }` (nb de pics du lot) | `track()` | `create.js` |

---

## ⚙️ Paramètres

| Event                           | Déclencheur                                     | Props                                      | Méthode   | Fichier       |
| ------------------------------- | ----------------------------------------------- | ------------------------------------------ | --------- | ------------- |
| `settings-username-update`      | `POST /settings/update` (username) → 200        | –                                          | `track()` | `settings.js` |
| `settings-email-update-request` | `POST /settings/update` (email) → 200           | –                                          | `track()` | `settings.js` |
| `settings-password-update`      | `POST /settings/update` (password) → 200        | –                                          | `track()` | `settings.js` |
| `settings-avatar-update`        | `POST /settings/update` (avatar) → 200          | –                                          | `track()` | `settings.js` |
| `settings-notification-toggle`  | changement d'une checkbox notif → 200           | `{ type: "like" \| "comment", enabled: boolean }` | `track()` | `settings.js` |
| `settings-password-reset-request` | `POST /settings/forgot-password` → 201        | –                                          | `track()` | `settings.js` |
| `email-update-confirmed`        | vue de succès de changement d'email (`/login/updated`) | –                                   | `track()` (inline) | `auth_updated.php` |

---

## Snippet & helper

- **Snippet** (`app/view/layout.php`, dans le `<head>`) :

  ```php
  <?php $umamiTag = (strpos($_ENV['URL'] ?? '', 'localhost') !== false) ? 'development' : 'production'; ?>
  <script defer src="https://umami.ilandols.com/script.js"
      data-website-id="e9e7d0a7-d75d-4a42-a9d2-f356364e1d0a" data-tag="<?php echo $umamiTag; ?>"></script>
  ```

  `data-tag` distingue dev/prod depuis `$_ENV['URL']` (équivalent PHP du `%MODE%`
  de Vite). Le `data-website-id` est un identifiant **public**, donc en dur.

- **Helper** (`app/view/scripts/analytics.js`) : `trackEvent(name, props)` qui
  appelle `window.umami?.track(name, props)`. Le `?.` évite tout crash si le
  script Umami n'est pas chargé.
