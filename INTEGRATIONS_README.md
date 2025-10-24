# 🔌 Guide d'Utilisation des Intégrations Wedof & Pennylane

**BilanCompetence.AI** - Documentation des Intégrations Tierces

## Vue d'Ensemble

Ce document explique comment utiliser les intégrations **Wedof** et **Pennylane** dans la plateforme BilanCompetence.AI. Ces intégrations permettent de gérer automatiquement la formation et la facturation sans quitter l'application.

## 1. Intégration Wedof

### Description

Wedof est une plateforme de gestion de la formation professionnelle. L'intégration permet de :
- Créer et gérer des dossiers d'inscription
- Ajouter et suivre les stagiaires (attendees)
- Gérer les actions de formation
- Synchroniser les données avec Wedof

### Accès

**URL :** [https://bilancompetence.vercel.app/dashboard/admin/integrations/wedof](https://bilancompetence.vercel.app/dashboard/admin/integrations/wedof)

**Navigation :**
1. Connectez-vous en tant qu'administrateur
2. Accédez au **Tableau de Bord Admin**
3. Cliquez sur la carte **Wedof** (icône 🎓)

### Fonctionnalités

#### 1.1. Gestion des Dossiers d'Inscription

**Créer un Nouveau Dossier :**
1. Cliquez sur **+ Nouveau dossier**
2. Remplissez le formulaire :
   - **Nom du dossier** : Nom descriptif (ex: "Bilan de Compétences Q4 2025")
   - **Description** : Détails du programme
   - **Date de début** : Date de démarrage
   - **Date de fin** : Date de clôture
3. Cliquez sur **Créer**

**Consulter les Dossiers :**
- Tous les dossiers apparaissent dans la colonne de gauche
- Cliquez sur un dossier pour voir ses stagiaires
- Le badge de statut indique si le dossier est actif ou archivé

#### 1.2. Gestion des Stagiaires

**Ajouter un Stagiaire :**
1. Sélectionnez un dossier d'inscription
2. Cliquez sur **+ Nouveau stagiaire**
3. Remplissez le formulaire :
   - **Prénom** et **Nom**
   - **Email** (obligatoire)
   - **Téléphone**
   - **Adresse complète** (optionnel)
4. Cliquez sur **Créer**

**Consulter les Stagiaires :**
- Les stagiaires du dossier sélectionné apparaissent dans la colonne de droite
- Chaque carte affiche les informations du stagiaire et son statut

#### 1.3. Synchronisation

Le bouton **🔄 Synchroniser avec Wedof** permet de :
- Récupérer les dernières données depuis Wedof
- Mettre à jour les statuts des dossiers et stagiaires
- Synchroniser les nouvelles créations

**Fréquence recommandée :** 1 fois par jour ou avant chaque rapport

### API Endpoints

Pour les développeurs, voici les endpoints disponibles :

```bash
# Lister tous les dossiers
GET /api/wedof/folders

# Créer un nouveau dossier
POST /api/wedof/folders
{
  "name": "Nom du dossier",
  "description": "Description",
  "start_date": "2025-01-01",
  "end_date": "2025-12-31"
}

# Lister les stagiaires d'un dossier
GET /api/wedof/folders/:folderId/attendees

# Ajouter un stagiaire à un dossier
POST /api/wedof/folders/:folderId/attendees
{
  "first_name": "Jean",
  "last_name": "Dupont",
  "email": "jean.dupont@example.com",
  "phone": "+33612345678"
}

# Synchroniser avec Wedof
POST /api/wedof/sync
```

## 2. Intégration Pennylane

### Description

Pennylane est une plateforme de comptabilité et de facturation. L'intégration permet de :
- Créer et gérer des factures
- Gérer la base de données clients
- Suivre les paiements et échéances
- Synchroniser les données comptables

### Accès

**URL :** [https://bilancompetence.vercel.app/dashboard/admin/integrations/pennylane](https://bilancompetence.vercel.app/dashboard/admin/integrations/pennylane)

**Navigation :**
1. Connectez-vous en tant qu'administrateur
2. Accédez au **Tableau de Bord Admin**
3. Cliquez sur la carte **Pennylane** (icône 💰)

### Fonctionnalités

#### 2.1. Gestion des Factures

**Créer une Nouvelle Facture :**
1. Dans l'onglet **📄 Factures**, cliquez sur **+ Nouvelle facture**
2. Remplissez le formulaire :
   - **Client** : Sélectionnez un client existant
   - **Montant** : Montant en euros (ex: 1500.00)
   - **Description** : Description de la prestation
   - **Date d'échéance** : Date limite de paiement
3. Cliquez sur **Créer**

**Consulter les Factures :**
- Tableau avec toutes les factures
- Colonnes : N° Facture, Client, Montant, Date, Échéance, Statut
- Statuts possibles :
  - **Payée** (vert) : Facture réglée
  - **En attente** (jaune) : Facture envoyée, en attente de paiement
  - **En retard** (rouge) : Échéance dépassée

#### 2.2. Gestion des Clients

**Créer un Nouveau Client :**
1. Dans l'onglet **👥 Clients**, cliquez sur **+ Nouveau client**
2. Remplissez le formulaire :
   - **Nom du client** : Nom de l'entreprise ou du particulier
   - **Email** et **Téléphone**
   - **Adresse complète** : Adresse, Ville, Code postal, Pays
3. Cliquez sur **Créer**

**Consulter les Clients :**
- Cartes affichant chaque client
- Informations visibles : Nom, Email, Téléphone
- Statistiques : Nombre de factures, Montant total

#### 2.3. Synchronisation

Le bouton **🔄 Synchroniser avec Pennylane** permet de :
- Récupérer les dernières factures depuis Pennylane
- Mettre à jour les statuts de paiement
- Synchroniser la base de données clients

**Fréquence recommandée :** 1 fois par jour ou après chaque facturation

### API Endpoints

Pour les développeurs, voici les endpoints disponibles :

```bash
# Lister toutes les factures
GET /api/pennylane/invoices

# Créer une nouvelle facture
POST /api/pennylane/invoices
{
  "customer_id": "customer_123",
  "amount": 1500.00,
  "description": "Bilan de compétences - Jean Dupont",
  "due_date": "2025-11-30"
}

# Lister tous les clients
GET /api/pennylane/customers

# Créer un nouveau client
POST /api/pennylane/customers
{
  "name": "Entreprise ABC",
  "email": "contact@abc.com",
  "phone": "+33123456789",
  "address": "123 Rue de la Paix",
  "city": "Paris",
  "postal_code": "75001",
  "country": "France"
}

# Synchroniser avec Pennylane
POST /api/pennylane/sync
```

## 3. Configuration des Tokens API

### Variables d'Environnement

Les tokens API doivent être configurés dans les variables d'environnement de Railway :

```bash
# Token Wedof
WEDOF_API_TOKEN=a21c02tr2dea3f077d5f92b1cd8f4c6779b904c2e

# Token Pennylane
PENNYLANE_API_TOKEN=XHTDMQAano9jHjNJ18Cny7vFJIdNfpumPKsZHQWPzZ8
```

### Mise à Jour des Tokens

Si vous devez changer les tokens :

1. **Sur Railway :**
   - Accédez au projet backend
   - Cliquez sur **Variables**
   - Modifiez `WEDOF_API_TOKEN` ou `PENNYLANE_API_TOKEN`
   - Railway redémarrera automatiquement

2. **Sur Vercel :**
   - Aucune configuration nécessaire (le frontend utilise le backend)

## 4. Sécurité et Bonnes Pratiques

### Sécurité

- ✅ Les tokens API sont stockés uniquement côté backend
- ✅ Toutes les requêtes nécessitent une authentification JWT
- ✅ Seuls les administrateurs peuvent accéder aux intégrations
- ✅ Les communications avec Wedof et Pennylane utilisent HTTPS

### Bonnes Pratiques

1. **Synchronisation régulière** : Synchronisez au moins une fois par jour
2. **Vérification des données** : Vérifiez les données après chaque synchronisation
3. **Sauvegarde** : Exportez régulièrement les données importantes
4. **Logs** : Consultez les logs Railway en cas de problème
5. **Support** : Contactez le support Wedof ou Pennylane si nécessaire

## 5. Dépannage

### Problème : "Erreur lors de la synchronisation"

**Solutions :**
1. Vérifiez que les tokens API sont corrects
2. Vérifiez votre connexion Internet
3. Consultez les logs Railway pour plus de détails
4. Contactez le support Wedof/Pennylane

### Problème : "Aucun dossier/client trouvé"

**Solutions :**
1. Cliquez sur **Synchroniser** pour récupérer les données
2. Créez un premier dossier/client manuellement
3. Vérifiez que vous avez les permissions nécessaires

### Problème : "Page d'intégration inaccessible"

**Solutions :**
1. Vérifiez que vous êtes connecté en tant qu'administrateur
2. Videz le cache de votre navigateur
3. Vérifiez que le backend Railway est en ligne

## 6. Support

Pour toute question ou problème :

- **Documentation Wedof :** [https://www.wedof.fr/api/doc](https://www.wedof.fr/api/doc)
- **Documentation Pennylane :** [https://pennylane.com/developers](https://pennylane.com/developers)
- **Support BilanCompetence.AI :** Contactez votre administrateur système

---

**Dernière mise à jour :** 24 Octobre 2025
**Version :** 1.0.0

