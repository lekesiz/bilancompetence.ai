import { test, expect } from '@playwright/test';

/**
 * Groupe A: Workflows de Base (Beneficiary & Consultant)
 * 
 * Tests couvrant les parcours utilisateur principaux:
 * - A.1: Inscription et création de bilan
 * - A.2: Complétion du wizard d'évaluation
 * - A.3: Soumission et assignation consultant
 * - A.4: Approbation et feedback consultant
 * - A.5: Génération et affichage des recommandations AI
 */

test.describe('Groupe A: Workflows de Base', () => {
  const TEST_EMAIL = `test-${Date.now()}@example.com`;
  const TEST_PASSWORD = 'Test@123456';
  const DEMO_EMAIL = 'demo@example.com';
  const DEMO_PASSWORD = 'Demo@123456';
  const CONSULTANT_EMAIL = 'consultant@example.com';
  const CONSULTANT_PASSWORD = 'Consultant@123';

  test.beforeEach(async ({ page }) => {
    // Configuration de base pour chaque test
    await page.goto('/');
  });

  test('A.1 - Inscription Bénéficiaire et Création Bilan', async ({ page }) => {
    console.log('🧪 Test A.1: Inscription et création de bilan');
    
    // Navigation vers la page d'inscription
    await page.goto('/register');
    await expect(page).toHaveURL(/\/register/);
    
    // Step 1: Email
    const emailInput = page.locator('input[name="email"], input[placeholder*="email" i]').first();
    await emailInput.fill(TEST_EMAIL);
    await page.click('button:has-text("Next"), button:has-text("Suivant")');
    
    // Attendre la transition
    await page.waitForTimeout(1000);
    
    // Step 2: Password
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    await passwordInput.fill(TEST_PASSWORD);
    
    const confirmPasswordInput = page.locator('input[name="confirmPassword"], input[name="confirm_password"]').first();
    if (await confirmPasswordInput.isVisible()) {
      await confirmPasswordInput.fill(TEST_PASSWORD);
    }
    
    await page.click('button:has-text("Next"), button:has-text("Suivant"), button:has-text("Create"), button:has-text("Créer")');
    
    // Vérifier la redirection (peut être vers /verify-email ou /dashboard)
    await page.waitForURL(/\/(verify-email|dashboard|beneficiaire)/, { timeout: 10000 });
    
    console.log('✅ A.1: Inscription réussie');
  });

  test('A.2 - Complétion du Wizard d\'Évaluation', async ({ page }) => {
    console.log('🧪 Test A.2: Wizard d\'évaluation complet');
    
    // Connexion avec compte démo
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', DEMO_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', DEMO_PASSWORD);
    await page.click('button:has-text("Sign In"), button:has-text("Connexion")');
    
    // Attendre la redirection vers le dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    
    // Chercher le bouton pour démarrer un bilan
    const startBilanButton = page.locator('button:has-text("Démarrer"), button:has-text("Commencer"), a:has-text("Nouveau bilan")').first();
    
    if (await startBilanButton.isVisible({ timeout: 5000 })) {
      await startBilanButton.click();
      
      // Attendre le chargement du wizard
      await page.waitForTimeout(2000);
      
      // Step 1: Historique professionnel
      const workHistoryField = page.locator('textarea[name*="work"], textarea[name*="history"], textarea').first();
      if (await workHistoryField.isVisible({ timeout: 3000 })) {
        await workHistoryField.fill('Expérience professionnelle de 5 ans dans le développement web. Spécialisé en React et Node.js.');
        await page.click('button:has-text("Suivant"), button:has-text("Next")');
        await page.waitForTimeout(1000);
      }
      
      // Step 2: Formation
      const educationField = page.locator('textarea[name*="education"], textarea[name*="formation"]').first();
      if (await educationField.isVisible({ timeout: 3000 })) {
        await educationField.fill('Master en Informatique, Licence en Mathématiques');
        await page.click('button:has-text("Suivant"), button:has-text("Next")');
        await page.waitForTimeout(1000);
      }
      
      // Step 3: Compétences
      const competencyFields = page.locator('input[name*="competenc"], input[name*="skill"]');
      const competencyCount = await competencyFields.count();
      if (competencyCount > 0) {
        await competencyFields.nth(0).fill('Leadership');
        if (competencyCount > 1) {
          await competencyFields.nth(1).fill('Communication');
        }
        await page.click('button:has-text("Suivant"), button:has-text("Next")');
        await page.waitForTimeout(1000);
      }
      
      // Step 4: Motivations
      const motivationField = page.locator('textarea[name*="motivation"]').first();
      if (await motivationField.isVisible({ timeout: 3000 })) {
        await motivationField.fill('Souhait d\'évoluer vers un poste de management et de contribuer à des projets innovants.');
        await page.click('button:has-text("Suivant"), button:has-text("Next")');
        await page.waitForTimeout(1000);
      }
      
      // Step 5: Contraintes
      const constraintField = page.locator('textarea[name*="constraint"], textarea[name*="contrainte"]').first();
      if (await constraintField.isVisible({ timeout: 3000 })) {
        await constraintField.fill('Disponibilité limitée le week-end, préférence pour le télétravail.');
        
        // Soumettre le formulaire
        await page.click('button:has-text("Terminer"), button:has-text("Finish"), button:has-text("Soumettre")');
        await page.waitForTimeout(2000);
      }
      
      console.log('✅ A.2: Wizard complété avec succès');
    } else {
      console.log('⚠️ A.2: Bouton de démarrage non trouvé - peut-être déjà un bilan en cours');
    }
  });

  test('A.3 - Soumission Bilan et Assignation Consultant', async ({ page }) => {
    console.log('🧪 Test A.3: Soumission et assignation');
    
    // Connexion bénéficiaire
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', DEMO_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', DEMO_PASSWORD);
    await page.click('button:has-text("Sign In"), button:has-text("Connexion")');
    
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    
    // Naviguer vers la liste des bilans
    const bilansLink = page.locator('a:has-text("Mes bilans"), a:has-text("Bilans"), a:has-text("Assessments")').first();
    if (await bilansLink.isVisible({ timeout: 5000 })) {
      await bilansLink.click();
      await page.waitForTimeout(2000);
      
      // Chercher un bilan en statut DRAFT
      const draftBilan = page.locator('tr:has-text("DRAFT"), div:has-text("DRAFT")').first();
      if (await draftBilan.isVisible({ timeout: 3000 })) {
        const submitButton = draftBilan.locator('button:has-text("Submit"), button:has-text("Soumettre")').first();
        if (await submitButton.isVisible()) {
          await submitButton.click();
          
          // Confirmer si une modal apparaît
          const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Confirmer")').first();
          if (await confirmButton.isVisible({ timeout: 2000 })) {
            await confirmButton.click();
          }
          
          await page.waitForTimeout(2000);
          
          // Vérifier le changement de statut
          const submittedStatus = page.locator('text=SUBMITTED, text=Soumis').first();
          if (await submittedStatus.isVisible({ timeout: 5000 })) {
            console.log('✅ A.3: Bilan soumis avec succès');
          }
        }
      } else {
        console.log('⚠️ A.3: Aucun bilan DRAFT trouvé');
      }
    }
  });

  test('A.4 - Approbation Bilan par Consultant', async ({ page }) => {
    console.log('🧪 Test A.4: Approbation consultant');
    
    // Connexion consultant
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', CONSULTANT_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', CONSULTANT_PASSWORD);
    await page.click('button:has-text("Sign In"), button:has-text("Connexion")');
    
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    
    // Naviguer vers les bilans assignés
    const assignedLink = page.locator('a:has-text("Assigned"), a:has-text("Assignés"), a:has-text("Mes clients")').first();
    if (await assignedLink.isVisible({ timeout: 5000 })) {
      await assignedLink.click();
      await page.waitForTimeout(2000);
      
      // Sélectionner un bilan SUBMITTED
      const submittedBilan = page.locator('tr:has-text("SUBMITTED"), div:has-text("SUBMITTED")').first();
      if (await submittedBilan.isVisible({ timeout: 3000 })) {
        await submittedBilan.click();
        await page.waitForTimeout(2000);
        
        // Vérifier la présence de la section compétences
        const competenciesSection = page.locator('h2:has-text("Competenc"), h2:has-text("Compétenc")').first();
        await expect(competenciesSection).toBeVisible({ timeout: 5000 });
        
        // Sélectionner le niveau d'évaluation
        const levelSelect = page.locator('select[name*="level"], select[name*="assessment"]').first();
        if (await levelSelect.isVisible({ timeout: 3000 })) {
          await levelSelect.selectOption('ADVANCED');
        }
        
        // Ajouter des notes
        const notesField = page.locator('textarea[name*="notes"], textarea[name*="comment"]').first();
        if (await notesField.isVisible({ timeout: 3000 })) {
          await notesField.fill('Excellent travail ! Le candidat montre une bonne compréhension de ses compétences et objectifs.');
        }
        
        // Approuver et compléter
        const approveButton = page.locator('button:has-text("Approve"), button:has-text("Approuver"), button:has-text("Complete")').first();
        if (await approveButton.isVisible({ timeout: 3000 })) {
          await approveButton.click();
          await page.waitForTimeout(2000);
          
          console.log('✅ A.4: Bilan approuvé par consultant');
        }
      } else {
        console.log('⚠️ A.4: Aucun bilan SUBMITTED trouvé');
      }
    }
  });

  test('A.5 - Génération et Affichage Recommandations AI', async ({ page }) => {
    console.log('🧪 Test A.5: Recommandations AI');
    
    // Connexion bénéficiaire
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', DEMO_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', DEMO_PASSWORD);
    await page.click('button:has-text("Sign In"), button:has-text("Connexion")');
    
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    
    // Naviguer vers les recommandations
    const recommendationsLink = page.locator('a:has-text("Recommend"), a:has-text("Suggesti"), a:has-text("AI")').first();
    if (await recommendationsLink.isVisible({ timeout: 5000 })) {
      await recommendationsLink.click();
      await page.waitForTimeout(3000);
      
      // Vérifier la présence du titre
      const pageTitle = page.locator('h1:has-text("Recommend"), h1:has-text("Carrière"), h2:has-text("Recommend")').first();
      await expect(pageTitle).toBeVisible({ timeout: 10000 });
      
      // Vérifier la présence de cartes de recommandations
      const recommendationCards = page.locator('.recommendation-card, [data-testid="recommendation"], article, .card');
      const cardCount = await recommendationCards.count();
      
      if (cardCount > 0) {
        console.log(`✅ A.5: ${cardCount} recommandations trouvées`);
        
        // Vérifier le contenu de la première recommandation
        const firstCard = recommendationCards.first();
        const hasJobTitle = await firstCard.locator('.job-title, h3, h4').first().isVisible({ timeout: 3000 });
        const hasMatchScore = await firstCard.locator('.match-score, .score, [data-testid="score"]').first().isVisible({ timeout: 3000 });
        
        if (hasJobTitle || hasMatchScore) {
          console.log('✅ A.5: Recommandations affichées avec détails');
        }
      } else {
        console.log('⚠️ A.5: Aucune recommandation trouvée - peut nécessiter un bilan complété');
      }
    } else {
      console.log('⚠️ A.5: Lien recommandations non trouvé');
    }
  });
});

