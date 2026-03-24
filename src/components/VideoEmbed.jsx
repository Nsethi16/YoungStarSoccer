import { Play, ExternalLink, Video } from 'lucide-react';

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
      <div className="aspect-video rounded-xl bg-gray-100 flex flex-col items-center justify-center gap-2 text-gray-400">
        <Video size={40} strokeWidth={1.5} />
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
        <Play size={28} fill="white" />
        <span className="font-semibold text-lg">Watch on Instagram</span>
        <ExternalLink size={18} />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-3 aspect-video rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200"
    >
      <Play size={28} />
      <span className="font-semibold">Watch Video</span>
      <ExternalLink size={16} />
    </a>
  );
}
