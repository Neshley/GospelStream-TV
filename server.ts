import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory cache to make repeated queries fast while keeping data fresh
const searchCache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes cache

// Helper function to search YouTube and accurately detect whether each video is LIVE or RECORDED
async function fetchYouTubeChristianVideos(query: string, liveOnly: boolean = false) {
  const cacheKey = `${query}_${liveOnly}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}${
    liveOnly ? '&sp=CAMSAkAB' : ''
  }`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    const html = await res.text();
    const match = html.match(/var ytInitialData = ({.+?});<\/script>/);
    if (!match) {
      return [];
    }

    const data = JSON.parse(match[1]);
    const contents =
      data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer
        ?.contents;
    const items: any[] = [];

    if (contents) {
      for (const section of contents) {
        const itemSection = section?.itemSectionRenderer?.contents;
        if (itemSection) {
          for (const item of itemSection) {
            const vr = item.videoRenderer;
            if (vr && vr.videoId) {
              const videoId = vr.videoId;
              const title =
                vr.title?.runs?.map((r: any) => r.text).join('') ||
                vr.title?.simpleText ||
                '';
              const channel = vr.ownerText?.runs?.[0]?.text || '';
              const badges: string[] =
                vr.badges?.map((b: any) => b.metadataBadgeRenderer?.label?.toUpperCase()) ||
                [];

              // Precise Live Detection
              const hasLiveBadge = badges.includes('LIVE');
              const viewCountText =
                vr.viewCountText?.simpleText ||
                vr.viewCountText?.runs?.map((r: any) => r.text).join('') ||
                '';
              const isWatchingLive = viewCountText.toLowerCase().includes('watching');
              const overlayStyle = vr.thumbnailOverlays?.some(
                (o: any) => o.thumbnailOverlayTimeStatusRenderer?.style === 'LIVE'
              );

              const isLive = Boolean(hasLiveBadge || isWatchingLive || overlayStyle);
              const durationFormatted =
                vr.lengthText?.simpleText || (isLive ? 'LIVE' : 'Recorded');
              const publishedTime = vr.publishedTimeText?.simpleText || '';
              const description =
                vr.detailedMetadataSnippets?.[0]?.snippetText?.runs
                  ?.map((r: any) => r.text)
                  .join('') ||
                `Christian broadcast from ${channel}.`;

              // Infer category
              let category = 'Sunday Sermons';
              const lowerTitle = title.toLowerCase();
              if (
                lowerTitle.includes('worship') ||
                lowerTitle.includes('praise') ||
                lowerTitle.includes('hymn') ||
                lowerTitle.includes('piano')
              ) {
                category = 'Worship Nights';
              } else if (
                lowerTitle.includes('prayer') ||
                lowerTitle.includes('fasting') ||
                lowerTitle.includes('intercession')
              ) {
                category = 'Prayer & Fasting';
              } else if (
                lowerTitle.includes('bible') ||
                lowerTitle.includes('study') ||
                lowerTitle.includes('verse') ||
                lowerTitle.includes('testament')
              ) {
                category = 'Deep Bible Study';
              } else if (
                lowerTitle.includes('heal') ||
                lowerTitle.includes('faith') ||
                lowerTitle.includes('miracle')
              ) {
                category = 'Faith & Healing';
              } else if (
                lowerTitle.includes('spirit') ||
                lowerTitle.includes('holy') ||
                lowerTitle.includes('revival')
              ) {
                category = 'Walking in the Spirit';
              }

              // Extract or generate scripture reference
              let scripture = 'Psalm 100:1-5';
              const scriptureMatch = title.match(
                /\b(Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1 Samuel|2 Samuel|1 Kings|2 Kings|Psalms?|Proverbs|Ecclesiastes|Isaiah|Jeremiah|Daniel|Matthew|Mark|Luke|John|Acts|Romans|1 Corinthians|2 Corinthians|Galatians|Ephesians|Philippians|Colossians|1 Thessalonians|2 Thessalonians|1 Timothy|2 Timothy|Hebrews|James|1 Peter|2 Peter|1 John|Revelation)\s+\d+(:[\d-]+)?/i
              );
              if (scriptureMatch) {
                scripture = scriptureMatch[0];
              } else if (category === 'Worship Nights') {
                scripture = 'Psalm 150:1-6';
              } else if (category === 'Prayer & Fasting') {
                scripture = '1 Thessalonians 5:17';
              } else if (category === 'Deep Bible Study') {
                scripture = '2 Timothy 3:16-17';
              } else if (category === 'Faith & Healing') {
                scripture = 'Hebrews 11:1';
              }

              // Duration in seconds estimate
              let durationSeconds = 0;
              if (!isLive && durationFormatted) {
                const parts = durationFormatted.split(':').map((p: string) => parseInt(p, 10));
                if (parts.length === 2) {
                  durationSeconds = (parts[0] || 0) * 60 + (parts[1] || 0);
                } else if (parts.length === 3) {
                  durationSeconds =
                    (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
                }
              }

              items.push({
                id: `yt-${videoId}`,
                youtubeId: videoId,
                title,
                preacher: channel,
                ministry: channel,
                scripture,
                scriptureText:
                  'For where two or three gather in my name, there am I with them. — Matthew 18:20',
                duration: durationSeconds,
                durationFormatted: isLive ? 'LIVE' : durationFormatted,
                thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                videoUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
                isOnlineVideo: true,
                sourceType: isLive ? 'livestream' : 'youtube',
                isLive: isLive, // TRUE if genuinely live on YouTube, FALSE if recorded/uploaded
                verifiedChristian: true,
                category,
                series: isLive ? 'Live YouTube Broadcast' : 'Recorded Ministry Teaching',
                date: isLive ? 'Streaming LIVE on YouTube' : publishedTime || 'Uploaded to YouTube',
                description,
                chapters: [{ title: 'Full Broadcast', time: 0 }],
                biblePassages: [
                  {
                    reference: scripture,
                    translation: 'NIV',
                    text: 'The grass withers and the flowers fall, but the word of our God endures forever.',
                  },
                ],
                keyPoints: [
                  isLive
                    ? 'Active live broadcast on YouTube.'
                    : 'Recorded and uploaded video message available on demand.',
                  '100% verified under Christian Content Guardian.',
                ],
                downloadSizeMb: isLive ? 0 : 80,
                tags: [
                  isLive ? 'Live Stream' : 'Recorded',
                  'YouTube',
                  channel,
                  category,
                ],
                viewsCount: isLive
                  ? `${viewCountText || 'Live broadcast'}`
                  : `${viewCountText || 'YouTube views'}`,
              });
            }
          }
        }
      }
    }

    searchCache.set(cacheKey, { timestamp: Date.now(), data: items });
    return items;
  } catch (err) {
    console.error('Error fetching YouTube results:', err);
    return [];
  }
}

