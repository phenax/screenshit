const path = require('path');
const slugify = require('slugify');
const puppeteer = require('puppeteer');
const { compose } = require('pipey');

const guard = fn => options => {
  const { url, retries, outputPath } = options || {};

  if (retries < 0) Promise.reject(new Error('retries cannot be less than 0'));
  if (!url) Promise.reject(new Error('url parameter is compulsory'));
  if (!outputPath) Promise.reject(new Error('outputPath parameter is compulsory'));

  return fn(options);
};

const handleRetries = (fn, lastError) => options => {
  const { retries } = options || {};
  if (retries < 0) return Promise.reject(lastError);

  return fn(options).catch(error => {
    return handleRetries(fn, error)({
      ...options,
      failedFirstAttempt: true,
      retries: retries - 1,
    });
  });
};

async function takeScreenshot(options) {
  const { url, outputPath, timeout = 3000000, dimensions = '1024x600' } = options || {};
  const { logging, failedFirstAttempt } = options || {};

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  if (logging) {
    console.log(failedFirstAttempt ? 'Retrying' : 'Fetching', options.url, '...');
  }

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

// singleShot :: Options -> Promise string
const singleShot = compose(handleRetries, guard)(takeScreenshot);

// toImageFileName :: string -> string
const toImageFileName = url =>
  `${slugify(url).replace(/^https?:?/, '')}-${randomHash()}.png`;

// randomHash :: () -> string
const randomHash = () => `${Math.random().toString(16)}0000000`.slice(2, 8);

// mutliShots :: Options -> Promise [string]
const mutliShots = ({ urls, outdir, ...rest }) => Promise.all(
  urls.map(url => singleShot({
    url,
    outputPath: path.resolve(outdir, toImageFileName(url)),
    logging: true,
    ...rest,
  })),
);

module.exports = {
  single: singleShot,
  multi: mutliShots,
};
