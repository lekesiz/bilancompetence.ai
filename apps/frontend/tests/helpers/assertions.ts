/**
 * Test Helpers - Assertions
 * 
 * Helper functions pour les assertions communes dans les tests E2E
 */

import { Page, expect } from '@playwright/test';

/**
 * Vérifie qu'un élément est visible et contient le texte attendu
 */
export async function expectTextVisible(
  page: Page,
  selector: string,
  text: string
): Promise<void> {
  const element = page.locator(selector);
  await expect(element).toBeVisible();
  await expect(element).toContainText(text);
}

/**
 * Vérifie qu'un toast/notification est affiché
 */
export async function expectToastVisible(
  page: Page,
  message: string,
  type: 'success' | 'error' | 'info' | 'warning' = 'success'
): Promise<void> {
  const toast = page.locator(`[data-testid="toast-${type}"]`);
  await expect(toast).toBeVisible({ timeout: 5000 });
  await expect(toast).toContainText(message);
}

/**
 * Vérifie qu'un formulaire a une erreur de validation
 */
export async function expectFormError(
  page: Page,
  fieldName: string,
  errorMessage: string
): Promise<void> {
  const errorElement = page.locator(`[data-testid="error-${fieldName}"]`);
  await expect(errorElement).toBeVisible();
  await expect(errorElement).toContainText(errorMessage);
}

/**
 * Vérifie qu'un élément est dans un état de chargement
 */
export async function expectLoading(
  page: Page,
  selector: string = '[data-testid="loading"]'
): Promise<void> {
  const loadingElement = page.locator(selector);
  await expect(loadingElement).toBeVisible({ timeout: 2000 });
}

/**
 * Vérifie qu'un élément n'est plus en chargement
 */
export async function expectNotLoading(
  page: Page,
  selector: string = '[data-testid="loading"]'
): Promise<void> {
  const loadingElement = page.locator(selector);
  await expect(loadingElement).not.toBeVisible({ timeout: 10000 });
}

/**
 * Vérifie qu'une table contient un certain nombre de lignes
 */
export async function expectTableRowCount(
  page: Page,
  tableSelector: string,
  expectedCount: number
): Promise<void> {
  const rows = page.locator(`${tableSelector} tbody tr`);
  await expect(rows).toHaveCount(expectedCount);
}

/**
 * Vérifie qu'un modal est ouvert
 */
export async function expectModalOpen(
  page: Page,
  modalSelector: string = '[data-testid="modal"]'
): Promise<void> {
  const modal = page.locator(modalSelector);
  await expect(modal).toBeVisible({ timeout: 5000 });
}

/**
 * Vérifie qu'un modal est fermé
 */
export async function expectModalClosed(
  page: Page,
  modalSelector: string = '[data-testid="modal"]'
): Promise<void> {
  const modal = page.locator(modalSelector);
  await expect(modal).not.toBeVisible({ timeout: 5000 });
}

/**
 * Vérifie qu'un élément a une classe CSS spécifique
 */
export async function expectHasClass(
  page: Page,
  selector: string,
  className: string
): Promise<void> {
  const element = page.locator(selector);
  await expect(element).toHaveClass(new RegExp(className));
}

/**
 * Vérifie qu'un élément est disabled
 */
export async function expectDisabled(
  page: Page,
  selector: string
): Promise<void> {
  const element = page.locator(selector);
  await expect(element).toBeDisabled();
}

/**
 * Vérifie qu'un élément est enabled
 */
export async function expectEnabled(
  page: Page,
  selector: string
): Promise<void> {
  const element = page.locator(selector);
  await expect(element).toBeEnabled();
}

/**
 * Vérifie qu'une URL contient un certain pattern
 */
export async function expectURLContains(
  page: Page,
  pattern: string | RegExp
): Promise<void> {
  await expect(page).toHaveURL(pattern);
}

/**
 * Vérifie qu'un élément a un attribut spécifique
 */
export async function expectAttribute(
  page: Page,
  selector: string,
  attribute: string,
  value: string
): Promise<void> {
  const element = page.locator(selector);
  await expect(element).toHaveAttribute(attribute, value);
}

/**
 * Vérifie qu'un input a une valeur spécifique
 */
export async function expectInputValue(
  page: Page,
  selector: string,
  value: string
): Promise<void> {
  const input = page.locator(selector);
  await expect(input).toHaveValue(value);
}

/**
 * Vérifie qu'un élément est checked (checkbox/radio)
 */
export async function expectChecked(
  page: Page,
  selector: string
): Promise<void> {
  const element = page.locator(selector);
  await expect(element).toBeChecked();
}

/**
 * Vérifie qu'un élément n'est pas checked
 */
export async function expectNotChecked(
  page: Page,
  selector: string
): Promise<void> {
  const element = page.locator(selector);
  await expect(element).not.toBeChecked();
}
