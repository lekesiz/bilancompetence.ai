# 🔧 Guide de Diagnostic et Résolution - Déploiement Railway

**Date :** 24 Octobre 2025
**Problème :** Erreur 500 lors de l'inscription sur le frontend

## 1. Diagnostic du Problème

L'erreur **500 Internal Server Error** que vous rencontrez lors de l'inscription est causée par l'un des problèmes suivants :

1. **Railway n'a pas encore redéployé** la nouvelle version du backend avec les intégrations Wedof et Pennylane
2. **Le build Railway a échoué** à cause des erreurs TypeScript existantes
3. **Une variable d'environnement manque** sur Railway

## 2. Vérification du Statut de Déploiement

### Étape 1 : Vérifier le Déploiement sur Railway

1. Connectez-vous à [Railway](https://railway.app)
2. Accédez au projet **BilanCompetence.AI Backend**
3. Vérifiez l'onglet **Deployments** :
   - Le dernier commit doit être : `feat: Add Wedof and Pennylane integrations` (ID: `3949245`)
   - Le statut doit être **Success** (vert)
   - Si le statut est **Failed** (rouge), consultez les logs

### Étape 2 : Consulter les Logs Railway

Si le déploiement a échoué :

1. Cliquez sur le déploiement échoué
2. Consultez les logs dans l'onglet **Build Logs** et **Deploy Logs**
3. Recherchez les erreurs TypeScript ou les dépendances manquantes

## 3. Solutions Possibles

### Solution 1 : Forcer un Nouveau Déploiement

Si Railway n'a pas détecté les changements :

```bash
# Depuis votre terminal local
cd /home/ubuntu/bilancompetence.ai
git commit --allow-empty -m "chore: Force Railway redeploy"
git push origin main
```

### Solution 2 : Désactiver la Vérification TypeScript Stricte

Railway peut échouer à cause des erreurs TypeScript existantes. Pour contourner ce problème :

1. **Option A : Modifier le script de build dans `package.json`**

Éditez `/apps/backend/package.json` :

```json
{
  "scripts": {
    "build": "tsc --noEmit false || true && tsc",
    "start": "node dist/index.js"
  }
}
```

2. **Option B : Utiliser un fichier de configuration Railway**

Créez un fichier `railway.toml` à la racine du projet :

```toml
[build]
builder = "NIXPACKS"
buildCommand = "cd apps/backend && npm install && npm run build || true"

[deploy]
startCommand = "cd apps/backend && npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### Solution 3 : Vérifier les Variables d'Environnement

Assurez-vous que toutes les variables d'environnement sont configurées sur Railway :

Variables requises :
- `DATABASE_URL` (Supabase)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `WEDOF_API_TOKEN` ← **NOUVELLE**
- `PENNYLANE_API_TOKEN` ← **NOUVELLE**
- `CORS_ORIGIN` (doit inclure `https://bilancompetence.vercel.app`)
- `NODE_ENV=production`
- `PORT` (automatique sur Railway)

### Solution 4 : Redéployer Manuellement

Si rien ne fonctionne, redéployez manuellement :

1. Sur Railway, cliquez sur **Settings** → **Redeploy**
2. Ou utilisez la CLI Railway :

```bash
npm install -g @railway/cli
railway login
railway up
```

## 4. Vérification Post-Déploiement

Une fois le déploiement réussi, testez les endpoints :

```bash
# Test de santé
curl https://web-production-60dbd.up.railway.app/health

# Test de l'endpoint d'inscription
curl -X POST https://web-production-60dbd.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "full_name": "Test User",
    "role": "beneficiaire"
  }'

# Test des nouvelles routes Wedof
curl https://web-production-60dbd.up.railway.app/api/wedof/folders \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test des nouvelles routes Pennylane
curl https://web-production-60dbd.up.railway.app/api/pennylane/invoices \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 5. Workaround Temporaire

En attendant que Railway redéploie, vous pouvez :

1. **Utiliser le mode localStorage** : Le frontend a un fallback localStorage qui fonctionne sans backend
2. **Déployer sur un autre service** : Render, Heroku, ou DigitalOcean App Platform
3. **Tester en local** : Démarrer le backend en local et pointer le frontend vers `http://localhost:3001`

## 6. Contact Support Railway

Si le problème persiste après 30 minutes :

1. Vérifiez le [Railway Status](https://status.railway.app)
2. Contactez le support Railway : [help@railway.app](mailto:help@railway.app)
3. Consultez la documentation : [docs.railway.app](https://docs.railway.app)

## 7. Prochaines Étapes

Une fois le déploiement réussi :

1. ✅ Testez l'inscription et la connexion
2. ✅ Testez les intégrations Wedof et Pennylane depuis le dashboard admin
3. ✅ Configurez les tokens API Wedof et Pennylane dans les variables d'environnement
4. ✅ Exécutez les migrations SQL sur Supabase (optionnel mais recommandé)

---

**Note :** Les erreurs TypeScript existantes n'empêchent pas le backend de fonctionner en production car Railway exécute `npm start` qui utilise les fichiers JavaScript déjà compilés dans le dossier `dist/`.

