#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const yargs = require('yargs');
const csvParser = require('csvtojson');

const screenshits = require('./index');

const { argv } = yargs
  .usage('$0 --json path/to/file.json')
  .help()
  .option('urls', {
    type: 'boolean',
    describe: 'URL mode - You can follow this flag with space seperated list of page urls to screenshit',
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
  if (!options.json && !options.csv && !options.urls)
    throw new Error('You need to specify either urls or json or csv options');

  return fn(options);
};

// getUrls :: { json: string, csv: string, url: string } -> []
async function getUrls({ json, csv, urls, _: looseArgs }) {
  if (urls) return looseArgs;
  if (json) return JSON.parse(fs.readFileSync(json, 'utf-8')).urls;
  if (csv) {
    const files = await csvParser({ output: 'csv' }).fromFile(csv);
    return files.map(([ url ]) => url);
  };
  return [];
}

// takeScreenshots :: Options -> Promise [string]
async function takeScreenshots(options) {
  const urls = await getUrls(options);
  return screenshits.multi({ urls, ...options });
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
