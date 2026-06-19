const CONFIG = {
    PROVIDER_NAME: 'Gallic',
    // API that returns the stream data (token included in the response URL)
    API_BASE: 'https://gallic.aether.bar',
    // Headers needed to play the stream from zebi.senpai-stream.club
    HEADERS: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0",
        "Origin": "https://zebi.senpai-stream.club",
        "Referer": "https://zebi.senpai-stream.club/"
    }
};

function getStreams(tmdbId, mediaType, season, episode) {
    return new Promise(function(resolve) {
        var apiUrl;

        // Build the correct API URL for each media type
        if (mediaType === 'movie') {
            apiUrl = CONFIG.API_BASE + '/movie/' + tmdbId;
        } else if (mediaType === 'series' || mediaType === 'tv' || mediaType === 'anime') {
            apiUrl = CONFIG.API_BASE + '/tv/' + tmdbId + '/' + season + '/' + episode;
        } else {
            return resolve([]);
        }

        // Fetch the stream data from the Gallic API
        fetch(apiUrl)
            .then(function(res) {
                if (!res.ok) {
                    console.log('[Gallic] API returned HTTP ' + res.status + ' for ' + apiUrl);
                    return resolve([]);
                }
                return res.json();
            })
            .then(function(data) {
                if (!data) return resolve([]);

                // Extract the stream URL from various possible response shapes
                var streamUrl = null;

                // Shape 1: { url: "..." }
                if (data.url && typeof data.url === 'string') {
                    streamUrl = data.url;
                }
                // Shape 2: { stream: "..." }
                else if (data.stream && typeof data.stream === 'string') {
                    streamUrl = data.stream;
                }
                // Shape 3: { sources: [{ url: "..." }, ...] }
                else if (Array.isArray(data.sources) && data.sources.length > 0) {
                    streamUrl = data.sources[0].url || data.sources[0];
                }
                // Shape 4: { data: { url: "..." } }
                else if (data.data && data.data.url) {
                    streamUrl = data.data.url;
                }
                // Shape 5: Plain string URL
                else if (typeof data === 'string' && data.includes('m3u8')) {
                    streamUrl = data;
                }

                if (!streamUrl) {
                    console.log('[Gallic] Could not extract stream URL from API response: ' + JSON.stringify(data));
                    return resolve([]);
                }

                var uiTitle, bingeId;
                if (mediaType === 'movie') {
                    uiTitle = CONFIG.PROVIDER_NAME + '\nAuto (HLS)';
                    bingeId = 'gallic-movie-' + tmdbId;
                } else {
                    uiTitle = CONFIG.PROVIDER_NAME + '\nS' + season + ' E' + episode + ' - Auto (HLS)';
                    bingeId = 'gallic-tv-' + tmdbId + '-' + season;
                }

                resolve([{
                    name: CONFIG.PROVIDER_NAME,
                    title: uiTitle,
                    url: streamUrl,
                    behaviorHints: {
                        notWebReady: false,
                        bingeGroup: bingeId,
                        requestHeaders: CONFIG.HEADERS
                    }
                }]);
            })
            .catch(function(err) {
                console.log('[Gallic] Fetch error: ' + (err && err.message ? err.message : err));
                resolve([]);
            });
    });
}