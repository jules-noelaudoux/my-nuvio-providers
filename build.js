const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

// 1. Ensure the dist directory exists
if (fs.existsSync(distDir)) fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir);

// 2. Discover all provider folders in src/
const providers = fs.readdirSync(srcDir).filter(file => 
    fs.statSync(path.join(srcDir, file)).isDirectory()
);

// 3. Base Manifest Template
const manifest = {
    name: "My Custom Providers",
    version: "1.0.0",
    scrapers: [] // Will be populated dynamically
};

// 4. Compile each provider
providers.forEach(providerName => {
    const entryPoint = path.join(srcDir, providerName, 'index.js');
    const outputFileName = `${providerName.toLowerCase()}.js`;
    const outputPath = path.join(distDir, outputFileName);

    if (fs.existsSync(entryPoint)) {
        try {
            // Bundle into a sandbox-friendly script structure compatible with Nuvio
            esbuild.buildSync({
                entryPoints: [entryPoint],
                outfile: outputPath,
                bundle: true,
                external: ['cheerio', 'crypto-js'],
                minifyWhitespace: true,
                minifySyntax: true,
                format: 'iife',
                platform: 'browser',
                target: 'es6',
                globalName: '__provider',
                footer: {
                    js: `\nif (typeof module !== 'undefined' && module.exports) {\n    module.exports = __provider;\n}\nif (__provider && __provider.getStreams) {\n    if (typeof globalThis !== 'undefined') {\n        globalThis.getStreams = __provider.getStreams;\n    }\n    if (typeof global !== 'undefined') {\n        global.getStreams = __provider.getStreams;\n    }\n    if (typeof self !== 'undefined') {\n        self.getStreams = __provider.getStreams;\n    }\n}`
                }
            });
            
            console.log(`✅ Compiled: ${providerName}`);
            manifest.scrapers.push({
                id: providerName.toLowerCase(),
                name: providerName,
                description: `Custom scraper for ${providerName}`,
                version: "1.0.0",
                author: "jules noel-audoux",
                supportedTypes: ["movie", "tv"],
                filename: outputFileName,
                enabled: true,
                formats: ["mp4", "m3u8"],
                logo: "https://www.google.com/s2/favicons?domain=google.com&sz=128",
                contentLanguage: ["en", "fr"]
            });
        } catch (error) {
            console.error(`❌ Failed to compile ${providerName}:`, error);
        }
    }
});

// 5. Write the final manifest.json to dist/
fs.writeFileSync(path.join(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log("\n🚀 Build complete! manifest.json generated successfully.");