# Nihongo Reader — Catalogue Externe (GitHub Pages)

Ce dépôt contient uniquement les textes, livres, livres-jeux, RPG et illustrations de **Nihongo Reader**, servis gratuitement via **GitHub Pages** afin de découpler les ajouts de contenu du build de l'application Web et Android.

## 1. Créer le dépôt sur GitHub et pousser ce dossier

```bash
cd gh-pages-content
git init -b main
git add .
git commit -m "Initial Nihongo Reader content catalog"
git remote add origin https://github.com/<VOTRE_PSEUDO>/<NOM_DU_DEPOT>.git
git push -u origin main
```

*(Le dépôt doit être **public** pour utiliser GitHub Pages gratuitement.)*

## 2. Activer GitHub Pages

1. Ouvrez votre dépôt sur GitHub → **Settings → Pages**.
2. Dans **Build and deployment** :
   - **Source** : `Deploy from a branch`
   - **Branch** : `main` / `/ (root)` → **Save**
3. Votre catalogue est ensuite accessible à :
   `https://<VOTRE_PSEUDO>.github.io/<NOM_DU_DEPOT>/manifest.json`

## 3. Connecter l'application Nihongo Reader

Dans l'environnement de l'application (ou lors du build Web/Android), définissez :

```env
VITE_CONTENT_BASE_URL="https://<VOTRE_PSEUDO>.github.io/<NOM_DU_DEPOT>"
```

## 4. Ajouter un nouveau livre plus tard

1. Placez les illustrations optimisées dans `images/`.
2. Ajoutez votre fichier `.json` dans `texts/`, `books/`, `gamebooks/` ou `rpg-gamebooks/` avec des chemins d'images relatifs (`"images/mon_image.jpg"`).
3. Poussez sur `main` (ou lancez `node scripts/build-manifest.mjs` localement avant de push) : le workflow GitHub Actions valide le JSON, les traductions ligne par ligne et régénère `manifest.json` automatiquement.
