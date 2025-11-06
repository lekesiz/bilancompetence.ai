import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';
import { testUsers } from '../fixtures/users';
import {
  expectTextVisible,
  expectToastVisible,
  expectURLContains,
} from '../helpers/assertions';

/**
 * Groupe A: Workflows de Base (Beneficiary & Consultant)
 * 
 * Ce groupe de tests couvre les flux utilisateurs principaux:
 * - Connexion utilisateur
 * - Navigation dans le dashboard
 * - Visualisation des assessments
 * - Visualisation des sessions
 * - Visualisation des compétences
 */

test.describe('Groupe A: Workflows de Base', () => {
  test.describe('A.1 - Authentification', () => {
    test('Client peut se connecter avec succès', async ({ page }) => {
      // Utiliser le helper de login
      await login(page, 'client');

      // Vérifier que nous sommes sur le dashboard
      await expectURLContains(page, /\/dashboard/);

      // Vérifier que le nom de l'utilisateur est affiché
      await expectTextVisible(
        page,
        '[data-testid="user-name"]',
        testUsers.client.fullName
      );
    });

    test('Consultant peut se connecter avec succès', async ({ page }) => {
      await login(page, 'consultant');

      await expectURLContains(page, /\/dashboard/);

      await expectTextVisible(
        page,
        '[data-testid="user-name"]',
        testUsers.consultant.fullName
      );
    });

    test('Admin peut se connecter avec succès', async ({ page }) => {
      await login(page, 'admin');

      await expectURLContains(page, /\/dashboard/);

      await expectTextVisible(
        page,
        '[data-testid="user-name"]',
        testUsers.admin.fullName
      );
    });

    test('Connexion échoue avec des credentials invalides', async ({
      page,
    }) => {
      await page.goto('/login');

      await page.fill('input[name="email"]', 'invalid@example.com');
      await page.fill('input[name="password"]', 'WrongPassword123');
      await page.click('button[type="submit"]');

      // Vérifier le message d'erreur
      await expect(
        page.locator('text=/Invalid credentials|Email ou mot de passe incorrect/i')
      ).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('A.2 - Dashboard Beneficiary', () => {
    test.beforeEach(async ({ page }) => {
      // Se connecter en tant que client avant chaque test
      await login(page, 'client');
    });

    test('Dashboard affiche les informations du bilan', async ({ page }) => {
      // Vérifier que le dashboard est chargé
      await expect(page.locator('h1, h2')).toContainText(/Dashboard|Tableau de bord/i);

      // Vérifier que les sections principales sont visibles
      const sections = [
        'Bilan en cours',
        'Prochaines sessions',
        'Compétences',
        'Progression',
      ];

      for (const section of sections) {
        // Utiliser une regex plus flexible
        await expect(
          page.locator(`text=/${section}/i`).first()
        ).toBeVisible({ timeout: 10000 });
      }
    });

    test('Client peut voir ses assessments', async ({ page }) => {
      // Aller sur la page des assessments
      await page.goto('/dashboard/assessments');

      // Attendre que la page soit chargée
      await page.waitForLoadState('networkidle');

      // Vérifier que la liste des assessments est visible
      // Note: Nous avons créé 5 assessments dans le seed
      const assessmentCards = page.locator('[data-testid="assessment-card"]');
      
      // Attendre qu'au moins un assessment soit visible
      await expect(assessmentCards.first()).toBeVisible({ timeout: 10000 });
    });

    test('Client peut voir ses sessions programmées', async ({ page }) => {
      // Aller sur la page des sessions
      await page.goto('/dashboard/sessions');

      // Attendre que la page soit chargée
      await page.waitForLoadState('networkidle');

      // Vérifier que la liste des sessions est visible
      // Note: Nous avons créé 5 sessions dans le seed
      const sessionCards = page.locator('[data-testid="session-card"]');
      
      // Attendre qu'au moins une session soit visible
      await expect(sessionCards.first()).toBeVisible({ timeout: 10000 });
    });

    test('Client peut voir ses compétences', async ({ page }) => {
      // Aller sur la page des compétences
      await page.goto('/dashboard/competencies');

      // Attendre que la page soit chargée
      await page.waitForLoadState('networkidle');

      // Vérifier que la liste des compétences est visible
      // Note: Nous avons créé 5 compétences dans le seed
      const competencyCards = page.locator('[data-testid="competency-card"]');
      
      // Attendre qu'au moins une compétence soit visible
      await expect(competencyCards.first()).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('A.3 - Dashboard Consultant', () => {
    test.beforeEach(async ({ page }) => {
      // Se connecter en tant que consultant avant chaque test
      await login(page, 'consultant');
    });

    test('Consultant peut voir le dashboard', async ({ page }) => {
      // Vérifier que le dashboard consultant est chargé
      await expect(page.locator('h1, h2')).toContainText(/Dashboard|Tableau de bord/i);

      // Vérifier les sections spécifiques au consultant
      const sections = [
        'Mes clients',
        'Sessions à venir',
        'Bilans en cours',
      ];

      for (const section of sections) {
        await expect(
          page.locator(`text=/${section}/i`).first()
        ).toBeVisible({ timeout: 10000 });
      }
    });

    test('Consultant peut voir ses clients assignés', async ({ page }) => {
      // Aller sur la page des clients
      await page.goto('/dashboard/clients');

      // Attendre que la page soit chargée
      await page.waitForLoadState('networkidle');

      // Vérifier que la liste des clients est visible
      // Note: Le consultant a 1 client assigné (Sophie Bernard)
      const clientCards = page.locator('[data-testid="client-card"]');
      
      // Attendre qu'au moins un client soit visible
      await expect(clientCards.first()).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('A.4 - Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await login(page, 'client');
    });

    test('Navigation entre les pages fonctionne', async ({ page }) => {
      // Dashboard
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/dashboard/);

      // Assessments
      await page.click('a[href*="/dashboard/assessments"]');
      await expect(page).toHaveURL(/\/dashboard\/assessments/);

      // Sessions
      await page.click('a[href*="/dashboard/sessions"]');
      await expect(page).toHaveURL(/\/dashboard\/sessions/);

      // Compétences
      await page.click('a[href*="/dashboard/competencies"]');
      await expect(page).toHaveURL(/\/dashboard\/competencies/);

      // Retour au dashboard
      await page.click('a[href="/dashboard"]');
      await expect(page).toHaveURL(/\/dashboard$/);
    });

    test('Breadcrumbs fonctionnent correctement', async ({ page }) => {
      // Aller sur une page profonde
      await page.goto('/dashboard/assessments');

      // Vérifier que les breadcrumbs sont visibles
      const breadcrumbs = page.locator('[data-testid="breadcrumbs"]');
      await expect(breadcrumbs).toBeVisible({ timeout: 5000 });

      // Cliquer sur le breadcrumb "Dashboard"
      await breadcrumbs.locator('a:has-text("Dashboard")').click();

      // Vérifier que nous sommes revenus au dashboard
      await expect(page).toHaveURL(/\/dashboard$/);
    });
  });

  test.describe('A.5 - Déconnexion', () => {
    test('Client peut se déconnecter', async ({ page }) => {
      await login(page, 'client');

      // Cliquer sur le menu utilisateur
      await page.click('[data-testid="user-menu"]');

      // Cliquer sur logout
      await page.click('[data-testid="logout-button"]');

      // Vérifier la redirection vers la page d'accueil
      await expect(page).toHaveURL('/', { timeout: 10000 });

      // Vérifier que nous ne sommes plus connectés
      // (le menu utilisateur ne devrait plus être visible)
      await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
    });
  });
});
