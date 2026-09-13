import { Sermon } from '../types';

export interface ChristianOnlineCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const ONLINE_CHRISTIAN_CATEGORIES: ChristianOnlineCategory[] = [
  { id: 'all', name: 'All Christian Videos', description: 'Curated 100% Christ-centered videos from YouTube', icon: 'Sparkles' },
  { id: 'livestreams', name: 'Live Worship & Streams', description: '24/7 Gospel praise and live church broadcasts', icon: 'Radio' },
  { id: 'sermons', name: 'Pulpit Sermons', description: 'Powerful preaching from renowned biblical teachers', icon: 'BookOpen' },
  { id: 'worship', name: 'Praise & Worship', description: 'Uplifting gospel and contemporary worship music', icon: 'Music' },
  { id: 'bibleproject', name: 'BibleProject Studies', description: 'Visual theology and deep book-by-book overviews', icon: 'Layers' },
  { id: 'chosen', name: 'The Chosen & Drama', description: 'Biblical cinema, gospel narratives, and church history', icon: 'Film' },
  { id: 'prayer', name: 'Prayer & Deliverance', description: 'Intercession, fasting, and spiritual breakthrough', icon: 'Flame' },
];

export const ONLINE_CHRISTIAN_VIDEOS: Sermon[] = [
  {
    id: 'yt-bp-101',
    title: 'The Story of the Bible: From Creation to the New Creation',
    preacher: 'Tim Mackie & Jon Collins',
    ministry: 'BibleProject',
    scripture: 'Genesis 1:1 - Revelation 22:21',
    scriptureText: 'All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness.',
    duration: 334,
    durationFormatted: '5:34',
    thumbnailUrl: 'https://img.youtube.com/vi/7_CGP-12AE0/hqdefault.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/7_CGP-12AE0',
    youtubeId: '7_CGP-12AE0',
    isOnlineVideo: true,
    sourceType: 'youtube',
    verifiedChristian: true,
    category: 'Deep Bible Study',
    series: 'How to Read the Bible',
    date: 'Sep 10, 2026',
    description: 'This video explores how the diverse books of the Bible fit together into one unified overarching story that leads directly to Jesus Christ.',
    chapters: [
      { title: 'The Unified Story of Scripture', time: 0 },
      { title: 'Humanity’s Fall and the Promise of the Seed', time: 105 },
      { title: 'The Covenant with Israel and the Prophets', time: 200 },
      { title: 'Jesus and the New Covenant in His Blood', time: 280 }
    ],
    biblePassages: [
      {
        reference: '2 Timothy 3:16-17',
        translation: 'NIV',
        text: 'All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness, so that the servant of God may be thoroughly equipped for every good work.'
      },
      {
        reference: 'Luke 24:27',
        translation: 'ESV',
        text: 'And beginning with Moses and all the Prophets, he interpreted to them in all the Scriptures the things concerning himself.'
      }
    ],
    keyPoints: [
      'The Bible is a magnificent library of texts telling one coherent divine story.',
      'Jesus Christ fulfills the promises made to Abraham, David, and the prophets.',
      'The climax of history is the renewal of all creation under King Jesus.'
    ],
    downloadSizeMb: 42,
    tags: ['BibleProject', 'Story of the Bible', 'Gospel', 'Scripture', 'Theology'],
    viewsCount: '4.2M views'
  },
  {
    id: 'yt-worship-201',
    title: 'Jireh | Elevation Worship & Maverick City (Live Worship)',
    preacher: 'Chandler Moore & Naomi Raine',
    ministry: 'Elevation Worship',
    scripture: 'Genesis 22:14; Philippians 4:19',
    scriptureText: 'And Abraham called the name of that place Jehovah-jireh: as it is said to this day, In the mount of the Lord it shall be seen.',
    duration: 590,
    durationFormatted: '9:50',
    thumbnailUrl: 'https://img.youtube.com/vi/mC-zw0zCCtg/hqdefault.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/mC-zw0zCCtg',
    youtubeId: 'mC-zw0zCCtg',
    isOnlineVideo: true,
    sourceType: 'youtube',
    verifiedChristian: true,
    category: 'Worship Nights',
    series: 'Old Church Basement',
    date: 'Sep 08, 2026',
    description: 'An unforgettable outpouring of gospel praise reminding every believer that God is more than enough. You will always be loved by Him.',
    chapters: [
      { title: 'I’ll Never Be More Loved Than I Am Right Now', time: 0 },
      { title: 'You Are Jireh, You Are Enough', time: 180 },
      { title: 'Content in Every Circumstance', time: 360 },
      { title: 'Outpouring of Spontaneous Praise', time: 480 }
    ],
    biblePassages: [
      {
        reference: 'Philippians 4:19',
        translation: 'KJV',
        text: 'But my God shall supply all your need according to his riches in glory by Christ Jesus.'
      },
      {
        reference: 'Matthew 6:26',
        translation: 'NIV',
        text: 'Look at the birds of the air; they do not sow or reap or store away in barns, and yet your heavenly Father feeds them. Are you not much more valuable than they?'
      }
    ],
    keyPoints: [
      'God’s provision is rooted in His unwavering love for His children.',
      'Our identity rests not in our performance, but in His finished work.',
      'He is Jehovah Jireh in plenty and in lack.'
    ],
    downloadSizeMb: 68,
    tags: ['Elevation Worship', 'Maverick City', 'Jireh', 'Praise', 'Chandler Moore'],
    viewsCount: '158M views'
  },
  {
    id: 'yt-bp-102',
    title: 'Overview: Genesis 1–11 (Creation, Sin, and the Covenant)',
    preacher: 'BibleProject Teaching Team',
    ministry: 'BibleProject',
    scripture: 'Genesis 1:1 - Genesis 11:32',
    scriptureText: 'In the beginning God created the heavens and the earth.',
    duration: 482,
    durationFormatted: '8:02',
    thumbnailUrl: 'https://img.youtube.com/vi/GQI72THyO5I/hqdefault.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/GQI72THyO5I',
    youtubeId: 'GQI72THyO5I',
    isOnlineVideo: true,
    sourceType: 'youtube',
    verifiedChristian: true,
    category: 'Deep Bible Study',
    series: 'Old Testament Overviews',
    date: 'Sep 04, 2026',
    description: 'Explore the design patterns of Genesis 1–11: God’s good creation, human rebellion, the spread of sin, and God’s promise to rescue the world through Abraham’s seed.',
    chapters: [
      { title: 'Creation and the Image of God', time: 0 },
      { title: 'The Tree of Knowledge and the Deceit of Self-Rule', time: 140 },
      { title: 'Cain, Noah, and the Flood', time: 270 },
      { title: 'The Tower of Babel and the Call of Abraham', time: 390 }
    ],
    biblePassages: [
      {
        reference: 'Genesis 1:27',
        translation: 'ESV',
        text: 'So God created man in his own image, in the image of God he created him; male and female he created them.'
      },
      {
        reference: 'Genesis 3:15',
        translation: 'NIV',
        text: 'And I will put enmity between you and the woman, and between your offspring and hers; he will crush your head, and you will strike his heel.'
      }
    ],
    keyPoints: [
      'God gives humans dignity by making them His royal representatives.',
      'Sin is defining good and evil on our own terms rather than trusting God.',
      'God responds to brokenness with the covenant promise of redemption.'
    ],
    downloadSizeMb: 52,
    tags: ['BibleProject', 'Genesis', 'Creation', 'Old Testament', 'Exegesis'],
    viewsCount: '5.8M views'
  },
  {
    id: 'yt-bp-103',
    title: 'Overview: Romans Part 1 (The Righteousness of God Revealed)',
    preacher: 'BibleProject Teaching Team',
    ministry: 'BibleProject',
    scripture: 'Romans 1:1 - Romans 8:39',
    scriptureText: 'For I am not ashamed of the gospel, because it is the power of God that brings salvation to everyone who believes.',
    duration: 550,
    durationFormatted: '9:10',
    thumbnailUrl: 'https://img.youtube.com/vi/0SVTl4Xa5fY/hqdefault.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/0SVTl4Xa5fY',
    youtubeId: '0SVTl4Xa5fY',
    isOnlineVideo: true,
    sourceType: 'youtube',
    verifiedChristian: true,
    category: 'Deep Bible Study',
    series: 'New Testament Overviews',
    date: 'Aug 28, 2026',
    description: 'Paul’s masterpiece letter explained: all humanity is trapped in sin, but through Jesus Christ’s sacrificial death and resurrection, God justifies everyone who has faith.',
    chapters: [
      { title: 'Paul’s Thesis: The Power of the Gospel', time: 0 },
      { title: 'All Humanity Trapped in Rebellion', time: 130 },
      { title: 'Justified Freely by His Grace Through Faith', time: 270 },
      { title: 'Life in the Spirit and Romans 8 Victory', time: 420 }
    ],
    biblePassages: [
      {
        reference: 'Romans 1:16-17',
        translation: 'NIV',
        text: 'For I am not ashamed of the gospel, because it is the power of God that brings salvation to everyone who believes... For in the gospel the righteousness of God is revealed—a righteousness that is by faith from first to last.'
      },
      {
        reference: 'Romans 8:1',
        translation: 'ESV',
        text: 'There is therefore now no condemnation for those who are in Christ Jesus.'
      }
    ],
    keyPoints: [
      'No one can be saved by moral effort or law; righteousness is a gift through faith in Christ.',
      'Believers are united with Christ in His death and raised to new spiritual life.',
      'Nothing can separate the believer from the love of God that is in Christ Jesus our Lord.'
    ],
    downloadSizeMb: 58,
    tags: ['BibleProject', 'Romans', 'Apostle Paul', 'Justification', 'Salvation'],
    viewsCount: '4.9M views'
  },
  {
    id: 'yt-bp-104',
    title: 'The Holy Spirit (Ruakh): God’s Breath & Transforming Power',
    preacher: 'Tim Mackie',
    ministry: 'BibleProject',
    scripture: 'Ezekiel 36:26-27; Acts 2:1-4',
    scriptureText: 'I will give you a new heart and put a new spirit in you; I will remove from you your heart of stone and give you a heart of flesh.',
    duration: 250,
    durationFormatted: '4:10',
    thumbnailUrl: 'https://img.youtube.com/vi/oNNZO9i1Gjc/hqdefault.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/oNNZO9i1Gjc',
    youtubeId: 'oNNZO9i1Gjc',
    isOnlineVideo: true,
    sourceType: 'youtube',
    verifiedChristian: true,
    category: 'Walking in the Spirit',
    series: 'Biblical Word Studies',
    date: 'Aug 20, 2026',
    description: 'Discover the meaning of the Hebrew word "Ruakh" (breath, wind, spirit) and how God’s Spirit breathes vitality into creation and regenerates human hearts.',
    chapters: [
      { title: 'Ruakh: The Invisible Energy of God', time: 0 },
      { title: 'The Spirit Anointing Prophets, Priests, and Kings', time: 80 },
      { title: 'The New Heart Promised by the Prophets', time: 150 },
      { title: 'Pentecost and the Indwelling Spirit in Believers', time: 210 }
    ],
    biblePassages: [
      {
        reference: 'John 14:26',
        translation: 'ESV',
        text: 'But the Helper, the Holy Spirit, whom the Father will send in my name, he will teach you all things and bring to your remembrance all that I have said to you.'
      },
      {
        reference: 'Galatians 5:22-23',
        translation: 'NIV',
        text: 'But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.'
      }
    ],
    keyPoints: [
      'The Holy Spirit is God’s personal empowering presence in the world.',
      'Jesus gives the Holy Spirit to transform our desires from the inside out.',
      'The Spirit empowers the Church to share the love of Christ with the world.'
    ],
    downloadSizeMb: 35,
    tags: ['BibleProject', 'Holy Spirit', 'Ruakh', 'Pentecost', 'Christian Life'],
    viewsCount: '3.1M views'
  },
  {
    id: 'yt-billy-graham-301',
    title: 'The Value of a Soul: Who Is Jesus to You?',
    preacher: 'Dr. Billy Graham',
    ministry: 'Billy Graham Evangelistic Association',
    scripture: 'Mark 8:36-37',
    scriptureText: 'For what shall it profit a man, if he shall gain the whole world, and lose his own soul? Or what shall a man give in exchange for his soul?',
    duration: 1680,
    durationFormatted: '28:00',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://www.youtube-nocookie.com/embed/7_CGP-12AE0',
    youtubeId: '7_CGP-12AE0',
    isOnlineVideo: true,
    sourceType: 'youtube',
    verifiedChristian: true,
    category: 'Sunday Sermons',
    series: 'Classic Crusade Messages',
    date: 'Aug 14, 2026',
    description: 'The world-renowned crusade message preached to tens of thousands on the infinite eternal worth of the human soul and the call to repentance through Christ Jesus.',
    chapters: [
      { title: 'The Question of the Ages', time: 0 },
      { title: 'The Deception of Worldly Riches', time: 420 },
      { title: 'The Price Paid on Calvary’s Cross', time: 900 },
      { title: 'The Decision: Just As I Am', time: 1400 }
    ],
    biblePassages: [
      {
        reference: 'Mark 8:36',
        translation: 'KJV',
        text: 'For what shall it profit a man, if he shall gain the whole world, and lose his own soul?'
      },
      {
        reference: 'John 3:16',
        translation: 'KJV',
        text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.'
      }
    ],
    keyPoints: [
      'Your soul is of infinite worth because it is made in the image of God and will live forever.',
      'No amount of earthly wealth, fame, or pleasure can purchase forgiveness of sins.',
      'Jesus Christ laid down His sinless life so that whoever turns to Him may have everlasting life.'
    ],
    downloadSizeMb: 110,
    tags: ['Billy Graham', 'Crusade', 'Evangelism', 'Salvation', 'Repentance'],
    viewsCount: '12M views'
  },
  {
    id: 'yt-tim-keller-401',
    title: 'The Prodigal God: Grace Unbounded for Sinners & Moralists',
    preacher: 'Rev. Timothy Keller',
    ministry: 'Gospel in Life',
    scripture: 'Luke 15:11-32',
    scriptureText: 'For this son of mine was dead and is alive again; he was lost and is found. So they began to celebrate.',
    duration: 2150,
    durationFormatted: '35:50',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://www.youtube-nocookie.com/embed/0SVTl4Xa5fY',
    youtubeId: '0SVTl4Xa5fY',
    isOnlineVideo: true,
    sourceType: 'youtube',
    verifiedChristian: true,
    category: 'Sunday Sermons',
    series: 'The Radical Grace of Jesus',
    date: 'Aug 07, 2026',
    description: 'Dr. Tim Keller unveils the heart of Jesus’ famous parable: the Father’s lavish grace reaches both the wayward younger brother and the bitter religious elder brother.',
    chapters: [
      { title: 'Two Ways of Escaping God', time: 0 },
      { title: 'The Younger Brother in the Far Country', time: 540 },
      { title: 'The Elder Brother’s Deadly Self-Righteousness', time: 1200 },
      { title: 'The True Elder Brother Who Paid Our Debt', time: 1800 }
    ],
    biblePassages: [
      {
        reference: 'Luke 15:20',
        translation: 'NIV',
        text: 'But while he was still a long way off, his father saw him and was filled with compassion for him; he ran to his son, threw his arms around him and kissed him.'
      },
      {
        reference: 'Ephesians 2:8-9',
        translation: 'ESV',
        text: 'For by grace you have been saved through faith. And this is not your own doing; it is the gift of God, not a result of works, so that no one may boast.'
      }
    ],
    keyPoints: [
      'The gospel is neither religion nor irreligion; it is the radical grace of Jesus.',
      'You can be running away from God while keeping all the moral rules.',
      'Jesus is the True Elder Brother who came into the far country to bring us home at the cost of His life.'
    ],
    downloadSizeMb: 140,
    tags: ['Tim Keller', 'Gospel in Life', 'Grace', 'Prodigal Son', 'Redeemer'],
    viewsCount: '2.8M views'
  },
  {
    id: 'yt-chosen-501',
    title: 'The Chosen: "I Have Called You By Name" (Mary Magdalene Encounter)',
    preacher: 'Dallas Jenkins & Cast',
    ministry: 'The Chosen Ministry',
    scripture: 'Isaiah 43:1; Luke 8:2',
    scriptureText: 'Fear not: for I have redeemed thee, I have called thee by thy name; thou art mine.',
    duration: 3200,
    durationFormatted: '53:20',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://www.youtube-nocookie.com/embed/7_CGP-12AE0',
    youtubeId: '7_CGP-12AE0',
    isOnlineVideo: true,
    sourceType: 'youtube',
    verifiedChristian: true,
    category: 'Documentaries',
    series: 'The Chosen Series',
    date: 'Jul 30, 2026',
    description: 'The transformative first episode of The Chosen portraying how Jesus meets Mary Magdalene in her deepest brokenness and calls her into light and salvation.',
    chapters: [
      { title: 'The Shadows in Capernaum', time: 0 },
      { title: 'Simon and Andrew’s Struggle at the Sea', time: 700 },
      { title: 'Nicodemus and the Demoniac', time: 1600 },
      { title: 'Jesus Calls Mary: "I Have Redeemed Thee"', time: 2600 }
    ],
    biblePassages: [
      {
        reference: 'Isaiah 43:1',
        translation: 'KJV',
        text: 'But now thus saith the Lord that created thee, O Jacob, and he that formed thee, O Israel, Fear not: for I have redeemed thee, I have called thee by thy name; thou art mine.'
      },
      {
        reference: 'Luke 8:2',
        translation: 'NIV',
        text: 'And also some women who had been cured of evil spirits and diseases: Mary (called Magdalene) from whom seven demons had come out.'
      }
    ],
    keyPoints: [
      'Jesus sees the broken, the outcast, and the tormented with divine compassion.',
      'No one is too far gone for the redeeming touch of the Messiah.',
      'When Jesus speaks your name, old things pass away and all things become new.'
    ],
    downloadSizeMb: 185,
    tags: ['The Chosen', 'Jesus', 'Gospels', 'Christian Cinema', 'Mary Magdalene'],
    viewsCount: '55M views'
  },
  {
    id: 'yt-tony-evans-601',
    title: 'Kingdom Authority: Walking in Spiritual Victory Over Darkness',
    preacher: 'Dr. Tony Evans',
    ministry: 'The Urban Alternative',
    scripture: 'Ephesians 6:10-18; Matthew 16:19',
    scriptureText: 'Finally, be strong in the Lord and in his mighty power. Put on the full armor of God, so that you can take your stand against the devil’s schemes.',
    duration: 2280,
    durationFormatted: '38:00',
    thumbnailUrl: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://www.youtube-nocookie.com/embed/0SVTl4Xa5fY',
    youtubeId: '0SVTl4Xa5fY',
    isOnlineVideo: true,
    sourceType: 'youtube',
    verifiedChristian: true,
    category: 'Walking in the Spirit',
    series: 'Kingdom Agenda',
    date: 'Jul 22, 2026',
    description: 'Dr. Tony Evans teaches how believers can access God’s heavenly authority to overcome spiritual warfare, break generational strongholds, and walk in kingdom victory.',
    chapters: [
      { title: 'Understanding the Invisible War', time: 0 },
      { title: 'The Belt of Truth and Breastplate of Righteousness', time: 600 },
      { title: 'The Shield of Faith Extinguishing Fiery Darts', time: 1300 },
      { title: 'Praying in the Spirit at All Times', time: 1900 }
    ],
    biblePassages: [
      {
        reference: 'Ephesians 6:11-12',
        translation: 'NIV',
        text: 'Put on the full armor of God, so that you can take your stand against the devil’s schemes. For our struggle is not against flesh and blood, but against the rulers, against the authorities, against the powers of this dark world and against the spiritual forces of evil in the heavenly realms.'
      },
      {
        reference: 'James 4:7',
        translation: 'ESV',
        text: 'Submit yourselves therefore to God. Resist the devil, and he will flee from you.'
      }
    ],
    keyPoints: [
      'Physical problems often have spiritual roots; kingdom believers must fight spiritually.',
      'God’s Word and continuous prayer in the Spirit are unbeatable weapons.',
      'Victory is not something we fight for, but fight from—because of Christ’s resurrection.'
    ],
    downloadSizeMb: 135,
    tags: ['Tony Evans', 'Kingdom Authority', 'Spiritual Warfare', 'Armor of God'],
    viewsCount: '1.9M views'
  },
  {
    id: 'yt-francis-chan-701',
    title: 'Crazy Love: When You’re in Love with God, Everything Changes',
    preacher: 'Francis Chan',
    ministry: 'Crazy Love Ministries',
    scripture: 'Revelation 3:15-16; Matthew 22:37-38',
    scriptureText: 'I know your deeds, that you are neither cold nor hot. I wish you were either one or the other! So, because you are lukewarm—neither hot nor cold—I am about to spit you out of my mouth.',
    duration: 2100,
    durationFormatted: '35:00',
    thumbnailUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://www.youtube-nocookie.com/embed/7_CGP-12AE0',
    youtubeId: '7_CGP-12AE0',
    isOnlineVideo: true,
    sourceType: 'youtube',
    verifiedChristian: true,
    category: 'Sunday Sermons',
    series: 'Radical Discipleship',
    date: 'Jul 15, 2026',
    description: 'An urgent challenge to shake off lukewarm Christianity and fall madly in love with the God of the universe who gave His only Son for us.',
    chapters: [
      { title: 'The Staggering Awe of God', time: 0 },
      { title: 'The Danger of Lukewarm Religion', time: 480 },
      { title: 'Surrendering Ambition for the Gospel', time: 1150 },
      { title: 'Living in Radical Obedience Today', time: 1700 }
    ],
    biblePassages: [
      {
        reference: 'Matthew 22:37-38',
        translation: 'NIV',
        text: 'Jesus replied: "‘Love the Lord your God with all your heart and with all your soul and with all your mind.’ This is the first and greatest commandment."'
      },
      {
        reference: '1 John 4:19',
        translation: 'ESV',
        text: 'We love because he first loved us.'
      }
    ],
    keyPoints: [
      'God does not desire casual religious checklist adherence; He desires all our heart.',
      'When you see God as He truly is in majesty and holiness, surrendering your life is natural.',
      'True faith produces radical generosity and sacrificial love for neighbors.'
    ],
    downloadSizeMb: 120,
    tags: ['Francis Chan', 'Crazy Love', 'Discipleship', 'Holy Spirit', 'Awe of God'],
    viewsCount: '3.4M views'
  },
  {
    id: 'yt-livestream-801',
    title: '24/7 Global Gospel Worship & Holy Sanctuary Prayer Stream',
    preacher: 'International Christian Fellowship',
    ministry: 'GospelStream 24/7 Sanctuary',
    scripture: 'Psalm 100:1-5; 1 Thessalonians 5:16-18',
    scriptureText: 'Rejoice always, pray continually, give thanks in all circumstances; for this is God’s will for you in Christ Jesus.',
    duration: 0,
    durationFormatted: 'LIVE 24/7',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://www.youtube-nocookie.com/embed/mC-zw0zCCtg',
    youtubeId: 'mC-zw0zCCtg',
    isOnlineVideo: true,
    sourceType: 'livestream',
    verifiedChristian: true,
    category: 'Worship Nights',
    series: 'Continuous Prayer Room',
    date: 'Streaming LIVE',
    description: 'Continuous uninterrupted Christian praise, acoustic hymns, scriptural meditations, and worldwide intercession streaming non-stop around the clock.',
    chapters: [
      { title: 'Continuous Worship & Scriptural Meditation', time: 0 },
      { title: 'Intercessory Prayer for the Nations', time: 3600 }
    ],
    biblePassages: [
      {
        reference: 'Psalm 100:4',
        translation: 'KJV',
        text: 'Enter into his gates with thanksgiving, and into his courts with praise: be thankful unto him, and bless his name.'
      }
    ],
    keyPoints: [
      'Unbroken praise aligns the atmosphere of homes and workplaces with heaven.',
      'Scripture-saturated music calms anxiety and focuses the mind on God’s promises.'
    ],
    downloadSizeMb: 0,
    tags: ['Live', '24/7 Worship', 'Continuous Prayer', 'Sanctuary', 'Praise'],
    viewsCount: '89K watching now'
  },
  {
    id: 'yt-spirit-sound-live-247',
    title: 'Praise & Worship Music ✝️ Live 24/7 Continuous Nonstop Praise & Worship',
    preacher: 'Spirit Sound Worship',
    ministry: 'Spirit Sound Worship',
    scripture: 'Psalm 150:1-6; John 4:23-24',
    scriptureText: 'Let everything that has breath praise the Lord. Praise the Lord.',
    duration: 0,
    durationFormatted: 'LIVE 24/7',
    thumbnailUrl: 'https://img.youtube.com/vi/ijSerobwWvI/hqdefault.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/ijSerobwWvI',
    youtubeId: 'ijSerobwWvI',
    isOnlineVideo: true,
    sourceType: 'livestream',
    verifiedChristian: true,
    category: 'Worship Nights',
    series: '24/7 Praise Atmosphere',
    date: 'Streaming LIVE',
    description: 'Continuous 24/7 praise and worship songs with on-screen lyrics. Anointed worship designed for personal devotions, family prayer, and work atmosphere.',
    chapters: [
      { title: 'Continuous 24/7 Praise & Adoration', time: 0 },
      { title: 'Scriptural Meditations & Peaceful Hymns', time: 3600 }
    ],
    biblePassages: [
      {
        reference: 'Psalm 150:6',
        translation: 'NIV',
        text: 'Let everything that has breath praise the Lord. Praise the Lord.'
      }
    ],
    keyPoints: [
      'True worshippers worship the Father in spirit and in truth.',
      'Unbroken praise invites God’s peace into every season of life.'
    ],
    downloadSizeMb: 0,
    tags: ['Live', '24/7 Worship', 'Spirit Sound', 'Nonstop Praise', 'Lyrics'],
    viewsCount: '45K watching now'
  },
  {
    id: 'yt-don-moen-live',
    title: '🔴 24/7 Worship Music Live ✝️ Praise & Worship Songs with Lyrics',
    preacher: 'Don Moen',
    ministry: 'Don Moen Ministries',
    scripture: 'Psalm 34:1; Isaiah 43:19',
    scriptureText: 'I will bless the Lord at all times: his praise shall continually be in my mouth.',
    duration: 0,
    durationFormatted: 'LIVE 24/7',
    thumbnailUrl: 'https://img.youtube.com/vi/lO5Nn_uqjr8/hqdefault.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/lO5Nn_uqjr8',
    youtubeId: 'lO5Nn_uqjr8',
    isOnlineVideo: true,
    sourceType: 'livestream',
    verifiedChristian: true,
    category: 'Worship Nights',
    series: 'God Will Make a Way Live',
    date: 'Streaming LIVE',
    description: 'Beloved Christian worship leader Don Moen leads non-stop praise, timeless hymns, and heartfelt prayer songs streaming continuously worldwide.',
    chapters: [
      { title: 'Praise & Thanksgiving Live', time: 0 },
      { title: 'Healing Hymns & Quiet Waters', time: 3600 }
    ],
    biblePassages: [
      {
        reference: 'Psalm 34:1',
        translation: 'KJV',
        text: 'I will bless the Lord at all times: his praise shall continually be in my mouth.'
      }
    ],
    keyPoints: [
      'God will make a way when there seems to be no way.',
      'Peace that transcends all human understanding guards our hearts in Christ.'
    ],
    downloadSizeMb: 0,
    tags: ['Don Moen', 'Live 24/7', 'Hymns', 'Praise & Worship', 'Classic Christian'],
    viewsCount: '112K watching now'
  },
  {
    id: 'yt-ihopkc-prayer-room',
    title: 'The Global Prayer Room | 24/7 Livestream of Intercession and Worship',
    preacher: 'IHOPKC Worship Teams',
    ministry: 'International House of Prayer',
    scripture: 'Isaiah 62:6-7; Luke 18:7-8',
    scriptureText: 'I have posted watchmen on your walls, Jerusalem; they will never be silent day or night.',
    duration: 0,
    durationFormatted: 'LIVE 24/7',
    thumbnailUrl: 'https://img.youtube.com/vi/0uaZ30NEHLU/hqdefault.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/0uaZ30NEHLU',
    youtubeId: '0uaZ30NEHLU',
    isOnlineVideo: true,
    sourceType: 'livestream',
    verifiedChristian: true,
    category: 'Prayer & Fasting',
    series: 'Global Watchmen',
    date: 'Streaming LIVE',
    description: 'Live 24 hours a day, 7 days a week unbroken intercession and responsive biblical worship uniting believers across the globe in prayer for revival.',
    chapters: [
      { title: 'Perpetual Intercession & Harp and Bowl Worship', time: 0 },
      { title: 'Prayers for the Global Body of Christ', time: 7200 }
    ],
    biblePassages: [
      {
        reference: 'Isaiah 62:6',
        translation: 'NIV',
        text: 'I have posted watchmen on your walls, Jerusalem; they will never be silent day or night. You who call on the Lord, give yourselves no rest.'
      }
    ],
    keyPoints: [
      'Day and night prayer fuels spiritual breakthrough and missionary mobilization.',
      'Joining in live worldwide prayer builds unity across the global Church.'
    ],
    downloadSizeMb: 0,
    tags: ['Prayer', '24/7 Live', 'IHOPKC', 'Intercession', 'Revival'],
    viewsCount: '38K watching now'
  },
  {
    id: 'yt-dappytkeys-piano',
    title: '24/7 Piano Worship with Scriptures: Quiet Time With God',
    preacher: 'DappyTKeys',
    ministry: 'DappyTKeys Piano Worship',
    scripture: 'Psalm 23:1-3; Matthew 11:28',
    scriptureText: 'He leads me beside quiet waters, he refreshes my soul.',
    duration: 0,
    durationFormatted: 'LIVE 24/7',
    thumbnailUrl: 'https://img.youtube.com/vi/_3nkq4baOkY/hqdefault.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/_3nkq4baOkY',
    youtubeId: '_3nkq4baOkY',
    isOnlineVideo: true,
    sourceType: 'livestream',
    verifiedChristian: true,
    category: 'Prayer & Fasting',
    series: 'Quiet Time Devotionals',
    date: 'Streaming LIVE',
    description: 'Peaceful acoustic piano hymns, ambient gospel melodies, and calming Bible verses for study, prayer, sleep, and meditation in God’s presence.',
    chapters: [
      { title: 'Quiet Reflection & Rest in Jesus', time: 0 }
    ],
    biblePassages: [
      {
        reference: 'Matthew 11:28',
        translation: 'ESV',
        text: 'Come to me, all who labor and are heavy laden, and I will give you rest.'
      }
    ],
    keyPoints: [
      'Silence and solitude before God allow the soul to hear the whisper of the Holy Spirit.',
      'Scripture displayed alongside peaceful music brings mental serenity and biblical hope.'
    ],
    downloadSizeMb: 0,
    tags: ['Piano Worship', 'Instrumental', 'Quiet Time', 'Peaceful', '24/7'],
    viewsCount: '72K watching now'
  },
  {
    id: 'yt-worshipmob-soak',
    title: '10 Hours of Original WorshipMob Worship: Soak With Us in the Secret Place',
    preacher: 'WorshipMob Collective',
    ministry: 'WorshipMob',
    scripture: 'Psalm 91:1-2; John 15:4',
    scriptureText: 'Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty.',
    duration: 36000,
    durationFormatted: '10:00:00',
    thumbnailUrl: 'https://img.youtube.com/vi/c6ijAOeaB5E/hqdefault.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/c6ijAOeaB5E',
    youtubeId: 'c6ijAOeaB5E',
    isOnlineVideo: true,
    sourceType: 'youtube',
    verifiedChristian: true,
    category: 'Worship Nights',
    series: 'Deep Soaking Sessions',
    date: 'Sep 02, 2026',
    description: 'A continuous ten-hour compilation of spontaneous worship, prophetic prayer, and intimate devotion filmed live in Colorado Springs.',
    chapters: [
      { title: 'Intimate Adoration & Laying Down Burdens', time: 0 },
      { title: 'Prophetic Singing Over Families', time: 7200 },
      { title: 'Deep Peace in the Father’s Arms', time: 18000 }
    ],
    biblePassages: [
      {
        reference: 'Psalm 91:1',
        translation: 'NIV',
        text: 'Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty.'
      }
    ],
    keyPoints: [
      'Entering God’s rest transforms worry into steadfast praise.',
      'Communal worship fosters an atmosphere where lives are healed and restored.'
    ],
    downloadSizeMb: 500,
    tags: ['WorshipMob', 'Soaking Worship', 'Extended Praise', 'Prayer Atmosphere'],
    viewsCount: '2.3M views'
  },
  {
    id: 'yt-elevation-blessing-live',
    title: 'The Blessing with Kari Jobe & Cody Carnes | Live From Elevation Ballantyne',
    preacher: 'Kari Jobe, Cody Carnes, Elevation Worship',
    ministry: 'Elevation Worship',
    scripture: 'Numbers 6:24-26; Exodus 33:14',
    scriptureText: 'The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you.',
    duration: 752,
    durationFormatted: '12:32',
    thumbnailUrl: 'https://img.youtube.com/vi/Zp6aygmvzM4/hqdefault.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/Zp6aygmvzM4',
    youtubeId: 'Zp6aygmvzM4',
    isOnlineVideo: true,
    sourceType: 'youtube',
    verifiedChristian: true,
    category: 'Worship Nights',
    series: 'Graves Into Gardens',
    date: 'Aug 25, 2026',
    description: 'Recorded live just days before global quarantine, this historic Aaronic blessing song swept across every continent, declaring God’s favor upon thousands of generations.',
    chapters: [
      { title: 'The Lord Bless You and Keep You', time: 0 },
      { title: 'Amen Chorus Outpouring', time: 240 },
      { title: 'May His Favor Be Upon You', time: 420 },
      { title: 'In the Morning, in the Evening', time: 600 }
    ],
    biblePassages: [
      {
        reference: 'Numbers 6:24-26',
        translation: 'NIV',
        text: 'The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you; the Lord turn his face toward you and give you peace.'
      }
    ],
    keyPoints: [
      'God’s covenant blessings extend to you and your children and their children.',
      'His presence goes before you, behind you, beside you, and within you.'
    ],
    downloadSizeMb: 85,
    tags: ['The Blessing', 'Kari Jobe', 'Cody Carnes', 'Elevation Worship', 'Numbers 6'],
    viewsCount: '104M views'
  },
  {
    id: 'yt-cece-winans-goodness',
    title: 'CeCe Winans - Goodness of God (Live Official Video)',
    preacher: 'CeCe Winans',
    ministry: 'CeCe Winans Ministries',
    scripture: 'Psalm 23:6; Lamentations 3:22-23',
    scriptureText: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the Lord for ever.',
    duration: 300,
    durationFormatted: '5:00',
    thumbnailUrl: 'https://img.youtube.com/vi/9sE5kEnitqE/hqdefault.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/9sE5kEnitqE',
    youtubeId: '9sE5kEnitqE',
    isOnlineVideo: true,
    sourceType: 'youtube',
    verifiedChristian: true,
    category: 'Worship Nights',
    series: 'Believe For It',
    date: 'Aug 18, 2026',
    description: 'Gospel music legend CeCe Winans delivers an unforgettable, spirit-stirring tribute to the everlasting goodness and faithfulness of our Lord.',
    chapters: [
      { title: 'I Love You Lord, for Your Mercy Never Fails Me', time: 0 },
      { title: 'All My Life You Have Been Faithful', time: 90 },
      { title: 'Your Goodness Is Running After Me', time: 180 }
    ],
    biblePassages: [
      {
        reference: 'Psalm 23:6',
        translation: 'KJV',
        text: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the Lord for ever.'
      }
    ],
    keyPoints: [
      'From the moment I wake up until I lay my head, I will sing of the goodness of God.',
      'Every breath we take is a gift of His sustaining grace.'
    ],
    downloadSizeMb: 50,
    tags: ['CeCe Winans', 'Goodness of God', 'Gospel', 'Live Worship', 'Praise'],
    viewsCount: '98M views'
  },
  {
    id: 'yt-phil-wickham-battle',
    title: 'Phil Wickham - Battle Belongs (Live & Official Praise Video)',
    preacher: 'Phil Wickham',
    ministry: 'Phil Wickham Ministries',
    scripture: '2 Chronicles 20:15; Exodus 14:14',
    scriptureText: 'Do not be afraid or discouraged because of this vast army. For the battle is not yours, but God’s.',
    duration: 290,
    durationFormatted: '4:50',
    thumbnailUrl: 'https://img.youtube.com/vi/qtvQNzPHn-w/hqdefault.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/qtvQNzPHn-w',
    youtubeId: 'qtvQNzPHn-w',
    isOnlineVideo: true,
    sourceType: 'youtube',
    verifiedChristian: true,
    category: 'Worship Nights',
    series: 'Hymn of Heaven',
    date: 'Aug 11, 2026',
    description: 'An anthem of victorious faith reminding believers that when we lift our hands in praise, Almighty God fights our battles on our behalf.',
    chapters: [
      { title: 'When All I See Is the Battle', time: 0 },
      { title: 'So When I Fight, I’ll Fight on My Knees', time: 70 },
      { title: 'An Almighty Fortress You Go Before Us', time: 160 }
    ],
    biblePassages: [
      {
        reference: '2 Chronicles 20:15',
        translation: 'NIV',
        text: 'This is what the Lord says to you: ‘Do not be afraid or discouraged because of this vast army. For the battle is not yours, but God’s.’'
      }
    ],
    keyPoints: [
      'Praise is a spiritual weapon that disarms the enemy.',
      'The battle is won on our knees in surrender before God.'
    ],
    downloadSizeMb: 48,
    tags: ['Phil Wickham', 'Battle Belongs', 'Victory', 'Christian Praise', 'Faith'],
    viewsCount: '62M views'
  },
  {
    id: 'yt-piper-desiring-god-1',
    title: 'Desiring God (Part 1): The Biblical Vision for Christian Hedonism',
    preacher: 'Dr. John Piper',
    ministry: 'Desiring God',
    scripture: 'Psalm 16:11; Psalm 37:4',
    scriptureText: 'You make known to me the path of life; you will fill me with joy in your presence, with eternal pleasures at your right hand.',
    duration: 3300,
    durationFormatted: '55:00',
    thumbnailUrl: 'https://img.youtube.com/vi/cFzsGeSFnqQ/hqdefault.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/cFzsGeSFnqQ',
    youtubeId: 'cFzsGeSFnqQ',
    isOnlineVideo: true,
    sourceType: 'youtube',
    verifiedChristian: true,
    category: 'Sunday Sermons',
    series: 'Desiring God Classic Sermons',
    date: 'Aug 04, 2026',
    description: 'Dr. John Piper unpacks the foundational thesis that God is most glorified in us when we are most satisfied in Him. True faith is delighting in the supremacy of Christ.',
    chapters: [
      { title: 'The Chief End of Man', time: 0 },
      { title: 'Delight Yourself in the Lord', time: 900 },
      { title: 'Why Duty Alone Falls Short of Worship', time: 1800 },
      { title: 'Fullness of Joy in His Presence', time: 2700 }
    ],
    biblePassages: [
      {
        reference: 'Psalm 16:11',
        translation: 'ESV',
        text: 'You make known to me the path of life; in your presence there is fullness of joy; at your right hand are pleasures forevermore.'
      }
    ],
    keyPoints: [
      'Seeking pleasure in God is not a sin; it is our highest Christian duty and joy.',
      'God is honored when His children find their deepest satisfaction in His character.'
    ],
    downloadSizeMb: 180,
    tags: ['John Piper', 'Desiring God', 'Expository Preaching', 'Joy in God', 'Theology'],
    viewsCount: '1.4M views'
  },
  {
    id: 'yt-piper-spirits-sink',
    title: 'What to Do When Your Spirits Sink: Hope for the Downcast Soul',
    preacher: 'Dr. John Piper',
    ministry: 'Desiring God',
    scripture: 'Psalm 42:5-11; Psalm 43:5',
    scriptureText: 'Why, my soul, are you downcast? Why so disturbed within me? Put your hope in God, for I will yet praise him, my Savior and my God.',
    duration: 2700,
    durationFormatted: '45:00',
    thumbnailUrl: 'https://img.youtube.com/vi/W6NjAG4qp4M/hqdefault.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/W6NjAG4qp4M',
    youtubeId: 'W6NjAG4qp4M',
    isOnlineVideo: true,
    sourceType: 'youtube',
    verifiedChristian: true,
    category: 'Faith & Healing',
    series: 'Psalms of Deliverance',
    date: 'Jul 28, 2026',
    description: 'Practical, compassionate biblical counsel on preaching truth to your own heart during seasons of grief, sorrow, and darkness.',
    chapters: [
      { title: 'The Reality of Spiritual Depression', time: 0 },
      { title: 'Preaching Truth to Your Own Soul', time: 800 },
      { title: 'Waiting on the Lord in the Dark', time: 1700 },
      { title: 'My Savior and My God', time: 2300 }
    ],
    biblePassages: [
      {
        reference: 'Psalm 42:11',
        translation: 'NIV',
        text: 'Why, my soul, are you downcast? Why so disturbed within me? Put your hope in God, for I will yet praise him, my Savior and my God.'
      }
    ],
    keyPoints: [
      'Do not just listen to yourself; speak God’s Word to yourself.',
      'Dark seasons do not mean God has abandoned you; His steadfast love holds you.'
    ],
    downloadSizeMb: 140,
    tags: ['John Piper', 'Depression', 'Psalm 42', 'Hope in God', 'Healing'],
    viewsCount: '890K views'
  },
  {
    id: 'yt-billy-graham-holyspirit',
    title: 'The Holy Spirit and You | Classic Crusade Sermon',
    preacher: 'Dr. Billy Graham',
    ministry: 'Billy Graham Evangelistic Association',
    scripture: 'John 14:16-17; Galatians 5:22-25',
    scriptureText: 'And I will ask the Father, and he will give you another advocate to help you and be with you forever—the Spirit of truth.',
    duration: 1860,
    durationFormatted: '31:00',
    thumbnailUrl: 'https://img.youtube.com/vi/zbKXkpiLcfk/hqdefault.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/zbKXkpiLcfk',
    youtubeId: 'zbKXkpiLcfk',
    isOnlineVideo: true,
    sourceType: 'youtube',
    verifiedChristian: true,
    category: 'Walking in the Spirit',
    series: 'Classic Crusade Sermons',
    date: 'Jul 20, 2026',
    description: 'Dr. Billy Graham expounds on the personality, indwelling presence, and empowering baptism of the Holy Spirit for daily Christian victory.',
    chapters: [
      { title: 'Who Is the Holy Spirit?', time: 0 },
      { title: 'The Convicting Power of the Spirit', time: 450 },
      { title: 'Living the Spirit-Filled Victorious Life', time: 1100 },
      { title: 'Crusade Invitation and Prayer', time: 1600 }
    ],
    biblePassages: [
      {
        reference: 'John 14:16-17',
        translation: 'NIV',
        text: 'And I will ask the Father, and he will give you another advocate to help you and be with you forever—the Spirit of truth.'
      }
    ],
    keyPoints: [
      'The Holy Spirit is not an impersonal force, but God living inside believers.',
      'He produces love, joy, peace, and spiritual power to witness.'
    ],
    downloadSizeMb: 105,
    tags: ['Billy Graham', 'Holy Spirit', 'Classic Crusade', 'Evangelism', 'Spiritual Life'],
    viewsCount: '4.7M views'
  },
  {
    id: 'yt-billy-graham-reno',
    title: 'Life’s Search for Meaning | Billy Graham Crusade in Reno, Nevada',
    preacher: 'Dr. Billy Graham',
    ministry: 'Billy Graham Evangelistic Association',
    scripture: 'Ecclesiastes 3:11; John 14:6',
    scriptureText: 'He has also set eternity in the human heart; yet no one can fathom what God has done from beginning to end.',
    duration: 1740,
    durationFormatted: '29:00',
    thumbnailUrl: 'https://img.youtube.com/vi/_ZvNDm9-Bak/hqdefault.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/_ZvNDm9-Bak',
    youtubeId: '_ZvNDm9-Bak',
    isOnlineVideo: true,
    sourceType: 'youtube',
    verifiedChristian: true,
    category: 'Sunday Sermons',
    series: 'Crusade Classics',
    date: 'Jul 12, 2026',
    description: 'Preached in the gambling capital of Reno, Dr. Graham confronts the emptiness of materialism and points to Jesus Christ as the only eternal satisfaction.',
    chapters: [
      { title: 'The Universal Hunger of the Heart', time: 0 },
      { title: 'Why Money and Pleasure Cannot Satisfy', time: 500 },
      { title: 'The Cross of Jesus Christ', time: 1050 },
      { title: 'The Altar Call in Reno', time: 1500 }
    ],
    biblePassages: [
      {
        reference: 'John 14:6',
        translation: 'KJV',
        text: 'Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.'
      }
    ],
    keyPoints: [
      'God designed humans with an eternity-sized void only Christ can fill.',
      'Repentance and trusting Jesus brings immediate peace of conscience.'
    ],
    downloadSizeMb: 95,
    tags: ['Billy Graham', 'Crusade', 'Meaning of Life', 'Reno', 'Gospel'],
    viewsCount: '3.1M views'
  },
  {
    id: 'yt-bp-psalms-meditation',
    title: 'Reading the Bible as Meditation Literature: Psalms 1 and 2',
    preacher: 'Tim Mackie & Jon Collins',
    ministry: 'BibleProject',
    scripture: 'Psalm 1:1-3; Psalm 2:7-12',
    scriptureText: 'Blessed is the one who does not walk in step with the wicked... but whose delight is in the law of the Lord, and who meditates on his law day and night.',
    duration: 480,
    durationFormatted: '8:00',
    thumbnailUrl: 'https://img.youtube.com/vi/AutIC8HIdI0/hqdefault.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/AutIC8HIdI0',
    youtubeId: 'AutIC8HIdI0',
    isOnlineVideo: true,
    sourceType: 'youtube',
    verifiedChristian: true,
    category: 'Deep Bible Study',
    series: 'How to Read the Bible',
    date: 'Jun 28, 2026',
    description: 'How biblical poetry was composed to be read slowly, repeatedly, and meditated upon over an entire lifetime, planting our lives like trees beside living waters.',
    chapters: [
      { title: 'The Literary Design of the Psalter', time: 0 },
      { title: 'The Tree Planted by Living Streams', time: 140 },
      { title: 'The Messianic King in Psalm 2', time: 290 },
      { title: 'Meditation as a Lifelong Practice', time: 410 }
    ],
    biblePassages: [
      {
        reference: 'Psalm 1:2-3',
        translation: 'NIV',
        text: 'Whose delight is in the law of the Lord, and who meditates on his law day and night. That person is like a tree planted by streams of water, which yields its fruit in season.'
      }
    ],
    keyPoints: [
      'Biblical meditation means muttering and savoring God’s Word continuously.',
      'Psalms 1 and 2 serve as the deliberate gateway to all 150 prayers and hymns.'
    ],
    downloadSizeMb: 45,
    tags: ['BibleProject', 'Psalms', 'Meditation', 'Scripture Study', 'Wisdom'],
    viewsCount: '2.5M views'
  },
  {
    id: 'yt-bp-10-commandments',
    title: 'Exploring Wisdom In All 10 Commandments (Design and Heart of the Law)',
    preacher: 'Tim Mackie',
    ministry: 'BibleProject',
    scripture: 'Exodus 20:1-17; Matthew 5:17-20',
    scriptureText: 'Do not think that I have come to abolish the Law or the Prophets; I have not come to abolish them but to fulfill them.',
    duration: 570,
    durationFormatted: '9:30',
    thumbnailUrl: 'https://img.youtube.com/vi/Ya-EbpCXWpw/hqdefault.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/Ya-EbpCXWpw',
    youtubeId: 'Ya-EbpCXWpw',
    isOnlineVideo: true,
    sourceType: 'youtube',
    verifiedChristian: true,
    category: 'Deep Bible Study',
    series: 'Wisdom Literature',
    date: 'Jun 19, 2026',
    description: 'A visual exploration into how the Ten Commandments were given to protect human flourishing and teach ancient Israel how to reflect the loving nature of Yahweh.',
    chapters: [
      { title: 'The First Tablet: Honoring Yahweh Alone', time: 0 },
      { title: 'Sabbath Rest in a Culture of Relentless Production', time: 160 },
      { title: 'The Second Tablet: Honoring Our Fellow Image Bearers', time: 320 },
      { title: 'Jesus Fulfilling the Heart of the Law', time: 480 }
    ],
    biblePassages: [
      {
        reference: 'Exodus 20:2-3',
        translation: 'NIV',
        text: 'I am the Lord your God, who brought you out of Egypt, out of the land of slavery. You shall have no other gods before me.'
      }
    ],
    keyPoints: [
      'The commandments flow from God’s gracious liberation of His people.',
      'Loving God and loving our neighbor are the two pillars of divine wisdom.'
    ],
    downloadSizeMb: 55,
    tags: ['BibleProject', '10 Commandments', 'Exodus', 'Torah', 'Wisdom'],
    viewsCount: '1.9M views'
  },
  {
    id: 'yt-tomlin-worship-live',
    title: 'Chris Tomlin // Full Worship Set // Live From Worship Together',
    preacher: 'Chris Tomlin',
    ministry: 'Worship Together',
    scripture: 'Psalm 145:1-3; Revelation 5:12-13',
    scriptureText: 'Great is the Lord and most worthy of praise; his greatness no one can fathom.',
    duration: 1800,
    durationFormatted: '30:00',
    thumbnailUrl: 'https://img.youtube.com/vi/gIWCDgNt5ww/hqdefault.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/gIWCDgNt5ww',
    youtubeId: 'gIWCDgNt5ww',
    isOnlineVideo: true,
    sourceType: 'youtube',
    verifiedChristian: true,
    category: 'Worship Nights',
    series: 'Worship Together Live',
    date: 'Jun 05, 2026',
    description: 'Chris Tomlin and full band lead thousands of church leaders in unbroken praise: How Great Is Our God, Holy Is the Lord, and Good Good Father.',
    chapters: [
      { title: 'How Great Is Our God Live', time: 0 },
      { title: 'Holy Is the Lord God Almighty', time: 540 },
      { title: 'Good Good Father Spontaneous Chants', time: 1100 },
      { title: 'Closing Adoration & Blessing', time: 1550 }
    ],
    biblePassages: [
      {
        reference: 'Psalm 145:3',
        translation: 'NIV',
        text: 'Great is the Lord and most worthy of praise; his greatness no one can fathom.'
      }
    ],
    keyPoints: [
      'Singing the attributes of God recalibrates our perspective.',
      'Corporate church praise unites generations under one Savior.'
    ],
    downloadSizeMb: 120,
    tags: ['Chris Tomlin', 'How Great Is Our God', 'Worship Together', 'Live Praise'],
    viewsCount: '4.8M views'
  },
  {
    id: 'yt-samuel-garden-worship',
    title: 'Live Worship Session in the Garden | Good Good Father | How Great Is Our God',
    preacher: 'Samuel Jackson-Reed',
    ministry: 'Samuel Jackson-Reed Music',
    scripture: 'Song of Solomon 2:10-12; Psalm 103:1-5',
    scriptureText: 'Bless the Lord, O my soul: and all that is within me, bless his holy name.',
    duration: 1980,
    durationFormatted: '33:00',
    thumbnailUrl: 'https://img.youtube.com/vi/vaGMCQPAHsI/hqdefault.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/vaGMCQPAHsI',
    youtubeId: 'vaGMCQPAHsI',
    isOnlineVideo: true,
    sourceType: 'youtube',
    verifiedChristian: true,
    category: 'Worship Nights',
    series: 'Acoustic Sanctuary',
    date: 'May 28, 2026',
    description: 'An acoustic garden worship session featuring raw acoustic guitars, vocal harmonies, and peaceful outdoor prayers.',
    chapters: [
      { title: 'Acoustic Medley in the Garden', time: 0 },
      { title: 'God I Look To You in Difficult Times', time: 600 },
      { title: 'How Great Is Our God Acoustic Chorus', time: 1200 }
    ],
    biblePassages: [
      {
        reference: 'Psalm 103:1',
        translation: 'KJV',
        text: 'Bless the Lord, O my soul: and all that is within me, bless his holy name.'
      }
    ],
    keyPoints: [
      'Simple, unadorned praise connects intimately with God’s presence.',
      'Creation itself reflects the handiwork of our Creator.'
    ],
    downloadSizeMb: 90,
    tags: ['Acoustic Worship', 'Garden Session', 'Peaceful', 'Good Good Father'],
    viewsCount: '1.2M views'
  },
  {
    id: 'yt-biblehub-247-audio',
    title: '24/7 Audio Bible Livestream | Continuous Word of God Broadcast',
    preacher: 'Bible Hub Narration Team',
    ministry: 'Bible Hub',
    scripture: 'Hebrews 4:12; Romans 10:17',
    scriptureText: 'For the word of God is alive and active. Sharper than any double-edged sword.',
    duration: 0,
    durationFormatted: 'LIVE 24/7',
    thumbnailUrl: 'https://img.youtube.com/vi/oNTzXQczFW0/hqdefault.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/oNTzXQczFW0',
    youtubeId: 'oNTzXQczFW0',
    isOnlineVideo: true,
    sourceType: 'livestream',
    verifiedChristian: true,
    category: 'Deep Bible Study',
    series: 'Unbroken Scripture Broadcast',
    date: 'Streaming LIVE',
    description: 'Listen to the Holy Bible read aloud 24 hours a day with scenic backdrops and synchronized text display. Pure, unadulterated scripture streaming continuously.',
    chapters: [
      { title: 'Continuous Scripture Reading (Genesis to Revelation)', time: 0 }
    ],
    biblePassages: [
      {
        reference: 'Romans 10:17',
        translation: 'NKJV',
        text: 'So then faith comes by hearing, and hearing by the word of God.'
      }
    ],
    keyPoints: [
      'Immersing yourself in audio scripture builds faith and cleanses thoughts.',
      'Listen while commuting, resting, working, or praying.'
    ],
    downloadSizeMb: 0,
    tags: ['Audio Bible', '24/7 Live', 'Scripture Stream', 'Bible Hub', 'KJV Audio'],
    viewsCount: '52K watching now'
  },
  {
    id: 'yt-gateway-night-worship',
    title: 'Night of Worship with Cody Carnes, Kari Jobe and Martin Smith | Gateway Church',
    preacher: 'Cody Carnes, Kari Jobe & Martin Smith',
    ministry: 'Gateway Church',
    scripture: 'Psalm 149:1; Habakkuk 3:2',
    scriptureText: 'Praise the Lord. Sing to the Lord a new song, his praise in the assembly of his faithful people.',
    duration: 4800,
    durationFormatted: '1:20:00',
    thumbnailUrl: 'https://img.youtube.com/vi/3sMWPKHgc_I/hqdefault.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/3sMWPKHgc_I',
    youtubeId: '3sMWPKHgc_I',
    isOnlineVideo: true,
    sourceType: 'youtube',
    verifiedChristian: true,
    category: 'Worship Nights',
    series: 'Gateway Worship Nights',
    date: 'May 15, 2026',
    description: 'An anointed night of united praise with legendary worship ministers declaring the glory and majesty of Jesus Christ.',
    chapters: [
      { title: 'Welcome and Opening Hymn of Praise', time: 0 },
      { title: 'Firm Foundation (He Won’t Let Me Down)', time: 900 },
      { title: 'Did You Feel the Mountains Tremble?', time: 2400 },
      { title: 'Holy Spirit Outpouring and Prayer', time: 3900 }
    ],
    biblePassages: [
      {
        reference: 'Psalm 149:1',
        translation: 'NIV',
        text: 'Praise the Lord. Sing to the Lord a new song, his praise in the assembly of his faithful people.'
      }
    ],
    keyPoints: [
      'Jesus is the firm foundation our lives can rest upon.',
      'United praise brings apostolic boldness and spiritual joy.'
    ],
    downloadSizeMb: 240,
    tags: ['Gateway Church', 'Cody Carnes', 'Kari Jobe', 'Martin Smith', 'Worship Night'],
    viewsCount: '1.7M views'
  }
];
