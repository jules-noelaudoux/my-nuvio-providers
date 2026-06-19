var __provider=(()=>{var __defProp=Object.defineProperty;var __getOwnPropDesc=Object.getOwnPropertyDescriptor;var __getOwnPropNames=Object.getOwnPropertyNames;var __hasOwnProp=Object.prototype.hasOwnProperty;var __export=(target,all)=>{for(var name in all)__defProp(target,name,{get:all[name],enumerable:!0})},__copyProps=(to,from,except,desc)=>{if(from&&typeof from=="object"||typeof from=="function")for(let key of __getOwnPropNames(from))!__hasOwnProp.call(to,key)&&key!==except&&__defProp(to,key,{get:()=>from[key],enumerable:!(desc=__getOwnPropDesc(from,key))||desc.enumerable});return to};var __toCommonJS=mod=>__copyProps(__defProp({},"__esModule",{value:!0}),mod);var index_exports={};__export(index_exports,{getStreams:()=>getStreams});var CONFIG={PROVIDER_NAME:"Gallic",API_BASE:"https://gallic.aether.bar",HEADERS:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0",Origin:"https://zebi.senpai-stream.club",Referer:"https://zebi.senpai-stream.club/"}};function getStreams(tmdbId,mediaType,season,episode){return new Promise(function(resolve){var apiUrl;if(mediaType==="movie")apiUrl=CONFIG.API_BASE+"/movie/"+tmdbId;else if(mediaType==="series"||mediaType==="tv"||mediaType==="anime")apiUrl=CONFIG.API_BASE+"/tv/"+tmdbId+"/"+season+"/"+episode;else return resolve([]);fetch(apiUrl).then(function(res){return res.ok?res.json():(console.log("[Gallic] API returned HTTP "+res.status+" for "+apiUrl),resolve([]))}).then(function(data){if(!data)return resolve([]);var streamUrl=null;if(data.source&&data.source.stream_url&&typeof data.source.stream_url=="string"?streamUrl=data.source.stream_url:data.url&&typeof data.url=="string"?streamUrl=data.url:data.stream&&typeof data.stream=="string"?streamUrl=data.stream:Array.isArray(data.sources)&&data.sources.length>0?streamUrl=data.sources[0].url||data.sources[0]:data.data&&data.data.url?streamUrl=data.data.url:typeof data=="string"&&data.includes("m3u8")&&(streamUrl=data),!streamUrl)return console.log("[Gallic] Could not extract stream URL from API response: "+JSON.stringify(data)),resolve([]);var uiTitle,bingeId;mediaType==="movie"?(uiTitle=CONFIG.PROVIDER_NAME+`
Auto (HLS)`,bingeId="gallic-movie-"+tmdbId):(uiTitle=CONFIG.PROVIDER_NAME+`
S`+season+" E"+episode+" - Auto (HLS)",bingeId="gallic-tv-"+tmdbId+"-"+season),resolve([{name:CONFIG.PROVIDER_NAME,title:uiTitle,url:streamUrl,behaviorHints:{notWebReady:!1,bingeGroup:bingeId,requestHeaders:CONFIG.HEADERS}}])}).catch(function(err){console.log("[Gallic] Fetch error: "+(err&&err.message?err.message:err)),resolve([])})})}return __toCommonJS(index_exports);})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = __provider;
}
if (__provider && __provider.getStreams) {
    if (typeof globalThis !== 'undefined') {
        globalThis.getStreams = __provider.getStreams;
    }
    if (typeof global !== 'undefined') {
        global.getStreams = __provider.getStreams;
    }
    if (typeof self !== 'undefined') {
        self.getStreams = __provider.getStreams;
    }
}
