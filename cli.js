#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const slugify = require('slugify');
const yargs = require('yargs');
const csvParser = require('csvtojson');

const screenshit = require('./index');

// randomHash :: () -> string
const randomHash = () => `${Math.random().toString(16)}0000000`.slice(2, 8);

const { argv } = yargs
  .usage('$0 --json path/to/file.json')
  .help()
  .option('url', {
    type: 'string',
    describe: 'The url of the page you want to screenshot',
  })
  .option('json', {
    type: 'string',
    describe: 'Path to your json config file',
  })
  .option('csv', {
    type: 'string',
    describe: 'Path to your csv config file',
  })
  .option('outdir', {
    type: 'string',
    alias: 'O',
    default: path.resolve(),
    describe: 'Path to where you want your pngs dumped',
  })
  .option('dimensions', {
    type: 'string',
    alias: 'D',
    default: '1024x600',
    describe: 'The dimensions of the viewport (widthxheight)',
  })
  .option('retries', {
    type: 'number',
    alias: 'r',
    default: 3,
    describe: 'Max number of retries if an attempt fails',
  });

const guard = fn => options => {
  if (!options.json && !options.csv && !options.url)
    throw new Error('You need to specify either json or csv config file path');

  return fn(options);
};

// getUrls :: { json: string, csv: string, url: string } -> []
async function getUrls({ json, csv, url }) {
  if (url) return [url];
  if (json) return JSON.parse(fs.readFileSync(json, 'utf-8')).urls;
  if (csv) {
    const files = await csvParser({ output: 'csv' }).fromFile(csv);
    return files.map(([ url ]) => url);
  };
  return [];
}

// toImageFileName :: string -> string
const toImageFileName = url =>
  `${slugify(url).replace(/^https?:?/, '')}-${randomHash()}.png`;

// takeScreenshots :: Options -> Promise [string]
async function takeScreenshots(options) {
  const { json, csv, url, outdir, ...rest } = options;

  const files = await getUrls(options);

  return Promise.all(
    files.map(url => screenshit({
      url,
      outputPath: path.resolve(outdir, toImageFileName(url)),
      logging: true,
      ...rest,
    }))
  );
}

guard(takeScreenshots)(argv)
  .then(screenshots => {
    if (screenshots.length === 0) {
      console.log('No urls provided to screenshot');
    } else {
      screenshots.forEach(x => console.log('Saving screenshot to', x, '...'));
    }

    console.log('Done');
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
