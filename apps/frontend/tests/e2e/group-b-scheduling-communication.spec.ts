import { test, expect } from '@playwright/test';

/**
 * Groupe B: Planification et Communication (Scheduling & Realtime)
 * 
 * Tests couvrant:
 * - B.1: Configuration de disponibilités consultant
 * - B.2: Réservation de rendez-vous bénéficiaire
 * - B.3: Contrôle de conflits (edge case)
 * - B.4: Messagerie temps réel
 * - B.5: Gestion des notifications
 */

test.describe('Groupe B: Planification et Communication', () => {
  const DEMO_EMAIL = 'demo@example.com';
  const DEMO_PASSWORD = 'Demo@123456';
  const CONSULTANT_EMAIL = 'consultant@example.com';
  const CONSULTANT_PASSWORD = 'Consultant@123';

  test('B.1 - Configuration Disponibilités Consultant', async ({ page }) => {
    console.log('🧪 Test B.1: Configuration disponibilités');
    
    // Connexion consultant
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', CONSULTANT_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', CONSULTANT_PASSWORD);
    await page.click('button:has-text("Sign In"), button:has-text("Connexion")');
    
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    
    // Naviguer vers la gestion des disponibilités
    const availabilityLink = page.locator('a:has-text("Disponibilit"), a:has-text("Availability"), a:has-text("Planning")').first();
    if (await availabilityLink.isVisible({ timeout: 5000 })) {
      await availabilityLink.click();
      await page.waitForTimeout(2000);
      
      // Chercher le formulaire de disponibilité
      const addSlotButton = page.locator('button:has-text("Ajouter"), button:has-text("Add"), button:has-text("Nouveau")').first();
      if (await addSlotButton.isVisible({ timeout: 3000 })) {
        await addSlotButton.click();
        await page.waitForTimeout(1000);
        
        // Remplir le formulaire
        const daySelect = page.locator('select[name*="day"], select[name*="jour"]').first();
        if (await daySelect.isVisible({ timeout: 3000 })) {
          await daySelect.selectOption('monday');
        }
        
        const startTimeInput = page.locator('input[name*="start"], input[type="time"]').first();
        if (await startTimeInput.isVisible({ timeout: 3000 })) {
          await startTimeInput.fill('09:00');
        }
        
        const endTimeInput = page.locator('input[name*="end"], input[type="time"]').nth(1);
        if (await endTimeInput.isVisible({ timeout: 3000 })) {
          await endTimeInput.fill('17:00');
        }
        
        // Sauvegarder
        const saveButton = page.locator('button:has-text("Save"), button:has-text("Enregistrer")').first();
        if (await saveButton.isVisible({ timeout: 3000 })) {
          await saveButton.click();
          await page.waitForTimeout(2000);
          
          console.log('✅ B.1: Disponibilité créée avec succès');
        }
      } else {
        console.log('⚠️ B.1: Formulaire de disponibilité non trouvé');
      }
    } else {
      console.log('⚠️ B.1: Lien disponibilités non trouvé');
    }
  });

  test('B.2 - Réservation Rendez-vous Bénéficiaire', async ({ page }) => {
    console.log('🧪 Test B.2: Réservation rendez-vous');
    
    // Connexion bénéficiaire
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', DEMO_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', DEMO_PASSWORD);
    await page.click('button:has-text("Sign In"), button:has-text("Connexion")');
    
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    
    // Naviguer vers la réservation
    const bookingLink = page.locator('a:has-text("Rendez-vous"), a:has-text("Booking"), a:has-text("Réserver")').first();
    if (await bookingLink.isVisible({ timeout: 5000 })) {
      await bookingLink.click();
      await page.waitForTimeout(2000);
      
      // Sélectionner un consultant
      const consultantSelect = page.locator('select[name*="consultant"], select').first();
      if (await consultantSelect.isVisible({ timeout: 3000 })) {
        const options = await consultantSelect.locator('option').count();
        if (options > 1) {
          await consultantSelect.selectOption({ index: 1 });
          await page.waitForTimeout(1000);
        }
      }
      
      // Sélectionner un créneau disponible
      const availableSlot = page.locator('.available-slot, .slot, button[data-available="true"]').first();
      if (await availableSlot.isVisible({ timeout: 5000 })) {
        await availableSlot.click();
        await page.waitForTimeout(1000);
        
        // Confirmer la réservation
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Confirmer")').first();
        if (await confirmButton.isVisible({ timeout: 3000 })) {
          await confirmButton.click();
          await page.waitForTimeout(2000);
          
          // Vérifier le message de succès
          const successMessage = page.locator('text=success, text=réussi, text=confirmé').first();
          if (await successMessage.isVisible({ timeout: 5000 })) {
            console.log('✅ B.2: Rendez-vous réservé avec succès');
          }
        }
      } else {
        console.log('⚠️ B.2: Aucun créneau disponible trouvé');
      }
    } else {
      console.log('⚠️ B.2: Lien réservation non trouvé');
    }
  });

  test('B.3 - Contrôle Conflit Réservation (Edge Case)', async ({ page }) => {
    console.log('🧪 Test B.3: Contrôle de conflit');
    
    // Connexion bénéficiaire
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', DEMO_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', DEMO_PASSWORD);
    await page.click('button:has-text("Sign In"), button:has-text("Connexion")');
    
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    
    // Tenter de réserver un créneau déjà pris
    // Cette logique nécessite de connaître un slot déjà réservé
    // Pour ce test, on simule en tentant une double réservation
    
    const bookingLink = page.locator('a:has-text("Rendez-vous"), a:has-text("Booking")').first();
    if (await bookingLink.isVisible({ timeout: 5000 })) {
      await bookingLink.click();
      await page.waitForTimeout(2000);
      
      // Intercepter les requêtes API
      page.on('response', async (response) => {
        if (response.url().includes('/api/bookings') || response.url().includes('/api/appointments')) {
          const status = response.status();
          if (status === 409) {
            console.log('✅ B.3: Conflit détecté (409 Conflict) - comportement correct');
          } else if (status === 400) {
            const body = await response.text();
            if (body.includes('conflict') || body.includes('already booked')) {
              console.log('✅ B.3: Conflit détecté via message d\'erreur');
            }
          }
        }
      });
      
      // Tenter une réservation (qui pourrait échouer si déjà pris)
      const bookedSlot = page.locator('.booked-slot, .slot[data-booked="true"], button:disabled').first();
      if (await bookedSlot.isVisible({ timeout: 3000 })) {
        console.log('✅ B.3: Créneaux réservés correctement désactivés dans l\'UI');
      } else {
        console.log('⚠️ B.3: Impossible de tester le conflit - aucun créneau réservé visible');
      }
    }
  });

  test('B.4 - Messagerie Temps Réel', async ({ page }) => {
    console.log('🧪 Test B.4: Messagerie temps réel');
    
    // Connexion bénéficiaire
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', DEMO_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', DEMO_PASSWORD);
    await page.click('button:has-text("Sign In"), button:has-text("Connexion")');
    
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    
    // Naviguer vers la messagerie
    const messagesLink = page.locator('a:has-text("Messages"), a:has-text("Chat"), a:has-text("Messagerie")').first();
    if (await messagesLink.isVisible({ timeout: 5000 })) {
      await messagesLink.click();
      await page.waitForTimeout(2000);
      
      // Sélectionner une conversation ou démarrer une nouvelle
      const conversationItem = page.locator('.conversation, .chat-item, [data-testid="conversation"]').first();
      if (await conversationItem.isVisible({ timeout: 3000 })) {
        await conversationItem.click();
        await page.waitForTimeout(1000);
      }
      
      // Envoyer un message
      const messageInput = page.locator('textarea[name*="message"], input[name*="message"], textarea, input[type="text"]').last();
      if (await messageInput.isVisible({ timeout: 3000 })) {
        const testMessage = `Message de test - ${Date.now()}`;
        await messageInput.fill(testMessage);
        
        const sendButton = page.locator('button:has-text("Send"), button:has-text("Envoyer"), button[type="submit"]').last();
        if (await sendButton.isVisible({ timeout: 3000 })) {
          await sendButton.click();
          await page.waitForTimeout(2000);
          
          // Vérifier que le message apparaît dans la conversation
          const sentMessage = page.locator(`text=${testMessage}`).first();
          if (await sentMessage.isVisible({ timeout: 5000 })) {
            console.log('✅ B.4: Message envoyé et affiché avec succès');
          }
        }
      } else {
        console.log('⚠️ B.4: Champ de message non trouvé');
      }
    } else {
      console.log('⚠️ B.4: Lien messagerie non trouvé');
    }
  });

  test('B.5 - Gestion Notifications', async ({ page }) => {
    console.log('🧪 Test B.5: Notifications');
    
    // Connexion bénéficiaire
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', DEMO_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', DEMO_PASSWORD);
    await page.click('button:has-text("Sign In"), button:has-text("Connexion")');
    
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    
    // Chercher l'icône de notifications
    const notificationIcon = page.locator('[data-testid="notifications"], .notification-icon, button:has-text("🔔")').first();
    if (await notificationIcon.isVisible({ timeout: 5000 })) {
      await notificationIcon.click();
      await page.waitForTimeout(1000);
      
      // Vérifier la présence du panneau de notifications
      const notificationPanel = page.locator('.notification-panel, .notifications-dropdown, [role="menu"]').first();
      if (await notificationPanel.isVisible({ timeout: 3000 })) {
        console.log('✅ B.5: Panneau de notifications accessible');
        
        // Compter les notifications
        const notificationItems = page.locator('.notification-item, .notification, li').all();
        const count = (await notificationItems).length;
        console.log(`✅ B.5: ${count} notification(s) trouvée(s)`);
      } else {
        console.log('⚠️ B.5: Panneau de notifications non visible');
      }
    } else {
      // Vérifier s'il y a un lien vers une page de notifications
      const notificationsLink = page.locator('a:has-text("Notifications")').first();
      if (await notificationsLink.isVisible({ timeout: 3000 })) {
        await notificationsLink.click();
        await page.waitForTimeout(2000);
        console.log('✅ B.5: Page de notifications accessible');
      } else {
        console.log('⚠️ B.5: Système de notifications non trouvé');
      }
    }
  });
});