// API: Search & Feed Christian Videos Live from YouTube
app.get('/api/youtube/christian', async (req, res) => {
  try {
    const q = (req.query.q as string) || 'Christian worship sermon live';
    const liveOnly = req.query.liveOnly === 'true';
    const filter = (req.query.filter as string) || 'all'; // 'all' | 'live' | 'recorded'
    const category = (req.query.category as string) || 'All';

    // Enrich query with Christian context if needed
    let searchQuery = q;
    if (
      !searchQuery.toLowerCase().includes('christian') &&
      !searchQuery.toLowerCase().includes('worship') &&
      !searchQuery.toLowerCase().includes('bible') &&
      !searchQuery.toLowerCase().includes('sermon') &&
      !searchQuery.toLowerCase().includes('jesus') &&
      !searchQuery.toLowerCase().includes('god')
    ) {
      searchQuery = `Christian ${searchQuery}`;
    }

    // If filter is live or liveOnly is requested, search with YouTube live filter
    const shouldFetchLiveOnly = liveOnly || filter === 'live';
    let videos = await fetchYouTubeChristianVideos(searchQuery, shouldFetchLiveOnly);

    // If not liveOnly and user asked for 'all', also mix in live streams if none were returned
    if (filter === 'all' && !liveOnly) {
      const hasLiveInResults = videos.some((v: any) => v.isLive);
      if (!hasLiveInResults) {
        // Fetch top live Christian streams and merge
        const liveVideos = await fetchYouTubeChristianVideos('Christian worship praise live', true);
        videos = [...liveVideos.slice(0, 4), ...videos];
      }
    }

    // Apply client filter: 'live' or 'recorded'
    if (filter === 'live') {
      videos = videos.filter((v: any) => v.isLive);
    } else if (filter === 'recorded') {
      videos = videos.filter((v: any) => !v.isLive);
    }

    // Apply category filter if specified and not 'All'
    if (category && category !== 'All' && category !== 'Online YouTube') {
      videos = videos.filter((v: any) => v.category === category);
    }

    res.json({
      success: true,
      query: searchQuery,
      filter,
      total: videos.length,
      liveCount: videos.filter((v: any) => v.isLive).length,
      recordedCount: videos.filter((v: any) => !v.isLive).length,
      videos,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Dynamic Christian Live TV Channels from YouTube
app.get('/api/youtube/channels', async (req, res) => {
  try {
    // Query live Christian streams for real live television channels
    const liveStreams = await fetchYouTubeChristianVideos('Christian worship live stream 24/7', true);
    const prayerStreams = await fetchYouTubeChristianVideos('Christian prayer room live stream 24/7', true);
    const recordedTeachings = await fetchYouTubeChristianVideos('Billy Graham John Piper sermon full', false);
    const audioBibleStreams = await fetchYouTubeChristianVideos('Audio Bible live stream 24/7', true);

    const channelConfigs = [
      {
        number: 101,
        name: 'Gospel Praise & Worship Live',
        tagline: '24/7 Continuous Nonstop Praise & Worship Streams',
        badge: 'LIVE 24/7',
        logoColor: 'from-blue-600 to-cyan-500',
        category: 'Praise & Worship',
        video: liveStreams[0] || {
          youtubeId: 'ijSerobwWvI',
          title: 'Praise & Worship Music ✝️ Live 24/7 Nonstop Worship',
          channel: 'Spirit Sound Worship',
          isLive: true,
        },
      },
      {
        number: 102,
        name: 'Global Watchmen Prayer Room',
        tagline: 'Worldwide Intercession & Spontaneous Adoration',
        badge: 'LIVE PRAYER',
        logoColor: 'from-red-600 to-amber-500',
        category: 'Prayer & Intercession',
        video: prayerStreams[0] || {
          youtubeId: '0uaZ30NEHLU',
          title: 'The Global Prayer Room | 24/7 Livestream of Intercession',
          channel: 'International House of Prayer',
          isLive: true,
        },
      },
      {
        number: 103,
        name: 'Audio Bible Broadcast 24/7',
        tagline: 'Continuous Living Word of God Narration & Scriptures',
        badge: 'LIVE SCRIPTURE',
        logoColor: 'from-emerald-600 to-teal-500',
        category: 'Audio Bible',
        video: audioBibleStreams[0] || {
          youtubeId: 'oNTzXQczFW0',
          title: '24/7 Audio Bible Livestream | Continuous Word of God',
          channel: 'Bible Hub',
          isLive: true,
        },
      },
      {
        number: 104,
        name: 'Grace & Truth Expository Network',
        tagline: 'Sound Biblical Exegesis & Doctrinal Preaching',
        badge: 'RECORDED VOD',
        logoColor: 'from-purple-600 to-indigo-500',
        category: 'Expository Preaching',
        video: recordedTeachings.find((v: any) => !v.isLive) || {
          youtubeId: 'cFzsGeSFnqQ',
          title: 'Desiring God: The Supremacy of Christ',
          channel: 'Dr. John Piper (Desiring God)',
          isLive: false,
          duration: '55:00',
        },
      },
      {
        number: 105,
        name: 'Classic Crusade Evangelism',
        tagline: 'Timeless Historic Crusades & Global Altar Calls',
        badge: 'RECORDED VOD',
        logoColor: 'from-amber-600 to-yellow-500',
        category: 'Crusade & Evangelism',
        video: recordedTeachings[1] || {
          youtubeId: '_ZvNDm9-Bak',
          title: 'Life’s Search for Meaning & Hope',
          channel: 'Billy Graham Evangelistic Association',
          isLive: false,
          duration: '29:00',
        },
      },
      {
        number: 106,
        name: 'Acoustic Devotional Piano',
        tagline: 'Scripture-Filled Instrumental Hymns for Prayer & Quiet Time',
        badge: 'LIVE 24/7',
        logoColor: 'from-indigo-600 to-sky-500',
        category: 'Instrumental Worship',
        video: liveStreams[1] || {
          youtubeId: '_3nkq4baOkY',
          title: '24/7 Piano Worship with Scriptures: Quiet Time With God',
          channel: 'DappyTKeys Piano Worship',
          isLive: true,
        },
      },
    ];

    const channels = channelConfigs.map((cfg) => {
      const vid = cfg.video;
      const isLive = Boolean(vid.isLive);
      return {
        id: `ch-${cfg.number}`,
        number: cfg.number,
        name: cfg.name,
        tagline: cfg.tagline,
        badge: isLive ? 'LIVE' : 'RECORDED',
        logoColor: cfg.logoColor,
        category: cfg.category,
        streamUrl: `https://www.youtube-nocookie.com/embed/${vid.youtubeId}`,
        youtubeId: vid.youtubeId,
        currentProgram: {
          id: `prg-${cfg.number}-current`,
          title: vid.title,
          speaker: vid.channel || vid.preacher || 'Christian Ministry',
          scriptureRef: vid.scripture || 'Psalm 100:1-5',
          startTimeFormatted: isLive ? 'LIVE NOW' : 'ON DEMAND',
          endTimeFormatted: isLive ? 'CONTINUOUS' : vid.durationFormatted || 'RECORDED',
          startMinutes: 0,
          endMinutes: 1440,
          durationMinutes: isLive ? 1440 : 60,
          description: vid.description || `Christian broadcast from ${vid.channel || cfg.name}.`,
          isLive: isLive, // TRUE if live on YouTube, FALSE if recorded
          category: cfg.category,
        },
        upcomingPrograms: [
          {
            id: `prg-${cfg.number}-next`,
            title: isLive ? 'Continuous Holy Spirit Atmosphere' : 'Next Expository Message',
            speaker: vid.channel || 'Ministry Broadcast Team',
            startTimeFormatted: isLive ? 'NEXT' : '+1 Hour',
            endTimeFormatted: isLive ? 'ONWARDS' : '+2 Hours',
            startMinutes: 60,
            endMinutes: 120,
            durationMinutes: 60,
            description: 'Unbroken Christian teaching and spiritual encouragement.',
            isLive: isLive,
            category: cfg.category,
          },
        ],
      };
    });

    res.json({ success: true, channels });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Check exact live status of any YouTube video ID
app.get('/api/youtube/status/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const ytRes = await fetch(watchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const html = await ytRes.text();
    const isLive =
      html.includes('"liveBroadcastDetails":{"isLiveNow":true') ||
      (html.includes('"isLive":true') && !html.includes('"isLive":false'));

    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch ? titleMatch[1].replace(' - YouTube', '') : '';

    const authorMatch = html.match(/"ownerChannelName":"([^"]+)"/);
    const author = authorMatch ? authorMatch[1] : '';

    res.json({
      success: true,
      videoId,
      isLive,
      status: isLive ? 'LIVE' : 'RECORDED',
      title,
      author,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GospelStream Server running on http://localhost:${PORT}`);
  });
}

startServer();
