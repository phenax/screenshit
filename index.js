const path = require('path');
const puppeteer = require('puppeteer');
const { compose } = require('pipey');

const guard = fn => options => {
  const { url, retries, outputPath } = options || {};

  if (retries < 0) throw new Error('retries cannot be less than 0');
  if (!url) throw new Error('url parameter is compulsory');
  if (!outputPath) throw new Error('outputPath parameter is compulsory');

  return fn(options);
};

const handleRetries = (fn, lastError) => options => {
  const { retries } = options || {};
  if (retries < 0) return Promise.reject(lastError);

  return fn(options).catch(error => {
    return handleRetries(fn, error)({ ...options, retries: retries - 1 });
  });
};

async function takeScreenshot(options) {
  const { url, outputPath, timeout = 3000000, dimensions = '1024x600', logging } = options || {};

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  logging && console.log('Fetching', options.url, '...');

  await page.goto(url, {
    waitUntil: 'networkidle2',
    timeout,
  });

  if (dimensions) {
    const [width, height] = dimensions.split('x').map(x => parseInt(x, 10));
    page.setViewport({ width, height });
  }

  await page.screenshot({ path: outputPath });

  await browser.close();

  return path.resolve(outputPath);
};

module.exports = compose(handleRetries, guard)(takeScreenshot);
