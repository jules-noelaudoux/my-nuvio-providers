const forge = require('node-forge');

const CONFIG = {
    KEY_HEX: "a8f2a1b5e9c470814f6b2c3a5d8e7f9c1a2b3c4d5e3f7a8b8cad1e2d0a4d5c5d",
    HEADERS: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Origin': 'https://peachify.top',
        'Referer': 'https://peachify.top/'
    }
};

const SERVERS = [
    { name: "Iron", path: "moviebox", apis: ["https://uwu.eat-peach.sbs"] },
    { name: "Spider", path: "holly", apis: ["https://usa.eat-peach.sbs"] },
    { name: "Wolf", path: "air", apis: ["https://usa.eat-peach.sbs"] },
    { name: "Multi", path: "multi", apis: ["https://usa.eat-peach.sbs"] },
    { name: "Dark", path: "net", apis: ["https://uwu.eat-peach.sbs"] }
];

function decrypt(encryptedData, keyHex) {
    try {
        const parts = encryptedData.split('.');
        if (parts.length !== 3) {
            throw new Error("Invalid encrypted data format");
        }
        
        let b64Iv = parts[0].replace(/-/g, '+').replace(/_/g, '/');
        let b64Cipher = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        let b64Tag = parts[2].replace(/-/g, '+').replace(/_/g, '/');
        
        while (b64Iv.length % 4) b64Iv += '=';
        while (b64Cipher.length % 4) b64Cipher += '=';
        while (b64Tag.length % 4) b64Tag += '=';
        
        const iv = forge.util.decode64(b64Iv);
        const ciphertext = forge.util.decode64(b64Cipher);
        const tag = forge.util.decode64(b64Tag);
        const key = forge.util.hexToBytes(keyHex);
        
        const decipher = forge.cipher.createDecipher('AES-GCM', key);
        decipher.start({
            iv: iv,
            tagLength: tag.length * 8,
            tag: forge.util.createBuffer(tag)
        });
        decipher.update(forge.util.createBuffer(ciphertext));
        const pass = decipher.finish();
        
        if (pass) {
            const decryptedString = decipher.output.toString('utf8');
            try {
                return JSON.parse(decodeURIComponent(escape(decryptedString)));
            } catch(e) {
                return JSON.parse(decryptedString);
            }
        }
        return null;
    } catch (e) {
        console.log('[Peachify] Decryption failed: ' + e.message);
        return null;
    }
}

function getSourceScore(source, subtitles, mediaType) {
    const dub = (source.dub || "").toLowerCase();
    
    // 1. French Dub (VF) -> Priority 10 (Highest)
    const isFrenchDub = dub.includes("french") || dub.includes("francais") || dub.includes("français") || dub.includes("vf");
    if (isFrenchDub) {
        return 10;
    }
    
    // 2. VOSTFR (Subbed with French subtitles)
    let hasFrenchSubs = false;
    if (Array.isArray(subtitles)) {
        for (const sub of subtitles) {
            const label = (sub.label || "").toLowerCase();
            const lang = (sub.lang || sub.langCode || "").toLowerCase();
            if (label.includes("french") || label.includes("francais") || label.includes("français") || lang === "fr" || lang === "fra") {
                hasFrenchSubs = true;
                break;
            }
        }
    }
    
    if (hasFrenchSubs) {
        if (mediaType === 'anime') {
            const isOriginalDub = dub.includes("japanese") || dub.includes("original") || dub.includes("japanese sub") || dub.includes("ja") || dub.includes("sub");
            if (isOriginalDub) {
                return 9; // VOSTFR Anime (Japanese Audio + French Sub)
            }
            return 8; // VOSTFR Anime with other dub
        } else {
            const isEnglishDub = dub.includes("english") || dub.includes("en") || dub.includes("original") || dub.includes("us");
            if (isEnglishDub) {
                return 9; // VOSTFR Movie/Series (English Audio + French Sub)
            }
            return 7; // VOSTFR Movie/Series with other dub
        }
    }
    
    // 3. English Dub (no French subs) -> Priority 5
    const isEnglishDub = dub.includes("english") || dub.includes("en") || dub.includes("original") || dub.includes("us");
    if (isEnglishDub) {
        return 5;
    }
    
    return 1; // 4. Other/Fallback -> Priority 1
}

