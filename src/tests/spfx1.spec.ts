import * as puppeteer from 'puppeteer';
import * as spauth from 'node-sp-auth';

import * as fs from 'fs';
import * as path from 'path';
import { Cpass } from 'cpass';
import { Cache } from '../Cache';

const cpass = new Cpass();
const config = fs.readFileSync(path.join(__dirname, "../../config.json"), "UTF-8");
const configObj = JSON.parse(config);

describe('Tests on a site page (not news)', () => {
  let browser: puppeteer.Browser = null;
  let page: puppeteer.Page = null;
  
  /**
   * Create the browser and page context
   */
  beforeAll(async () => {
    const cache = new Cache();

    console.time("login");

    const {username, password, pageUrl} = configObj;
    
    let data = await cache.get("creds");

    console.log(data);

    if(data === undefined) {
      // Connect to SharePoint
      data = await spauth.getAuth(pageUrl, {
        username: cpass.decode(username),
        password: cpass.decode(password)
      });
    }

    console.log(data);

    console.timeEnd("login");

    console.time("launch");

    browser = await puppeteer.launch();
    page = await browser.newPage();
    // Add the authentication headers
    await page.setExtraHTTPHeaders(data.headers);
    // Set default viewport
    await page.setViewport({
      height: 1280,
      width: 1200
    });

    console.timeEnd("launch");

    console.time("goto");

    // Open the page
    await page.goto(configObj.pageUrl, {
      waitUntil: 'networkidle0'
    });

    console.timeEnd("goto");
  }, 30000);

  /**
   * Things to do after all tests are completed
   */
  afterAll(() => {
    browser.close();
  });

  /**
   * Checks if the page is loaded successfully
   * 
   * 30 seconds timeout
   */
  it('Should load the page', async () => {
    
    await page.screenshot({path: 'title-screenshot.png'});

    expect(page).not.toBeNull();
    expect(await page.title()).not.toBeNull();
    expect(await page.title()).toBe("Automated UI Tests - Home");
  });

  /**
   * Start of the other page tests
   */
  // test('Check if caption element is present in the web part', async () => {
  //   const caption = await page.$('div[data-ui-test-id="caption"]');
  //   expect(caption).not.toBeNull();

  //   const captionTitle = await caption.$('p[data-ui-test-id="caption-title"]');
  //   expect(captionTitle).not.toBeNull();
  // });

  // /**
  //  * Check the text in elements
  //  */
  // test('Check if caption text is equal to "Automated UI Tests"', async () => {
  //   const captionText = await page.evaluate(() => document.querySelector('p[data-ui-test-id="caption-title"]').textContent);
  //   expect(captionText).toBe("Automated UI Tests");
  // });
});