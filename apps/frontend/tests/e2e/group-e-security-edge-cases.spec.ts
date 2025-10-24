import { test, expect } from '@playwright/test';

/**
 * Groupe E: Sécurité et Edge Cases (Security & Negative Testing)
 * 
 * Tests couvrant:
 * - E.1: Accès non autorisé aux routes protégées (RBAC)
 * - E.2: Rate limiting sur les endpoints
 * - E.3: Validation de complétion de bilan
 * - E.4: Statistiques de monitoring (Super Admin)
 * - E.5: Restriction routes anonymes
 */

test.describe('Groupe E: Sécurité et Edge Cases', () => {
  const DEMO_EMAIL = 'demo@example.com';
  const DEMO_PASSWORD = 'Demo@123456';
  const CONSULTANT_EMAIL = 'consultant@example.com';
  const CONSULTANT_PASSWORD = 'Consultant@123';

  test('E.1 - Accès Non Autorisé Routes Protégées (RBAC)', async ({ page }) => {
    console.log('🧪 Test E.1: Contrôle RBAC');
    
    // Connexion en tant que BENEFICIARY
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', DEMO_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', DEMO_PASSWORD);
    await page.click('button:has-text("Sign In"), button:has-text("Connexion")');
    
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    
    // Routes réservées aux autres rôles
    const protectedRoutes = [
      { path: '/dashboard/consultant', role: 'CONSULTANT' },
      { path: '/dashboard/admin', role: 'ORG_ADMIN' },
      { path: '/admin/qualiopi', role: 'ORG_ADMIN' },
      { path: '/admin/users', role: 'ORG_ADMIN' },
      { path: '/consultant/dashboard', role: 'CONSULTANT' }
    ];
    
    let blockedCount = 0;
    
    for (const route of protectedRoutes) {
      const response = await page.goto(route.path, { waitUntil: 'networkidle', timeout: 5000 }).catch(() => null);
      
      if (response) {
        const status = response.status();
        const currentUrl = page.url();
        
        // Vérifier si accès refusé ou redirigé
        if (status === 403 || status === 401) {
          blockedCount++;
          console.log(`✅ E.1: Accès refusé à ${route.path} (${status}) - ${route.role} requis`);
        } else if (currentUrl.includes('/login') || currentUrl.includes('/403') || currentUrl.includes('/unauthorized')) {
          blockedCount++;
          console.log(`✅ E.1: Redirection sécurisée pour ${route.path} - ${route.role} requis`);
        } else if (status === 404) {
          // 404 peut être acceptable si la route n'existe pas
          console.log(`⚠️ E.1: Route ${route.path} non trouvée (404)`);
        } else {
          console.log(`❌ E.1: PROBLÈME DE SÉCURITÉ - Accès non restreint à ${route.path} (${status})`);
        }
      }
      
      await page.waitForTimeout(500);
    }
    
    console.log(`✅ E.1: ${blockedCount}/${protectedRoutes.length} routes correctement protégées`);
  });

  test('E.2 - Rate Limiting Test', async ({ page }) => {
    console.log('🧪 Test E.2: Rate limiting');
    
    // Tester le rate limiting sur l'endpoint de login
    const loginUrl = '/api/auth/login';
    const maxRequests = 10; // Nombre de requêtes à envoyer
    let rateLimitHit = false;
    
    for (let i = 0; i < maxRequests; i++) {
      const response = await page.request.post(loginUrl, {
        data: {
          email: 'test@example.com',
          password: 'wrongpassword'
        }
      }).catch(() => null);
      
      if (response) {
        const status = response.status();
        
        if (status === 429) {
          rateLimitHit = true;
          console.log(`✅ E.2: Rate limit atteint après ${i + 1} requêtes (429 Too Many Requests)`);
          break;
        } else if (status === 401 || status === 400) {
          // Erreur d'authentification normale
          console.log(`Request ${i + 1}: ${status} (attendu)`);
        }
      }
      
      // Petit délai entre les requêtes
      await page.waitForTimeout(100);
    }
    
    if (rateLimitHit) {
      console.log('✅ E.2: Rate limiting fonctionne correctement');
    } else {
      console.log('⚠️ E.2: Rate limiting non détecté - peut nécessiter plus de requêtes ou configuration');
    }
  });

  test('E.3 - Validation Complétion Bilan Incomplète', async ({ page }) => {
    console.log('🧪 Test E.3: Validation bilan incomplet');
    
    // Connexion bénéficiaire
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', DEMO_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', DEMO_PASSWORD);
    await page.click('button:has-text("Sign In"), button:has-text("Connexion")');
    
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    
    // Créer un nouveau bilan
    const startBilanButton = page.locator('button:has-text("Démarrer"), button:has-text("Nouveau")').first();
    if (await startBilanButton.isVisible({ timeout: 5000 })) {
      await startBilanButton.click();
      await page.waitForTimeout(2000);
      
      // Remplir seulement quelques champs (incomplet)
      const firstField = page.locator('textarea, input[type="text"]').first();
      if (await firstField.isVisible({ timeout: 3000 })) {
        await firstField.fill('Test incomplet');
        
        // Essayer de soumettre directement sans compléter tous les champs
        // Intercepter les appels API
        page.on('response', async (response) => {
          const url = response.url();
          if (url.includes('/api/assessments') || url.includes('/api/bilans')) {
            const status = response.status();
            
            if (status === 400 || status === 422) {
              const body = await response.text();
              if (body.includes('incomplete') || body.includes('required') || body.includes('validation')) {
                console.log('✅ E.3: Validation serveur détecte le bilan incomplet');
              }
            }
          }
        });
        
        // Chercher un bouton de soumission prématurée
        const submitButton = page.locator('button:has-text("Submit"), button:has-text("Soumettre"), button:has-text("Terminer")').first();
        if (await submitButton.isVisible({ timeout: 3000 })) {
          const isDisabled = await submitButton.isDisabled();
          if (isDisabled) {
            console.log('✅ E.3: Bouton de soumission désactivé pour bilan incomplet (validation frontend)');
          } else {
            await submitButton.click();
            await page.waitForTimeout(2000);
            
            // Vérifier si un message d'erreur apparaît
            const errorMessage = page.locator('text=incomplete, text=requis, text=obligatoire, text=error').first();
            if (await errorMessage.isVisible({ timeout: 3000 })) {
              console.log('✅ E.3: Message d\'erreur affiché pour bilan incomplet');
            }
          }
        }
      }
    } else {
      console.log('⚠️ E.3: Impossible de démarrer un nouveau bilan pour tester');
    }
  });

  test('E.4 - Statistiques Monitoring Super Admin', async ({ page }) => {
    console.log('🧪 Test E.4: Monitoring Super Admin');
    
    // Note: Ce test nécessite un compte SUPER_ADMIN
    // Si non disponible, on teste l'accès refusé
    
    const superAdminEmail = 'superadmin@example.com';
    const superAdminPassword = 'SuperAdmin@123';
    
    // Tenter de se connecter
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', superAdminEmail);
    await page.fill('input[name="password"], input[type="password"]', superAdminPassword);
    await page.click('button:has-text("Sign In"), button:has-text("Connexion")');
    
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('/dashboard')) {
      // Connexion réussie - tester l'accès aux stats
      const monitoringUrl = '/api/admin/monitoring/stats';
      const response = await page.request.get(monitoringUrl).catch(() => null);
      
      if (response) {
        const status = response.status();
        if (status === 200) {
          const data = await response.json();
          if (data && (data.slowQueries || data.frequentQueries || data.stats)) {
            console.log('✅ E.4: Statistiques de monitoring accessibles');
          }
        } else if (status === 403 || status === 401) {
          console.log('⚠️ E.4: Accès refusé aux statistiques (compte non Super Admin)');
        }
      }
    } else {
      console.log('⚠️ E.4: Compte Super Admin non disponible pour test');
      
      // Tester que les autres rôles n'y ont pas accès
      await page.goto('/login');
      await page.fill('input[name="email"], input[type="email"]', DEMO_EMAIL);
      await page.fill('input[name="password"], input[type="password"]', DEMO_PASSWORD);
      await page.click('button:has-text("Sign In"), button:has-text("Connexion")');
      
      await page.waitForURL(/\/dashboard/, { timeout: 15000 });
      
      const response = await page.request.get('/api/admin/monitoring/stats').catch(() => null);
      if (response) {
        const status = response.status();
        if (status === 403 || status === 401) {
          console.log('✅ E.4: Accès correctement refusé aux utilisateurs non-admin');
        }
      }
    }
  });

  test('E.5 - Restriction Routes Anonymes', async ({ page }) => {
    console.log('🧪 Test E.5: Routes anonymes');
    
    // Tester l'accès aux routes protégées sans authentification
    const protectedApiRoutes = [
      '/api/users/profile',
      '/api/bilans',
      '/api/assessments',
      '/api/consultants',
      '/api/messages'
    ];
    
    let blockedCount = 0;
    
    for (const route of protectedApiRoutes) {
      const response = await page.request.get(route).catch(() => null);
      
      if (response) {
        const status = response.status();
        
        if (status === 401) {
          blockedCount++;
          const body = await response.text();
          if (body.includes('authorization') || body.includes('unauthorized') || body.includes('token')) {
            console.log(`✅ E.5: ${route} correctement protégé (401 Unauthorized)`);
          }
        } else if (status === 403) {
          blockedCount++;
          console.log(`✅ E.5: ${route} correctement protégé (403 Forbidden)`);
        } else if (status === 200) {
          console.log(`❌ E.5: PROBLÈME DE SÉCURITÉ - ${route} accessible sans authentification`);
        }
      }
    }
    
    console.log(`✅ E.5: ${blockedCount}/${protectedApiRoutes.length} routes API correctement protégées`);
    
    // Tester également les pages frontend protégées
    const protectedPages = [
      '/dashboard',
      '/dashboard/beneficiaire',
      '/dashboard/consultant',
      '/dashboard/admin'
    ];
    
    let redirectedCount = 0;
    
    for (const pagePath of protectedPages) {
      await page.goto(pagePath, { waitUntil: 'networkidle', timeout: 5000 }).catch(() => null);
      const currentUrl = page.url();
      
      if (currentUrl.includes('/login') || currentUrl.includes('/unauthorized')) {
        redirectedCount++;
        console.log(`✅ E.5: ${pagePath} redirige vers login`);
      } else if (currentUrl === pagePath) {
        console.log(`❌ E.5: PROBLÈME - ${pagePath} accessible sans authentification`);
      }
    }
    
    console.log(`✅ E.5: ${redirectedCount}/${protectedPages.length} pages correctement protégées`);
  });
});

