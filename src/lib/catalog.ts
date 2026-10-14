export interface MagnetSource {
  id: string;
  label: string;
  quality: "4K UHD" | "1080p" | "720p";
  codec: string;
  size: string;
  seeds: number;
  peers: number;
  infoHash: string;
  magnetUri: string;
  webSeedUrl: string;
  archiveId?: string;
}

export interface MediaItem {
  id: string;
  tmdbId?: string;
  imdbId: string;
  title: string;
  year: number;
  rating: string;
  maturity: string;
  duration: string;
  genres: string[];
  synopsis: string;
  backdropUrl: string;
  posterUrl: string;
  category: "trending" | "scifi" | "classics" | "animation" | "thriller";
  featured?: boolean;
  sources: MagnetSource[];
  subtitles?: { lang: string; label: string; url: string }[];
}

export const PUBLIC_WEBTORRENT_TRACKERS = [
  "wss://tracker.openwebtorrent.com",
  "wss://tracker.btorrent.xyz",
  "wss://tracker.webtorrent.dev",
  "wss://tracker.files.fm:7073/announce",
  "udp://tracker.opentrackr.org:1337/announce",
  "udp://open.stealth.si:80/announce"
];

export function buildMagnetUri(infoHash: string, title: string, webSeedUrl?: string): string {
  const trParams = PUBLIC_WEBTORRENT_TRACKERS.map((tr) => `tr=${encodeURIComponent(tr)}`).join("&");
  const wsParam = webSeedUrl ? `&ws=${encodeURIComponent(webSeedUrl)}` : "";
  return `magnet:?xt=urn:btih:${infoHash}&dn=${encodeURIComponent(title)}&${trParams}${wsParam}`;
}

