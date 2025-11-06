/**
 * Test Helpers - Authentication
 * 
 * Helper functions pour faciliter l'authentification dans les tests E2E
 */

import { Page, expect } from '@playwright/test';
import { testUsers } from '../fixtures/users';

/**
 * Login helper - connecte un utilisateur et vérifie la redirection
 */
export async function login(
  page: Page,
  userType: 'admin' | 'consultant' | 'client'
): Promise<void> {
  const user = testUsers[userType];

  // Aller sur la page de login
  await page.goto('/login');

  // Remplir le formulaire
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);

  // Cliquer sur le bouton de connexion
  await page.click('button[type="submit"]');

  // Attendre la redirection vers le dashboard
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });

  // Vérifier que nous sommes bien connectés
  await expect(page).toHaveURL(/\/dashboard/);
}

/**
 * Logout helper - déconnecte l'utilisateur
 */
export async function logout(page: Page): Promise<void> {
  // Cliquer sur le menu utilisateur
  await page.click('[data-testid="user-menu"]');

  // Cliquer sur logout
  await page.click('[data-testid="logout-button"]');

  // Attendre la redirection vers la page d'accueil
  await page.waitForURL('/', { timeout: 5000 });
}

/**
 * Register helper - crée un nouveau compte utilisateur
 */
export async function register(
  page: Page,
  email: string,
  password: string,
  fullName: string
): Promise<void> {
  // Aller sur la page de registration
  await page.goto('/register');

  // Step 1: Email
  await page.fill('input[name="email"]', email);
  await page.click('button:has-text("Next")');

  // Attendre que le step 2 soit visible
  await page.waitForSelector('input[name="password"]', { timeout: 5000 });

  // Step 2: Password
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirmPassword"]', password);
  await page.click('button:has-text("Next")');

  // Attendre que le step 3 soit visible
  await page.waitForSelector('input[name="fullName"]', { timeout: 5000 });

  // Step 3: Details
  await page.fill('input[name="fullName"]', fullName);
  await page.click('button:has-text("Create Account")');

  // Attendre la redirection vers email verification
  await page.waitForURL(/\/verify-email/, { timeout: 10000 });
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    // Vérifier si le menu utilisateur est visible
    const userMenu = page.locator('[data-testid="user-menu"]');
    return await userMenu.isVisible({ timeout: 2000 });
  } catch {
    return false;
  }
}

/**
 * Wait for authentication state
 */
export async function waitForAuth(page: Page): Promise<void> {
  // Attendre que le token soit présent dans localStorage
  await page.waitForFunction(
    () => {
      const token = localStorage.getItem('auth_token');
      return token !== null && token !== '';
    },
    { timeout: 10000 }
  );
}
