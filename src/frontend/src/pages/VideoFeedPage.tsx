import { useGetAllReels } from '../hooks/useQueries';
import VideoCard from '../components/VideoCard';
import { Loader2 } from 'lucide-react';

export default function VideoFeedPage() {
  const { data: reels, isLoading } = useGetAllReels();

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!reels || reels.length === 0) {
    return (
      <div className="container py-12 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <img
          src="/assets/generated/empty-feed.dim_400x400.png"
          alt="No videos yet"
          className="h-64 w-64 opacity-50"
        />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">No videos yet</h2>
          <p className="text-muted-foreground max-w-md">
            Be the first to share! Upload your first reel using the upload button above.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Video Feed</h1>
        <p className="text-muted-foreground mt-2">Discover amazing content from our community</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reels.map((reel) => (
          <VideoCard key={reel.id.toString()} reel={reel} />
        ))}
      </div>
    </div>
  );
}
