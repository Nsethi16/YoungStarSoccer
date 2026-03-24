function parseYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function isInstagramUrl(url) {
  return url && /instagram\.com/i.test(url);
}

export default function VideoEmbed({ url }) {
  if (!url) {
    return (
      <div className="aspect-video rounded-xl bg-kp-surface-low flex flex-col items-center justify-center gap-2 text-kp-on-surface-variant border border-kp-outline-variant/10">
        <span className="material-symbols-outlined text-4xl">videocam</span>
        <p className="text-sm">Add a video link to see it here</p>
      </div>
    );
  }

  const youtubeId = parseYouTubeId(url);

  if (youtubeId) {
    return (
      <div className="aspect-video rounded-xl overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title="Drill video"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (isInstagramUrl(url)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-3 aspect-video rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white hover:opacity-90 transition-opacity duration-200"
      >
        <span className="material-symbols-outlined text-3xl">play_arrow</span>
        <span className="font-headline font-bold text-lg">Watch on Instagram</span>
        <span className="material-symbols-outlined text-lg">open_in_new</span>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-3 aspect-video rounded-xl bg-kp-surface-high text-kp-on-surface-variant hover:bg-kp-surface-variant transition-colors duration-200 border border-kp-outline-variant/10"
    >
      <span className="material-symbols-outlined text-3xl">play_arrow</span>
      <span className="font-headline font-bold">Watch Video</span>
      <span className="material-symbols-outlined text-lg">open_in_new</span>
    </a>
  );
}
