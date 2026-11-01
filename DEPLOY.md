# Déploiement — CHCJJr. SERI Portfolio

## Architecture

| Partie | Hébergeur recommandé |
|--------|----------------------|
| Front (Vue + Vite) | **Vercel** |
| API (Express) | **Render** ou **Railway** |
| Base PostgreSQL | **Neon** (déjà en place) |

Vercel héberge le site statique. L’API Express doit tourner ailleurs (Node long-running).

---

## 1. GitHub — remplacer le contenu du dépôt

```bash
# Dans le dossier de CE portfolio (pas l’ancien)
cd chemin/vers/portfolio-actuel

git init
git add .
git commit -m "Portfolio Vue.js — version production"

# Branche main
git branch -M main

# Lier au dépôt existant (remplace tout l’historique distant si tu forces)
git remote add origin https://github.com/drikrianjunior-debug/JJr-Portfolio.git

# ATTENTION : écrase le contenu distant
git push -u origin main --force
```

Si GitHub demande une authentification : utilise un **Personal Access Token** (Settings → Developer settings → Tokens) à la place du mot de passe.

---

## 2. API sur Render (exemple)

1. [render.com](https://render.com) → New → Web Service
2. Connecte le même dépôt GitHub
3. Réglages :
   - **Root Directory** : (racine)
   - **Build Command** : `npm install`
   - **Start Command** : `npx tsx server/index.ts`
   - **Instance** : Free
4. Variables d’environnement :
   - `DATABASE_URL` = chaîne Neon
   - `JWT_SECRET` = secret ≥ 32 caractères
   - `CLIENT_ORIGIN` = `https://ton-projet.vercel.app` (et éventuellement le domaine custom)
   - `PORT` = fourni par Render (souvent automatique)
5. Déploie → note l’URL type `https://xxx.onrender.com`

---

## 3. Front sur Vercel

1. [vercel.com](https://vercel.com) → Add New Project → importe `JJr-Portfolio`
2. Framework : Vite (détecté)
3. Build : `vite build` / Output : `dist`
4. Variable d’environnement :
   - `VITE_API_URL` = `https://xxx.onrender.com` (URL de l’API, **sans** slash final)
5. Deploy

Après le premier deploy, mets à jour `CLIENT_ORIGIN` sur Render avec l’URL Vercel exacte, puis redéploie l’API.

---

## 4. Vérifications

- Site : `https://ton-projet.vercel.app`
- Santé API : `https://xxx.onrender.com/api/health` → `{"ok":true}`
- Connexion admin avec les identifiants créés via `npm run admin:create`

---

## Notes

- Ne commit **jamais** le fichier `.env`
- Sur le plan gratuit Render, l’API s’endort après inactivité (~50 s au réveil)
- Pour un domaine custom : Vercel → Domains
