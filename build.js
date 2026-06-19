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
    id: "com.nuvio.custom.bundle",
    name: "My Custom Providers",
    version: "1.0.0",
    description: "An automated bundle of custom Nuvio scrapers.",
    types: ["movie", "series", "tv"],
    catalogs: [],
    providers: [] // Will be populated dynamically
};

// 4. Compile each provider
providers.forEach(providerName => {
    const entryPoint = path.join(srcDir, providerName, 'index.js');
    const outputFileName = `${providerName.toLowerCase()}.js`;
    const outputPath = path.join(distDir, outputFileName);

    if (fs.existsSync(entryPoint)) {
        try {
            // Minify and bundle into CommonJS format for Nuvio's Hermes engine
            esbuild.buildSync({
                entryPoints: [entryPoint],
                outfile: outputPath,
                bundle: false,
                minify: true,
                format: 'cjs',
            });
            
            console.log(`✅ Compiled: ${providerName}`);
            manifest.providers.push(outputFileName); // Add to manifest
        } catch (error) {
            console.error(`❌ Failed to compile ${providerName}:`, error);
        }
    }
});

// 5. Write the final manifest.json to dist/
fs.writeFileSync(path.join(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log("\n🚀 Build complete! manifest.json generated successfully.");