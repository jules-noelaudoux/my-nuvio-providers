const fs = require('fs');
const path = require('path');

async function download() {
    const url = 'https://raw.githubusercontent.com/Gowaru/gowaru-nuvio-providers/main/providers/wookafr.js';
    console.log("Fetching raw wookafr.js...");
    try {
        const res = await fetch(url);
        if (res.ok) {
            const text = await res.text();
            console.log("Downloaded length:", text.length);
            
            // Print the last 1500 characters of the actual file
            console.log("\nLast 1500 characters of raw wookafr.js:");
            console.log(text.slice(-1500));
            
            // Save to wookafr.js for inspection
            fs.writeFileSync('wookafr_raw.js', text);
            console.log("Saved to wookafr_raw.js");
        } else {
            console.log("Failed to fetch: HTTP", res.status);
        }
    } catch (e) {
        console.error(e);
    }
}

download();
