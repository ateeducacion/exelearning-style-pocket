// Uses Playwright already installed in the eXeLearning checkout; no test runner.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://localhost:1314/';

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 800, height: 800 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400 && response.url().startsWith(base)) errors.push(`${response.status()} ${response.url()}`); });
  const press = action => page.locator(`[data-action="${action}"]`).last().click();
  const ready = () => page.waitForFunction(() => document.querySelector('#pocket-console') && [...document.querySelectorAll('.idevice_node[data-idevice-component-type="json"]')].every(node => node.classList.contains('loaded')));
  try {
    await page.goto(base);
    await ready();
    await page.evaluate(() => document.fonts.ready);
    if (process.env.POCKET_SCREENSHOT) await page.screenshot({ path: process.env.POCKET_SCREENSHOT, fullPage: true });
    await press('start');
    const urls = await page.locator('#siteNav a').evaluateAll(links => links.map(link => link.href));
    assert.equal(await page.locator('.pocket-screen-menu a').count(), urls.length);
    await page.keyboard.press('ArrowUp');
    assert.equal(await page.locator('.pocket-screen-menu [aria-current="true"]').getAttribute('href'), urls.at(-1));
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('a');
    assert.equal(await page.locator('main .idevice_node:visible').count(), 1, 'Single-iDevice pages open directly');
    await press('back'); await press('back');
    assert(await page.locator('.welcome').isVisible(), 'B returns all the way to the cover');
    await press('start'); await press('power');
    assert.equal(await page.locator('#pocket-screen').evaluate(node => getComputedStyle(node).opacity), '0', 'Power off also hides selected-arrow pseudo-elements');
    await press('power');
    assert(await page.locator('.welcome').isVisible(), 'Power on returns to the cover');
    let count = 0;
    for (const url of urls) {
      await page.goto(url);
      await ready();
      await press('start');
      await page.locator('.pocket-screen-menu [aria-current="true"]').click();
      const total = await page.locator('main .idevice_node').count();
      assert(total > 0, `iDevices in ${url}`);
      if (total > 1) assert(await page.locator('.pocket-screen-menu [aria-current="true"]').evaluate(node => getComputedStyle(node).color !== getComputedStyle(node).backgroundColor), 'Selected iDevice text is visible');
      for (let i = 0; i < total; i++) {
        if (total > 1) await page.locator('.pocket-screen-menu button').nth(i).click();
        assert.equal(await page.locator('main .idevice_node:visible').count(), 1);
        await page.evaluate(() => { window.savedIdevice = document.querySelector('main .idevice_node:not([hidden])'); });
        await press('down');
        await press('back');
        if (total > 1) await page.locator('.pocket-screen-menu button').nth(i).click();
        else await page.locator('.pocket-screen-menu [aria-current="true"]').click();
        assert(await page.evaluate(() => window.savedIdevice === document.querySelector('main .idevice_node:not([hidden])')), 'Keep live iDevice nodes');
        await press('back');
        count++;
      }
    }

    const quizURL = urls.find(url => url.includes('verdadero'));
    await page.goto(quizURL); await ready();
    await page.locator('.pocket-screen-menu button').last().click();
    assert.equal(await page.locator('.TOFP-ShowSuggestion:visible').count(), 0, 'Respect iDevice hidden states');
    await press('right'); await press('accept');
    assert(await page.locator('.TOFP-Answer').first().isChecked(), 'Cruceta and A operate real quiz inputs');
    for (const [index, value] of ['1', '0', '1', '0'].entries()) {
      await page.locator('.TOFP-QuestionDiv').nth(index).locator(`input[value="${value}"]`).check();
    }
    await page.locator('[id^="tofPCheckTest-"]').click();
    assert.equal(await page.locator('.TOFP-SolutionMessage').filter({ hasText: /Correcto/i }).count(), 4, 'Native quiz marks all correct answers');
    await press('back'); await page.locator('.pocket-screen-menu button').last().click();
    assert.equal(await page.locator('.TOFP-Answer:checked').count(), 4, 'Answers survive menu navigation');

    await page.goto(urls.find(url => url.includes('ordena'))); await ready();
    await page.locator('.pocket-screen-menu button').last().click();
    const options = await page.locator('.scrambled-list').evaluate(node => JSON.parse(node.dataset.ideviceJsonData).options);
    for (let i = 0; i < options.length; i++) {
      for (let attempts = 0; attempts < options.length; attempts++) {
        const items = await page.locator('.exe-sortableList-options > li').allTextContents();
        const index = items.findIndex(text => text.includes(options[i]));
        if (index === i) break;
        await page.locator('.exe-sortableList-options > li').nth(index).locator('a.up').click();
      }
    }
    await page.locator('input[class*="exe-sortableList-check-"]').click();
    assert.match(await page.locator('[id$="-feedback"]').innerText(), /Correcto|superada/i, 'Native sorting exercise can be completed');

    await press('power'); assert(await page.locator('#pocket-screen').evaluate(node => node.inert));
    await press('power'); await press('sound'); await press('sound');
    await press('expand'); assert(await page.locator('#pocket-console').evaluate(node => node.classList.contains('is-expanded')));
    await press('expand');
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await press('start');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Fits ${width}px`);
      await press('expand');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Expanded mode fits ${width}px`);
      await press('expand');
    }
    await page.goto(base); await ready(); await press('start');
    await page.locator('.pocket-screen-menu a').nth(2).click();
    await page.waitForURL(urls[2]); await ready();
    assert(await page.locator('main .idevice_node:visible').count(), 'Page links load the single native iDevice on arrival');
    assert.deepEqual(errors, []);
    console.log(`PASS: ${urls.length} pages, ${count} live iDevices, native quizzes, sorting, keyboard, page navigation and mobile layout.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
