// Bonus screenshots demandés pour l'audit V2
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, 'screenshots');
const BASE_URL = 'http://localhost:3000';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function dismissCookie(page) {
  try {
    const btn = page.locator('text=OK, j\'ai compris').first();
    if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await btn.click();
      await wait(300);
    }
  } catch {}
}

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'fr-FR' });
  const page = await ctx.newPage();

  // ─── ARTISTE ────────────────────────────────────────────────
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await wait(800);
  await dismissCookie(page);
  await page.click('text=Créateur');
  await wait(2500);

  // BONUS 1 — Onboarding "Votre Trace" (sélection des disciplines)
  // En mode démo le rôle est déjà actif, donc on force l'écran via inscription
  await page.evaluate(() => {
    sessionStorage.removeItem('demo_mode');
    localStorage.removeItem('aura_active_context');
  });
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await wait(500);
  await dismissCookie(page);

  // Inscription temporaire (échouera si déjà existant mais c'est OK pour le screenshot)
  // → on injecte directement la route /onboarding via mock du localStorage ?
  // Plus simple : on capture le formulaire d'inscription comme proxy de l'onboarding
  // (car l'onboarding nécessite un compte)

  // Re-mode démo Créateur pour tester les autres écrans
  await page.click('text=Créateur');
  await wait(2500);

  // BONUS 2 — Tableau de bord créateur
  await page.goto(`${BASE_URL}/dashboard`);
  await page.waitForLoadState('networkidle');
  await wait(1500);
  await page.screenshot({ path: join(OUT_DIR, 'B02-dashboard-createur.png'), fullPage: true });
  console.log('✓ B02-dashboard-createur.png');

  // BONUS 6 — Modale de profil artiste vue depuis le réseau
  await page.goto(`${BASE_URL}/network`);
  await page.waitForLoadState('networkidle');
  await wait(2000);
  // Cliquer sur la première card de profil dans la liste
  const firstCard = page.locator('.bg-white.rounded-\\[2\\.5rem\\]').filter({ hasText: 'Suivre' }).first();
  if (await firstCard.isVisible({ timeout: 2000 }).catch(() => false)) {
    await firstCard.click();
    await wait(1200);
    await page.screenshot({ path: join(OUT_DIR, 'B06-modale-profil-artiste.png'), fullPage: false });
    console.log('✓ B06-modale-profil-artiste.png');
    await page.keyboard.press('Escape');
  } else {
    console.log('⚠ B06 : aucune card de profil visible (DB vide ?)');
  }

  // ─── COLLECTIF ────────────────────────────────────────────────
  await page.evaluate(() => {
    sessionStorage.removeItem('demo_mode');
    localStorage.removeItem('aura_active_context');
  });
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await wait(500);
  await dismissCookie(page);
  await page.click('text=Collectif');
  await wait(2000);

  // BONUS 3 — Adhérents (liste tableau complète)
  await page.goto(`${BASE_URL}/members`);
  await page.waitForLoadState('networkidle');
  await wait(1500);
  await page.screenshot({ path: join(OUT_DIR, 'B03-members-tableau.png'), fullPage: true });
  console.log('✓ B03-members-tableau.png');

  // BONUS 5 — Modale ajout adhérent
  await page.click('text=Nouvel Adhérent').catch(() => {});
  await wait(800);
  await page.screenshot({ path: join(OUT_DIR, 'B05-members-add-modal.png'), fullPage: false });
  console.log('✓ B05-members-add-modal.png');
  await page.keyboard.press('Escape');
  await wait(400);

  // BONUS 4 — Comptabilité du collectif
  await page.goto(`${BASE_URL}/accounting`);
  await page.waitForLoadState('networkidle');
  await wait(1500);
  await page.screenshot({ path: join(OUT_DIR, 'B04-accounting-collectif.png'), fullPage: true });
  console.log('✓ B04-accounting-collectif.png');

  // ─── ONBOARDING (proxy) ────────────────────────────────────────
  // L'écran "Votre Trace" nécessite un compte vraiment vide.
  // À la place, on capture la page d'inscription qui permet de visualiser le branding.
  await page.evaluate(() => {
    sessionStorage.removeItem('demo_mode');
    localStorage.removeItem('aura_active_context');
  });
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await wait(500);
  await dismissCookie(page);
  await page.click('text=Inscription');
  await wait(500);
  await page.screenshot({ path: join(OUT_DIR, 'B01-onboarding-disciplines-PROXY.png'), fullPage: false });
  console.log('✓ B01-onboarding-disciplines-PROXY.png (l\'onboarding réel nécessite un compte vierge)');

  await browser.close();
  console.log('\n✅ Bonus screenshots capturés');
}

main().catch((err) => { console.error(err); process.exit(1); });
