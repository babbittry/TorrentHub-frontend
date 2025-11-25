export interface ParsedTorrentInfo {
    resolution?: string;
    videoCodec?: string;
    audioCodec?: string;
    source?: string;
    group?: string;
    subtitles?: string;
}

export function parseTorrentName(name: string): ParsedTorrentInfo {
    const info: ParsedTorrentInfo = {};

    // Common patterns
    const patterns = {
        resolution: /\b(2160p|1080p|1080i|720p|576p|480p|4k|8k)\b/i,
        videoCodec: /\b(x264|x265|h\.?264|h\.?265|hevc|avc|mpeg-?2|vc-?1|av1)\b/i,
        audioCodec: /\b(dtshd|dts-hd|dts|truehd|atmos|ac3|dd\+|dd|aac|flac|mp3|wav|opus)\b/i,
        source: /\b(bluray|blu-ray|uhd|remux|web-dl|webrip|hdtv|dvdrip|bdrip)\b/i,
        group: /-([a-zA-Z0-9]+)(?:\.torrent)?$/,
        subtitles: /\b(chs|cht|eng|jpn|kor|ger|fra|spa|ita|rus|diy)\b/ig,
    };

    // Extract Resolution
    const resMatch = name.match(patterns.resolution);
    if (resMatch) {
        info.resolution = resMatch[0].toLowerCase();
    }

    // Extract Video Codec
    const videoMatch = name.match(patterns.videoCodec);
    if (videoMatch) {
        let codec = videoMatch[0].toLowerCase();
        // Normalize
        if (codec === 'x264') codec = 'x264';
        else if (codec === 'x265') codec = 'x265';
        else if (codec.includes('h.264') || codec.includes('h264') || codec === 'avc') codec = 'H.264';
        else if (codec.includes('h.265') || codec.includes('h265') || codec === 'hevc') codec = 'H.265';
        else if (codec.includes('mpeg2') || codec.includes('mpeg-2')) codec = 'MPEG-2';
        else if (codec.includes('vc1') || codec.includes('vc-1')) codec = 'VC-1';
        else if (codec === 'av1') codec = 'AV1';
        
        info.videoCodec = codec;
    }

    // Extract Audio Codec
    const audioMatch = name.match(patterns.audioCodec);
    if (audioMatch) {
        let codec = audioMatch[0].toLowerCase();
        // Normalize
        if (codec.includes('dtshd') || codec.includes('dts-hd')) codec = 'DTS-HD MA';
        else if (codec === 'dts') codec = 'DTS';
        else if (codec === 'truehd') codec = 'TrueHD';
        else if (codec === 'atmos') codec = 'Atmos';
        else if (codec === 'ac3' || codec === 'dd') codec = 'AC3';
        else if (codec === 'dd+') codec = 'DD+';
        else if (codec === 'aac') codec = 'AAC';
        else if (codec === 'flac') codec = 'FLAC';
        else if (codec === 'mp3') codec = 'MP3';
        else if (codec === 'wav') codec = 'WAV';
        else if (codec === 'opus') codec = 'Opus';

        info.audioCodec = codec;
    }

    // Extract Source
    const sourceMatch = name.match(patterns.source);
    if (sourceMatch) {
        let source = sourceMatch[0].toLowerCase();
        // Normalize
        if (source.includes('bluray') || source.includes('blu-ray') || source.includes('bdrip')) source = 'BluRay';
        else if (source === 'uhd') source = 'UHD BluRay';
        else if (source === 'remux') source = 'Remux';
        else if (source === 'web-dl' || source === 'webrip') source = 'WEB-DL';
        else if (source === 'hdtv') source = 'HDTV';
        else if (source === 'dvdrip') source = 'DVD';

        info.source = source;
    }

    // Extract Subtitles
    const subtitleMatches = name.match(patterns.subtitles);
    if (subtitleMatches) {
        // Filter duplicates and normalize
        const uniqueSubs = Array.from(new Set(subtitleMatches.map(s => {
            const lower = s.toLowerCase();
            if (lower === 'chs') return 'Chs';
            if (lower === 'cht') return 'Cht';
            if (lower === 'eng') return 'Eng';
            if (lower === 'jpn') return 'Jpn';
            if (lower === 'kor') return 'Kor';
            if (lower === 'diy') return 'DIY';
            return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
        })));
        info.subtitles = uniqueSubs.join(', ');
    }

    // Extract Group
    const groupMatch = name.match(patterns.group);
    if (groupMatch) {
        info.group = groupMatch[1];
    }

    return info;
}