// Recapture des screenshots de carte avec wait suffisant pour Leaflet
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

  // Desktop
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'fr-FR' });
  const page = await ctx.newPage();
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await wait(800);
  await dismissCookie(page);
  await page.click('text=Créateur');
  await wait(2500); // wait pour Leaflet tiles

  await page.screenshot({ path: join(OUT_DIR, '15-map.png'), fullPage: true });
  console.log('✓ 15-map.png');

  await page.screenshot({ path: join(OUT_DIR, '07-home-connecte.png'), fullPage: true });
  console.log('✓ 07-home-connecte.png');

  // Mobile
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'fr-FR', deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const mpage = await mctx.newPage();
  await mpage.goto(`${BASE_URL}/login`);
  await mpage.waitForLoadState('networkidle');
  await wait(800);
  await dismissCookie(mpage);
  await mpage.click('text=Créateur');
  await wait(2500);
  await mpage.screenshot({ path: join(OUT_DIR, '29-mobile-map.png'), fullPage: true });
  console.log('✓ 29-mobile-map.png');
  await mpage.screenshot({ path: join(OUT_DIR, '27-mobile-home.png'), fullPage: true });
  console.log('✓ 27-mobile-home.png');

  await browser.close();
  console.log('\n✅ Maps recapturées avec tuiles chargées');
}

main().catch((err) => { console.error(err); process.exit(1); });
