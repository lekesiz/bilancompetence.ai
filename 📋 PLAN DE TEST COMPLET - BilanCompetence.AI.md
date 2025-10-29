# 📋 PLAN DE TEST COMPLET - BilanCompetence.AI

**Date:** 25 Octobre 2025
**Objectif:** Tester tous les scénarios utilisateurs avant la livraison finale

---

## 1. TYPES D'UTILISATEURS

### A. Visiteur (Non connecté)
- Personne qui découvre le site pour la première fois
- Peut consulter les pages publiques
- Doit pouvoir s'inscrire

### B. Nouveau Utilisateur (Inscription en cours)
- Personne en train de créer un compte
- Doit compléter le processus d'inscription
- Doit être redirigé vers le dashboard après inscription

### C. Utilisateur Connecté (Bénéficiaire)
- Utilisateur avec compte actif
- Peut créer et gérer des assessments
- Peut passer des tests psychométriques
- Peut consulter ses résultats

### D. Conseiller (si applicable)
- Peut voir les assessments de ses clients
- Peut générer des rapports

### E. Administrateur (si applicable)
- Accès à toutes les fonctionnalités
- Gestion des utilisateurs et organisations

---

## 2. SCÉNARIOS DE TEST PAR TYPE D'UTILISATEUR

### 🔵 PHASE 1: Tests Visiteur (Non connecté)

| ID | Scénario | Actions | Résultat Attendu |
|:---|:---------|:--------|:-----------------|
| V1 | Accès page d'accueil | Ouvrir https://bilancompetence.vercel.app/ | Page s'affiche correctement |
| V2 | Navigation menu | Cliquer sur tous les liens du menu | Toutes les pages s'affichent |
| V3 | Clic "Commencer mon bilan" | Cliquer sur le CTA principal | Redirection vers /register |
| V4 | Consultation page "Qu'est-ce qu'un bilan ?" | Naviguer vers la page | Contenu affiché correctement |
| V5 | Consultation page "Méthodologie" | Naviguer vers la page | Contenu affiché correctement |
| V6 | Consultation page "Financement" | Naviguer vers la page | Contenu affiché correctement |
| V7 | Consultation page "FAQ" | Naviguer vers la page | Contenu affiché correctement |
| V8 | Consultation page "Contact" | Naviguer vers la page | Formulaire affiché correctement |
| V9 | Tentative d'accès dashboard sans connexion | Aller sur /dashboard | Redirection vers /login |

### 🟢 PHASE 2: Tests Nouveau Utilisateur (Inscription)

| ID | Scénario | Actions | Résultat Attendu |
|:---|:---------|:--------|:-----------------|
| N1 | Inscription - Email invalide | Entrer email invalide | Message d'erreur affiché |
| N2 | Inscription - Mot de passe faible | Entrer mot de passe < 8 caractères | Message d'erreur affiché |
| N3 | Inscription - Mots de passe différents | Entrer 2 mots de passe différents | Message d'erreur affiché |
| N4 | Inscription - Email déjà utilisé | Utiliser un email existant | Message d'erreur affiché |
| N5 | Inscription complète réussie | Remplir formulaire correctement | Compte créé + redirection dashboard |
| N6 | Vérification email de bienvenue | Après inscription | Email reçu (si configuré) |

### 🟡 PHASE 3: Tests Utilisateur Connecté (Connexion)

| ID | Scénario | Actions | Résultat Attendu |
|:---|:---------|:--------|:-----------------|
| C1 | Connexion - Email invalide | Entrer email inexistant | Message d'erreur affiché |
| C2 | Connexion - Mot de passe incorrect | Entrer mauvais mot de passe | Message d'erreur affiché |
| C3 | Connexion réussie | Entrer credentials valides | Redirection vers dashboard |
| C4 | Affichage dashboard | Après connexion | Dashboard affiché avec données utilisateur |
| C5 | Déconnexion | Cliquer sur "Déconnexion" | Redirection vers page d'accueil |
| C6 | Accès profil utilisateur | Cliquer sur "Mon profil" | Page profil affichée |
| C7 | Modification profil | Modifier nom/email | Modifications sauvegardées |

### 🔴 PHASE 4: Tests Assessments

| ID | Scénario | Actions | Résultat Attendu |
|:---|:---------|:--------|:-----------------|
| A1 | Création assessment - Champs vides | Soumettre formulaire vide | Messages d'erreur affichés |
| A2 | Création assessment réussie | Remplir formulaire correctement | Assessment créé + redirection |
| A3 | Liste des assessments | Voir tous les assessments | Liste affichée correctement |
| A4 | Détails d'un assessment | Cliquer sur un assessment | Page détails affichée |
| A5 | Modification d'un assessment | Modifier les informations | Modifications sauvegardées |
| A6 | Suppression d'un assessment | Supprimer un assessment | Assessment supprimé + confirmation |

### 🟣 PHASE 5: Tests Psychométriques (MBTI & RIASEC)

| ID | Scénario | Actions | Résultat Attendu |
|:---|:---------|:--------|:-----------------|
| P1 | Accès test MBTI | Cliquer sur "Passer le test MBTI" | Page test MBTI affichée |
| P2 | Affichage questions MBTI | Charger le test | 60 questions affichées |
| P3 | Réponse aux questions MBTI | Répondre à toutes les questions | Progression affichée |
| P4 | Soumission test MBTI | Soumettre les réponses | Résultats calculés et affichés |
| P5 | Affichage résultats MBTI | Voir les résultats | Type MBTI affiché (ex: ENFP) |
| P6 | Accès test RIASEC | Cliquer sur "Passer le test RIASEC" | Page test RIASEC affichée |
| P7 | Affichage questions RIASEC | Charger le test | 48 questions affichées |
| P8 | Réponse aux questions RIASEC | Répondre à toutes les questions | Progression affichée |
| P9 | Soumission test RIASEC | Soumettre les réponses | Résultats calculés et affichés |
| P10 | Affichage résultats RIASEC | Voir les résultats | Top 3 codes RIASEC affichés |
| P11 | Export résultats PDF | Cliquer sur "Exporter PDF" | PDF généré et téléchargé |

### 🟠 PHASE 6: Tests Fonctionnalités Avancées

| ID | Scénario | Actions | Résultat Attendu |
|:---|:---------|:--------|:-----------------|
| F1 | Upload CV | Télécharger un fichier CV | CV uploadé et analysé |
| F2 | Analyse CV par IA | Après upload | Compétences extraites |
| F3 | Recommandations d'emploi | Consulter recommandations | Liste d'emplois affichée |
| F4 | Plan d'action | Créer un plan d'action | Plan créé et sauvegardé |
| F5 | Génération rapport complet | Cliquer sur "Générer rapport" | Rapport PDF généré |

---

## 3. CRITÈRES DE SUCCÈS

✅ **Tous les tests doivent passer sans erreur**
✅ **Aucune erreur 404, 500 ou autre dans la console**
✅ **Tous les formulaires doivent valider correctement**
✅ **Toutes les redirections doivent fonctionner**
✅ **Les données doivent être sauvegardées correctement**
✅ **L'interface doit être responsive (mobile, tablet, desktop)**

---

## 4. BUGS À TRACKER

| ID | Description | Sévérité | Statut |
|:---|:------------|:---------|:-------|
| - | - | - | - |

*Ce tableau sera rempli pendant les tests*

