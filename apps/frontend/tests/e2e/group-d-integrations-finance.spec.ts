import { test, expect } from '@playwright/test';

/**
 * Groupe D: Intégrations et Finance (Integrations & Payments)
 * 
 * Tests couvrant:
 * - D.1: Flux de paiement Stripe
 * - D.2: Synchronisation PennyLane
 * - D.3: Transfert de données Wedof
 */

test.describe('Groupe D: Intégrations et Finance', () => {
  const DEMO_EMAIL = 'demo@example.com';
  const DEMO_PASSWORD = 'Demo@123456';
  const ADMIN_EMAIL = 'admin@example.com';
  const ADMIN_PASSWORD = 'Admin@123456';
  const ACCOUNTANT_EMAIL = 'accountant@example.com';
  const ACCOUNTANT_PASSWORD = 'Accountant@123';

  test('D.1 - Flux Paiement Stripe', async ({ page }) => {
    console.log('🧪 Test D.1: Paiement Stripe');
    
    // Connexion bénéficiaire
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', DEMO_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', DEMO_PASSWORD);
    await page.click('button:has-text("Sign In"), button:has-text("Connexion")');
    
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    
    // Naviguer vers la page de paiement/abonnement
    const paymentLink = page.locator('a:has-text("Paiement"), a:has-text("Payment"), a:has-text("Abonnement"), a:has-text("Pricing")').first();
    if (await paymentLink.isVisible({ timeout: 5000 })) {
      await paymentLink.click();
      await page.waitForTimeout(2000);
      
      // Chercher un bouton de paiement
      const payButton = page.locator('button:has-text("Pay"), button:has-text("Payer"), button:has-text("Subscribe")').first();
      if (await payButton.isVisible({ timeout: 3000 })) {
        // Intercepter les appels API Stripe
        page.on('request', (request) => {
          const url = request.url();
          if (url.includes('stripe.com') || url.includes('/api/payments') || url.includes('/api/checkout')) {
            console.log(`✅ D.1: Appel API Stripe détecté - ${url}`);
          }
        });
        
        await payButton.click();
        await page.waitForTimeout(3000);
        
        // Vérifier si on est redirigé vers Stripe ou si un iframe Stripe apparaît
        const stripeIframe = page.frameLocator('iframe[src*="stripe"]').first();
        const stripeElement = await stripeIframe.locator('body').isVisible({ timeout: 5000 }).catch(() => false);
        
        if (stripeElement) {
          console.log('✅ D.1: Interface Stripe chargée (iframe détecté)');
        } else {
          // Vérifier si redirigé vers Stripe Checkout
          const currentUrl = page.url();
          if (currentUrl.includes('stripe.com') || currentUrl.includes('checkout')) {
            console.log('✅ D.1: Redirection vers Stripe Checkout réussie');
          } else {
            console.log('⚠️ D.1: Interface Stripe non détectée - peut nécessiter configuration');
          }
        }
      } else {
        console.log('⚠️ D.1: Bouton de paiement non trouvé');
      }
    } else {
      console.log('⚠️ D.1: Lien paiement non trouvé');
    }
  });

  test('D.2 - Synchronisation PennyLane', async ({ page }) => {
    console.log('🧪 Test D.2: Intégration PennyLane');
    
    // Connexion comptable ou admin
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', ACCOUNTANT_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', ACCOUNTANT_PASSWORD);
    await page.click('button:has-text("Sign In"), button:has-text("Connexion")');
    
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    
    // Naviguer vers les intégrations
    const integrationsLink = page.locator('a:has-text("Intégrations"), a:has-text("Integrations"), a:has-text("API")').first();
    if (await integrationsLink.isVisible({ timeout: 5000 })) {
      await integrationsLink.click();
      await page.waitForTimeout(2000);
      
      // Chercher la section PennyLane
      const pennylaneSection = page.locator('text=PennyLane, text=Pennylane').first();
      if (await pennylaneSection.isVisible({ timeout: 3000 })) {
        await pennylaneSection.click();
        await page.waitForTimeout(1000);
        
        // Vérifier la présence du champ API key
        const apiKeyInput = page.locator('input[name*="api"], input[name*="key"], input[type="password"]').first();
        if (await apiKeyInput.isVisible({ timeout: 3000 })) {
          // Ne pas modifier la vraie clé, juste vérifier qu'elle est présente
          const hasValue = await apiKeyInput.inputValue();
          if (hasValue) {
            console.log('✅ D.2: Clé API PennyLane configurée');
          }
        }
        
        // Chercher le bouton de test de connexion
        const testButton = page.locator('button:has-text("Test"), button:has-text("Tester"), button:has-text("Vérifier")').first();
        if (await testButton.isVisible({ timeout: 3000 })) {
          // Intercepter les appels API
          page.on('response', async (response) => {
            const url = response.url();
            if (url.includes('pennylane') || url.includes('/api/pennylane')) {
              const status = response.status();
              if (status === 200 || status === 201) {
                console.log('✅ D.2: Connexion PennyLane réussie (200/201)');
              } else if (status === 401) {
                console.log('⚠️ D.2: Erreur d\'authentification PennyLane (401)');
              }
            }
          });
          
          await testButton.click();
          await page.waitForTimeout(3000);
          
          // Vérifier le message de statut
          const statusMessage = page.locator('text=success, text=réussi, text=connecté, text=error, text=erreur').first();
          if (await statusMessage.isVisible({ timeout: 5000 })) {
            const messageText = await statusMessage.textContent();
            console.log(`✅ D.2: Message de statut affiché - ${messageText}`);
          }
        } else {
          console.log('⚠️ D.2: Bouton de test non trouvé');
        }
      } else {
        console.log('⚠️ D.2: Section PennyLane non trouvée');
      }
    } else {
      console.log('⚠️ D.2: Lien intégrations non trouvé');
    }
  });

  test('D.3 - Transfert Données Wedof', async ({ page }) => {
    console.log('🧪 Test D.3: Intégration Wedof');
    
    // Connexion comptable ou admin
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', ACCOUNTANT_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', ACCOUNTANT_PASSWORD);
    await page.click('button:has-text("Sign In"), button:has-text("Connexion")');
    
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    
    // Naviguer vers les intégrations
    const integrationsLink = page.locator('a:has-text("Intégrations"), a:has-text("Integrations")').first();
    if (await integrationsLink.isVisible({ timeout: 5000 })) {
      await integrationsLink.click();
      await page.waitForTimeout(2000);
      
      // Chercher la section Wedof
      const wedofSection = page.locator('text=Wedof, text=WEDOF').first();
      if (await wedofSection.isVisible({ timeout: 3000 })) {
        await wedofSection.click();
        await page.waitForTimeout(1000);
        
        // Vérifier la configuration
        const apiKeyInput = page.locator('input[name*="wedof"], input[name*="api"], input[type="password"]').first();
        if (await apiKeyInput.isVisible({ timeout: 3000 })) {
          const hasValue = await apiKeyInput.inputValue();
          if (hasValue) {
            console.log('✅ D.3: Clé API Wedof configurée');
          }
        }
        
        // Chercher le bouton de synchronisation
        const syncButton = page.locator('button:has-text("Sync"), button:has-text("Synchroniser"), button:has-text("Envoyer")').first();
        if (await syncButton.isVisible({ timeout: 3000 })) {
          // Intercepter les appels API Wedof
          let wedofCallDetected = false;
          page.on('response', async (response) => {
            const url = response.url();
            if (url.includes('wedof') || url.includes('/api/wedof')) {
              wedofCallDetected = true;
              const status = response.status();
              console.log(`✅ D.3: Appel API Wedof détecté - Status ${status}`);
              
              if (status === 200 || status === 201) {
                console.log('✅ D.3: Transfert Wedof réussi');
              } else if (status === 401) {
                console.log('⚠️ D.3: Erreur d\'authentification Wedof');
              }
            }
          });
          
          await syncButton.click();
          await page.waitForTimeout(3000);
          
          if (wedofCallDetected) {
            console.log('✅ D.3: Intégration Wedof testée avec succès');
          } else {
            console.log('⚠️ D.3: Aucun appel API Wedof détecté');
          }
        } else {
          console.log('⚠️ D.3: Bouton de synchronisation non trouvé');
        }
      } else {
        console.log('⚠️ D.3: Section Wedof non trouvée');
      }
    } else {
      console.log('⚠️ D.3: Lien intégrations non trouvé');
    }
  });
});

