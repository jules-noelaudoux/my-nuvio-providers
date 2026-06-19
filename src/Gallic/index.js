const CONFIG = {
    PROVIDER_NAME: 'Gallic',
    BASE_URL: 'https://zebi.senpai-stream.club',
    TOKEN: 'premium-kxl3c9', // Isolated token for easy updates
    HEADERS: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0",
        "Origin": "https://aether.bar",
        "Referer": "https://aether.bar/"
    }
};

function getStreams(tmdbId, mediaType, season, episode) {
    return new Promise((resolve) => {
        try {
            let streamPath = '';
            let uiTitle = '';
            let bingeId = '';

            // 1. Build routes and UI metadata based on media type
            if (mediaType === 'movie') {
                streamPath = `/movie/${tmdbId}/${CONFIG.TOKEN}/master.m3u8`;
                uiTitle = `${CONFIG.PROVIDER_NAME}\nAuto 1080p (HLS)`;
                bingeId = `gallic-movie-${tmdbId}`;
            } 
            else if (mediaType === 'series' || mediaType === 'tv' || mediaType === 'anime') {
                if (mediaType === 'anime' && (season === undefined || episode === undefined || season === null || episode === null)) {
                    streamPath = `/movie/${tmdbId}/${CONFIG.TOKEN}/master.m3u8`;
                    uiTitle = `${CONFIG.PROVIDER_NAME}\nAuto 1080p (HLS)`;
                    bingeId = `gallic-movie-${tmdbId}`;
                } else {
                    streamPath = `/tv/${tmdbId}/${season}/${episode}/${CONFIG.TOKEN}/master.m3u8`;
                    uiTitle = `${CONFIG.PROVIDER_NAME}\nS${season} E${episode} - Auto (HLS)`;
                    bingeId = `gallic-tv-${tmdbId}-${CONFIG.TOKEN}`; // Perfect binge-group alignment
                }
            } 
            else {
                return resolve([]); // Unsupported format
            }

            // 2. Construct the final Nuvio stream object
            const stream = {
                name: CONFIG.PROVIDER_NAME,
                title: uiTitle,
                url: `${CONFIG.BASE_URL}${streamPath}`,
                type: mediaType,
                behaviorHints: {
                    notWebReady: false,
                    bingeGroup: bingeId,
                    requestHeaders: CONFIG.HEADERS
                }
            };

            resolve([stream]);

        } catch (error) {
            // 3. Failsafe: Prevent sandbox crashes on unexpected inputs
            resolve([]); 
        }
    });
}