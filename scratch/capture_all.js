import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  await page.goto("http://localhost:5190/");
  await page.waitForTimeout(1000);

  const targetDir = "/Users/haritmishra/.gemini/antigravity/brain/1a6fb965-ca9b-442a-84a9-9384077e7b01";

  // 1. Billing POS
  await page.screenshot({ path: `${targetDir}/pos_main_billing.png` });

  // 2. Inventory
  await page.click("text=Kirana Inventory");
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${targetDir}/inventory_screen.png` });

  // 3. Khata
  await page.click("text=Udhaar & Loyalty");
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${targetDir}/khata_screen.png` });

  // 4. Reports
  await page.click("text=Reports & GST");
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${targetDir}/reports_screen.png` });

  // 5. Security
  await page.click("text=Security & Privacy");
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${targetDir}/security_screen.png` });

  // 6. Settings
  await page.click("text=Settings");
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${targetDir}/settings_screen.png` });

  await browser.close();
  console.log("Captured all screen screenshots successfully.");
}

main().catch(console.error);
