# Screenshit

CLI tool to capture screenshots of a list of web pages

## Install

* Install it globally
```bash
npm install screenshit -g
# OR
yarn global add screenshit
```

* Use npx to run it without installing
```bash
npx screenshit --help
```

## Usage

### Help menu
```
screenshit --json path/to/file.json

Options:
  --version         Show version number                                [boolean]
  --help            Show help                                          [boolean]
  --urls            URL mode - You can follow this flag with space seperated
                    list of page urls to screenshit                    [boolean]
  --json            Path to your json config file                       [string]
  --csv             Path to your csv config file                        [string]
  --outdir, -O      Path to where you want your pngs dumped
                          [string] [default: "/home/akshayn/Desktop/screenshit"]
  --dimensions, -D  The dimensions of the viewport (widthxheight)
                                                  [string] [default: "1024x600"]
  --retries, -r     Max number of retries if an attempt fails
                                                           [number] [default: 3]
```

### Pass urls as cli arguments
Pass the page urls as command line arguments.

```
screenshit --urls "https://google.com" "https://github.com"
```

NOTE: `urls` is a boolean flag. Any loose arguments will be considered as urls.


### From json list of urls

```
screenshit --json example.json
```

`example.json` needs to look like...
```json
{
  "urls": [
    "https://google.com",
    "https://phenax.github.io",
    "https://github.com"
  ]
}
```


### From csv list of urls

```
screenshit --csv ./path/to/file.csv
```

The csv file needs to have the url as the first column

```csv
urls,label
https://google.com,"Google"
https://github.com,"Github homepage"
https://phenax.github.io,"Akshay Nair"
```
