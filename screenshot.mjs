import puppeteer from 'puppeteer';

const url = process.argv[2] || 'http://localhost:3002';

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
const file = 'screenshot.png';
await page.screenshot({ path: file, fullPage: false });
await browser.close();
console.log('Kaydedildi:', file);
