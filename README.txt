CHCJJr. SERI, by VinCi — PORTFOLIO
====================================

À PROPOS
Portfolio one-page responsive de Christ Hervé Charles Joseph Junior Seri,
développeur web Fullstack et infographe. Le contenu professionnel reprend les
informations du CV fourni. La typographie Poppins est utilisée car elle est
visuellement proche de celle du document (la police intégrée exacte n'était pas
identifiable dans le texte extrait). Palette noir, blanc et jaune-or.

FONCTIONNALITÉS
- Landing page responsive, animations d'entrée légères via Motion for Vue
  (motion-v), transitions CSS, préchargeur et navigation fixe en bas.
- Thème clair/sombre.
- Sections Profil, Expériences, Réalisations, Formation, Compétences, Contact.
- Gestion privée des réalisations après connexion : ajouter, modifier, supprimer.
- Champs projet : nom, URL de démonstration, icône/monogramme, date de fin,
  stack technique.
- API Express et base PostgreSQL Neon. Seulement deux tables applicatives :
  admin et realisation.
- Mot de passe admin haché avec bcrypt ; JWT à durée limitée ; validation
  basique des données côté serveur.

PRÉREQUIS
Node.js 20 ou plus récent, npm et un compte Neon PostgreSQL.

INSTALLATION LOCALE
1. Décompressez le dossier du projet.
2. Dans ce dossier, exécutez : npm install
3. Copiez .env.example vers .env.
4. Dans Neon, créez un projet PostgreSQL et copiez la chaîne de connexion
   (de préférence la pooled connection string) dans DATABASE_URL.
5. Dans .env, définissez JWT_SECRET avec une valeur aléatoire longue
   d'au moins 32 caractères. Définissez également CLIENT_ORIGIN=http://localhost:5173.
6. Créez les deux tables : npm run db:setup
7. Ajoutez les identifiants d'admin dans .env, par exemple :
   ADMIN_EMAIL=admin@votre-domaine.com
   ADMIN_PASSWORD=une-phrase-de-passe-longue-et-unique
8. Créez le compte : npm run admin:create
9. Lancez l'app : npm run dev
10. Ouvrez http://localhost:5173. L'API tourne sur http://localhost:8787.

IMPORTANT : ADMIN_EMAIL et ADMIN_PASSWORD sont utilisés uniquement lors de
la commande de création du compte. Ne partagez jamais le fichier .env.
N'intégrez jamais DATABASE_URL ou JWT_SECRET dans le code du navigateur.

GESTION DES RÉALISATIONS
Cliquez sur « Espace admin » puis connectez-vous. Une fois connecté, l'icône
d'ajout apparaît dans le menu inférieur. Les boutons modifier/supprimer sont
visibles sur les cartes de projets. Les changements sont enregistrés dans Neon.
Les projets de démonstration intégrés au front-end servent de fallback tant que
l'API ne renvoie pas de données ; remplacez-les par vos vraies réalisations.

DÉPLOIEMENT
- Front-end : Vercel ou Netlify.
- API : Render, Railway ou un hébergeur Node compatible.
- Base : Neon.
- Configurez DATABASE_URL, JWT_SECRET, PORT et CLIENT_ORIGIN dans les variables
  d'environnement du serveur. CLIENT_ORIGIN doit correspondre à l'URL exacte
  du site public. Utilisez HTTPS en production.
- Déployez le front-end en configurant le proxy /api vers l'API publique, ou
  adaptez les appels fetch à une variable VITE_API_URL et configurez CORS.
- Le serveur Express doit être déployé séparément de l'application statique.
  Le script build produit le front dans dist ; configurez l'hébergement API pour
  exécuter server/index.ts avec tsx ou ajoutez un build serveur selon l'hébergeur.
- Après déploiement, lancez db:setup et admin:create depuis un environnement
  sécurisé muni des variables Neon et admin.

SÉCURITÉ / LIMITES
- Cette base est un starter fonctionnel à personnaliser et tester avant mise en
  production. Ajoutez une limitation de tentatives de connexion, journalisation,
  sauvegardes Neon, validation renforcée, et politique de sécurité HTTP.
- Le JWT est stocké en mémoire côté front-end ; une actualisation de page
  déconnecte l'admin (comportement volontairement simple). La clé ne doit pas
  être mise dans localStorage sans stratégie de sécurité réfléchie.
- La mise en page est une interprétation créative du CV. Les projets affichés
  initialement sont des liens repris du CV et ne prétendent pas décrire tous les
  projets réalisés.