export const INITIAL_CATALOG: MediaItem[] = [
  {
    id: "tears-of-steel",
    imdbId: "tt2285752",
    title: "Tears of Steel",
    year: 2012,
    rating: "8.3",
    maturity: "U/A 13+",
    duration: "12m 14s",
    genres: ["Sci-Fi", "Cyberpunk", "Action"],
    synopsis: "In a dystopian future Amsterdam, a group of guerrilla fighters and a brilliant scientist stage a desperate final stand inside the Oude Kerk to save the world from destructive autonomous robots.",
    backdropUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=85",
    posterUrl: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=600&q=80",
    category: "trending",
    featured: true,
    sources: [
      {
        id: "tos-1080p",
        label: "1080p WebRip • x264 • AAC 2.0 (WebTorrent Swarm + WebSeed)",
        quality: "1080p",
        codec: "H.264 / AAC",
        size: "185 MB",
        seeds: 214,
        peers: 38,
        infoHash: "209c8226b299b308beaf2b9cd3fb49212dbd13ec",
        webSeedUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        magnetUri: buildMagnetUri(
          "209c8226b299b308beaf2b9cd3fb49212dbd13ec",
          "Tears of Steel (1080p)",
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
        )
      },
      {
        id: "tos-4k",
        label: "4K UHD Master • AVC1 • Dual Audio",
        quality: "4K UHD",
        codec: "H.264 / AAC 5.1",
        size: "540 MB",
        seeds: 96,
        peers: 14,
        infoHash: "209c8226b299b308beaf2b9cd3fb49212dbd13ec",
        webSeedUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        magnetUri: buildMagnetUri(
          "209c8226b299b308beaf2b9cd3fb49212dbd13ec",
          "Tears of Steel (4K Master)",
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
        )
      }
    ]
  },
  {
    id: "sintel-open-movie",
    imdbId: "tt1727587",
    title: "Sintel: The Dragon Blade",
    year: 2010,
    rating: "8.6",
    maturity: "U/A 13+",
    duration: "14m 48s",
    genres: ["Fantasy", "Adventure", "Animation"],
    synopsis: "A lonely young warrior named Sintel embarks on a perilous quest across frozen peaks and ancient ruins to rescue her only friend, a fledgling dragon named Scales, leading to a devastating revelation.",
    backdropUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80",
    posterUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
    category: "trending",
    sources: [
      {
        id: "sintel-1080p",
        label: "1080p BluRay • x264 • 5.1 Surround (Official WebTorrent Swarm)",
        quality: "1080p",
        codec: "H.264 / AAC",
        size: "129 MB",
        seeds: 312,
        peers: 45,
        infoHash: "08ada5a7a6183aae1e09d831df6748d566095a10",
        webSeedUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        magnetUri: buildMagnetUri(
          "08ada5a7a6183aae1e09d831df6748d566095a10",
          "Sintel (2010) 1080p",
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
        )
      }
    ]
  },
  {
    id: "cosmos-laundromat",
    imdbId: "tt4935446",
    title: "Cosmos Laundromat: First Cycle",
    year: 2015,
    rating: "8.1",
    maturity: "U/A 13+",
    duration: "12m 10s",
    genres: ["Sci-Fi", "Absurdist", "Drama"],
    synopsis: "On a desolate island, a suicidal sheep named Franck meets a mysterious, charismatic salesman who offers him the gift of a lifetime: infinite choices across parallel worlds inside a cosmic laundromat.",
    backdropUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80",
    posterUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=600&q=80",
    category: "scifi",
    sources: [
      {
        id: "cosmos-1080p",
        label: "1080p WebDL • x264 • AAC Stereo (WebTorrent Swarm)",
        quality: "1080p",
        codec: "H.264 / AAC",
        size: "220 MB",
        seeds: 178,
        peers: 22,
        infoHash: "c9e15763f722f23e98a29decdfae341b98d53056",
        webSeedUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        magnetUri: buildMagnetUri(
          "c9e15763f722f23e98a29decdfae341b98d53056",
          "Cosmos Laundromat 1080p",
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        )
      }
    ]
  },
  {
    id: "night-of-the-living-dead",
    imdbId: "tt0063350",
    title: "Night of the Living Dead (Remastered)",
    year: 1968,
    rating: "7.8",
    maturity: "A 18+",
    duration: "1h 36m",
    genres: ["Horror", "Thriller", "Cult Classic"],
    synopsis: "George A. Romero's landmark horror masterpiece. Seven strangers trapped in an isolated Pennsylvania farmhouse fight to survive an onslaught of reanimated flesh-eating ghouls.",
    backdropUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80",
    posterUrl: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=600&q=80",
    category: "classics",
    sources: [
      {
        id: "notld-1080p",
        label: "1080p Public Domain Archival Master • H.264 • AAC",
        quality: "1080p",
        codec: "H.264 / AAC",
        size: "712 MB",
        seeds: 164,
        peers: 29,
        archiveId: "night_of_the_living_dead",
        infoHash: "4095c7c2c10602464b65e2d53708ef6d37939337",
        webSeedUrl: "https://archive.org/download/night_of_the_living_dead/night_of_the_living_dead_512kb.mp4",
        magnetUri: buildMagnetUri(
          "4095c7c2c10602464b65e2d53708ef6d37939337",
          "Night of the Living Dead (1968)",
          "https://archive.org/download/night_of_the_living_dead/night_of_the_living_dead_512kb.mp4"
        )
      }
    ]
  },
  {
    id: "big-buck-bunny",
    imdbId: "tt1254207",
    title: "Big Buck Bunny",
    year: 2008,
    rating: "7.6",
    maturity: "U",
    duration: "9m 56s",
    genres: ["Animation", "Comedy", "Family"],
    synopsis: "A giant, gentle-hearted rabbit has his peaceful morning routine shattered by three bullying forest rodents—prompting him to engineer an elaborate woodland counter-offensive.",
    backdropUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
    posterUrl: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=600&q=80",
    category: "animation",
    sources: [
      {
        id: "bbb-1080p",
        label: "1080p 60fps Master • x264 • AAC (WebTorrent P2P + WebSeed)",
        quality: "1080p",
        codec: "H.264 / AAC",
        size: "158 MB",
        seeds: 289,
        peers: 51,
        infoHash: "dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c",
        webSeedUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        magnetUri: buildMagnetUri(
          "dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c",
          "Big Buck Bunny 1080p",
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        )
      }
    ]
  },
  {
    id: "house-on-haunted-hill",
    imdbId: "tt0051744",
    title: "House on Haunted Hill",
    year: 1959,
    rating: "7.4",
    maturity: "U/A 16+",
    duration: "1h 15m",
    genres: ["Thriller", "Mystery", "Horror"],
    synopsis: "Eccentric millionaire Frederick Loren invites five strangers to a notoriously haunted mansion, offering $10,000 to anyone who can survive locked inside for a single night.",
    backdropUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80",
    posterUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80",
    category: "thriller",
    sources: [
      {
        id: "hohh-720p",
        label: "720p Archive Restore • H.264 • AAC",
        quality: "720p",
        codec: "H.264 / AAC",
        size: "520 MB",
        seeds: 112,
        peers: 19,
        archiveId: "house_on_haunted_hill_ipod",
        infoHash: "9f9b6e2f8e4d7a1c3b5e8f2a4d6c8e0b2a4f6d8e",
        webSeedUrl: "https://archive.org/download/house_on_haunted_hill_ipod/house_on_haunted_hill.mp4",
        magnetUri: buildMagnetUri(
          "9f9b6e2f8e4d7a1c3b5e8f2a4d6c8e0b2a4f6d8e",
          "House on Haunted Hill (1959)",
          "https://archive.org/download/house_on_haunted_hill_ipod/house_on_haunted_hill.mp4"
        )
      }
    ]
  },
  {
    id: "elephants-dream",
    imdbId: "tt0807840",
    title: "Elephants Dream",
    year: 2006,
    rating: "7.5",
    maturity: "U/A 13+",
    duration: "10m 54s",
    genres: ["Sci-Fi", "Surreal", "Animation"],
    synopsis: "Proog and Emo navigate the cavernous, shifting clockwork interior of a surreal colossal Machine that shapes their reality and tests their perception of truth.",
    backdropUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
    posterUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
    category: "scifi",
    sources: [
      {
        id: "ed-1080p",
        label: "1080p Open Movie Master • x264 • AAC",
        quality: "1080p",
        codec: "H.264 / AAC",
        size: "142 MB",
        seeds: 134,
        peers: 17,
        infoHash: "6a9759bffd5c0af65319979fb7832189f4f3c35d",
        webSeedUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        magnetUri: buildMagnetUri(
          "6a9759bffd5c0af65319979fb7832189f4f3c35d",
          "Elephants Dream 1080p",
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
        )
      }
    ]
  },
  {
    id: "charade-1963",
    imdbId: "tt0056923",
    title: "Charade (1963 Technicolor)",
    year: 1963,
    rating: "7.9",
    maturity: "U/A 13+",
    duration: "1h 53m",
    genres: ["Thriller", "Romance", "Mystery"],
    synopsis: "Romance and suspense ensue in Paris as a woman is pursued by several men who want a fortune her murdered husband had stolen. Who can she trust?",
    backdropUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80",
    posterUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80",
    category: "classics",
    sources: [
      {
        id: "charade-1080p",
        label: "1080p Archive Remaster • H.264 • AAC",
        quality: "1080p",
        codec: "H.264 / AAC",
        size: "890 MB",
        seeds: 149,
        peers: 24,
        archiveId: "Charade1963",
        infoHash: "7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d",
        webSeedUrl: "https://archive.org/download/Charade1963/Charade1963_512kb.mp4",
        magnetUri: buildMagnetUri(
          "7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d",
          "Charade (1963)",
          "https://archive.org/download/Charade1963/Charade1963_512kb.mp4"
        )
      }
    ]
  }
];
