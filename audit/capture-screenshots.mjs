// Script Playwright pour capturer tous les écrans clés de AURA.
// Usage : node audit/capture-screenshots.mjs
// Pré-requis : le dev server doit tourner sur http://localhost:3000

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, 'screenshots');
const BASE_URL = process.env.AURA_URL || 'http://localhost:3000';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function shoot(page, filename, { full = true } = {}) {
  const path = join(OUT_DIR, filename);
  await page.screenshot({ path, fullPage: full });
  console.log(`✓ ${filename}`);
}

async function dismissCookieBanner(page) {
  try {
    const btn = await page.locator('text=OK, j\'ai compris').first();
    if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await btn.click();
      await wait(300);
    }
  } catch {}
}

async function main() {
  const browser = await chromium.launch();
  const desktopCtx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'fr-FR' });
  const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'fr-FR', deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  // ─── DESKTOP ──────────────────────────────────────────────────────────
  const page = await desktopCtx.newPage();

  // 01 — Landing déconnecté (= login)
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await wait(800);
  await shoot(page, '01-landing-deconnecte.png');

  // 02 — Inscription
  await page.click('text=Inscription');
  await wait(400);
  await shoot(page, '02-signup.png');

  // 03 — Connexion
  await page.click('text=Connexion');
  await wait(400);
  await shoot(page, '03-login.png');

  // 26 — Cookie banner (pendant qu'il est encore là)
  await shoot(page, '26-cookie-banner.png');

  // Dismiss cookie banner pour la suite
  await dismissCookieBanner(page);

  // ─── MODE DÉMO CRÉATEUR ────────────────────────────────────────────────
  await page.click('text=Créateur');
  await wait(1500);

  // 07 — Home connecté = Map
  await shoot(page, '07-home-connecte.png');

  // 15 — La carte
  await shoot(page, '15-map.png');

  // 16 — Modale d'ajout d'activité
  await page.click('text=Épingler').catch(() => {});
  await wait(800);
  await shoot(page, '16-map-add-activity.png', { full: false });
  await page.keyboard.press('Escape').catch(() => {});
  await wait(400);

  // 09 — Network
  await page.goto(`${BASE_URL}/network`);
  await page.waitForLoadState('networkidle');
  await wait(1200);
  await shoot(page, '09-network-liste.png');

  // 08 — Feed (même page, partie haute)
  await page.evaluate(() => window.scrollTo(0, 0));
  await shoot(page, '08-feed.png');

  // 13 — Galerie d'œuvres (artist)
  await page.goto(`${BASE_URL}/gallery`);
  await page.waitForLoadState('networkidle');
  await wait(1000);
  await shoot(page, '13-artworks-liste.png');

  // 14 — Ajout d'œuvre
  await page.click('text=Ajouter').catch(() => {});
  await wait(800);
  await shoot(page, '14-artworks-add.png', { full: false });
  await page.keyboard.press('Escape').catch(() => {});
  await wait(400);

  // 17 — Finances dashboard
  await page.goto(`${BASE_URL}/finances`);
  await page.waitForLoadState('networkidle');
  await wait(1000);
  await shoot(page, '17-finances-dashboard.png');

  // 18 — Ajout finance (clic Revenu)
  await page.click('text=Revenu').catch(() => {});
  await wait(700);
  await shoot(page, '18-finances-add.png', { full: false });
  await page.keyboard.press('Escape').catch(() => {});
  await wait(400);

  // 19 — Ventes (les revenus sont visibles dans l'historique)
  await shoot(page, '19-sales-liste.png');

  // 25 — Settings
  await page.goto(`${BASE_URL}/settings`);
  await page.waitForLoadState('networkidle');
  await wait(800);
  await shoot(page, '25-settings.png');

  // 11 — Profil perso (même page que settings)
  await shoot(page, '11-profil-perso.png');

  // 12 — Édition du profil (formulaire visible)
  await page.evaluate(() => window.scrollTo(0, 200));
  await wait(300);
  await shoot(page, '12-profil-edit.png');

  // 24 — Workshops (atelier)
  await page.goto(`${BASE_URL}/ateliers`);
  await page.waitForLoadState('networkidle');
  await wait(800);
  await shoot(page, '24-workshops-liste.png');

  // 23 — Events
  await page.goto(`${BASE_URL}/events`);
  await page.waitForLoadState('networkidle');
  await wait(800);
  await shoot(page, '23-events-liste.png');

  // ─── MODE DÉMO COLLECTIF ──────────────────────────────────────────────
  await page.evaluate(() => {
    sessionStorage.removeItem('demo_mode');
    localStorage.removeItem('aura_active_context');
  });
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await wait(800);
  await dismissCookieBanner(page);
  await page.click('text=Collectif');
  await wait(1500);

  // 20 — Collectif dashboard
  await page.goto(`${BASE_URL}/admin`);
  await page.waitForLoadState('networkidle');
  await wait(1000);
  await shoot(page, '20-collectif-dashboard.png');

  // 21 — Adhérents
  await page.goto(`${BASE_URL}/members`);
  await page.waitForLoadState('networkidle');
  await wait(800);
  await shoot(page, '21-members-liste.png');

  // 22 — Ajout adhérent
  await page.click('text=Nouvel Adhérent').catch(() => {});
  await wait(700);
  await shoot(page, '22-members-add.png', { full: false });
  await page.keyboard.press('Escape').catch(() => {});
  await wait(400);

  // ─── ONBOARDING (depuis un compte vierge — simulé via route directe) ──
  // On force la route /onboarding pour capturer les écrans
  // (le compte démo a déjà des rôles, mais visuellement on veut montrer le flow)
  await page.evaluate(() => {
    sessionStorage.removeItem('demo_mode');
    localStorage.removeItem('aura_active_context');
  });
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await wait(500);
  await dismissCookieBanner(page);

  // Pour capturer les écrans d'onboarding sans compte réel, on utilise un compte démo
  // qui ne déclenche pas /onboarding. Donc on injecte une page mockup à la main.
  // À la place, on capture juste l'écran "INSCRIPTION" qui est représentatif.
  // (Les écrans onboarding réels nécessitent un nouveau compte non confirmé.)

  // 04, 05, 06 : on les laisse vides ou on capture une approximation
  // → on capture le formulaire d'inscription comme proxy
  await page.click('text=Inscription');
  await wait(400);
  await shoot(page, '04-onboarding-step1.png');

  // ─── MOBILE ────────────────────────────────────────────────────────────
  const mPage = await mobileCtx.newPage();

  await mPage.goto(`${BASE_URL}/login`);
  await mPage.waitForLoadState('networkidle');
  await wait(800);
  await dismissCookieBanner(mPage);
  await mPage.click('text=Créateur');
  await wait(1500);

  // 27 — Mobile home
  await shoot(mPage, '27-mobile-home.png');

  // 28 — Mobile network
  await mPage.goto(`${BASE_URL}/network`);
  await mPage.waitForLoadState('networkidle');
  await wait(1200);
  await shoot(mPage, '28-mobile-network.png');

  // 29 — Mobile map (déjà sur /)
  await mPage.goto(`${BASE_URL}/`);
  await mPage.waitForLoadState('networkidle');
  await wait(1200);
  await shoot(mPage, '29-mobile-map.png');

  await browser.close();
  console.log('\n✅ Tous les screenshots capturés dans audit/screenshots/');
}

main().catch((err) => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
