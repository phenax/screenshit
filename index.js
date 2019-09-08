const puppeteer = require('puppeteer');
// const _ = require('pipey/proxy');

const guard = fn => options => {
  const { url, outputPath } = options || {};

  if (!url) throw new Error('url parameter is compulsory');
  if (!outputPath) throw new Error('outputPath parameter is compulsory');

  return fn(options);
};

async function takeScreenshot(options) {
  const { url, outputPath } = options;

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  await page.goto(url);

  await page.screenshot({ path: outputPath });

  await browser.close();
};

module.exports = guard(takeScreenshot);