export function getStreams(tmdbId, mediaType, season, episode) {
    return new Promise(function(resolve) {
        let apiPath = '';
        if (mediaType === 'movie') {
            apiPath = 'movie/' + tmdbId;
        } else if (mediaType === 'series' || mediaType === 'tv' || mediaType === 'anime') {
            apiPath = 'tv/' + tmdbId + '/' + season + '/' + episode;
        } else {
            return resolve([]);
        }

        // Fetch all servers in parallel
        const promises = SERVERS.map(function(server) {
            const api = server.apis[0];
            const url = api + '/' + server.path + '/' + apiPath;
            
            return fetch(url, { headers: CONFIG.HEADERS })
                .then(function(res) {
                    if (!res.ok) return null;
                    return res.json();
                })
                .then(function(data) {
                    if (!data) return null;
                    let decrypted = data;
                    if (data.isEncrypted) {
                        decrypted = decrypt(data.data, CONFIG.KEY_HEX);
                    }
                    if (decrypted && Array.isArray(decrypted.sources)) {
                        decrypted.sources.forEach(function(src) {
                            src.server = server.name;
                        });
                        return decrypted;
                    }
                    return null;
                })
                .catch(function() {
                    return null;
                });
        });

        Promise.all(promises).then(function(results) {
            let allSources = [];
            let allSubtitles = [];

            results.forEach(function(res) {
                if (res) {
                    if (Array.isArray(res.sources)) {
                        allSources = allSources.concat(res.sources);
                    }
                    if (Array.isArray(res.subtitles)) {
                        allSubtitles = allSubtitles.concat(res.subtitles);
                    }
                }
            });

            if (allSources.length === 0) {
                console.log('[Peachify] No sources found across all servers');
                return resolve([]);
            }

            // Deduplicate sources by URL
            const seenUrls = {};
            const uniqueSources = allSources.filter(function(src) {
                if (seenUrls[src.url]) return false;
                seenUrls[src.url] = true;
                return true;
            });

            // Sort sources by user preference score
            uniqueSources.sort(function(a, b) {
                const scoreA = getSourceScore(a, allSubtitles, mediaType);
                const scoreB = getSourceScore(b, allSubtitles, mediaType);
                return scoreB - scoreA;
            });

            // Build stream array
            const streams = uniqueSources.map(function(src) {
                const score = getSourceScore(src, allSubtitles, mediaType);
                
                let languageLabel = src.dub || "Multi";
                if (score === 10) {
                    languageLabel = "French (VF) 🇫🇷";
                } else if (score === 9) {
                    languageLabel = src.dub + " (FR Sub) 🇫🇷";
                } else if (score === 8 || score === 7) {
                    languageLabel = src.dub + " (FR Sub) 🇫🇷";
                } else if (score === 5) {
                    languageLabel = "English Dub (EN) 🇬🇧";
                }
                
                const qualityLabel = src.quality ? src.quality + 'p' : 'Auto';
                const title = '[Peachify] ' + src.server + '\n' + languageLabel + ' - ' + qualityLabel;
                
                // Format subtitles
                const formattedSubtitles = allSubtitles.map(function(sub) {
                    return {
                        url: sub.url,
                        lang: sub.langCode || sub.lang || 'fr',
                        label: sub.label || 'French'
                    };
                });

                return {
                    name: 'Peachify (' + src.server + ')',
                    title: title,
                    url: src.url,
                    subtitles: formattedSubtitles,
                    behaviorHints: {
                        notWebReady: false,
                        requestHeaders: src.headers || {}
                    }
                };
            });

            resolve(streams);
        }).catch(function(err) {
            console.log('[Peachify] Promise.all error: ' + err.message);
            resolve([]);
        });
    });
}

