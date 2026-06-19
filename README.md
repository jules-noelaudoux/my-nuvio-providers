# My Nuvio Providers

A dynamic monorepo for custom Nuvio scraper extensions.

## Installation

1. Open the Nuvio app.
2. Go to **Settings > Local Scrapers / Plugins > Add Plugin**.
3. Paste the raw URL of the compiled manifest:
   `https://raw.githubusercontent.com/jules-noelaudoux/my-nuvio-providers/main/dist/manifest.json`
4. Toggle the extension to **Enabled**.

## Development

To compile and minify the providers after adding or modifying a script in `src/`:

```bash
npm install
npm run build
```

## Legal Disclaimer

This repository and its content are provided strictly for educational and research purposes. The author does not host, store, or distribute any media files. The scripts herein simply format publicly available network data.

Under the GNU GPLv3 License, this software is provided "AS IS", without warranty of any kind. The author assumes no liability for how this tool is used, nor for any copyright infringement or damages resulting from its utilization. Use at your own risk.