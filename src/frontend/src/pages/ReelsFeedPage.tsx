import { useGetFeed } from '../hooks/useQueries';
import ReelCard from '../components/ReelCard';
import { Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function ReelsFeedPage() {
  const { data: reels, isLoading } = useGetFeed();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const windowHeight = window.innerHeight;
      const newIndex = Math.round(scrollTop / windowHeight);
      setActiveIndex(newIndex);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!reels || reels.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-white text-center space-y-6 p-4">
        <img
          src="/assets/generated/empty-feed.dim_400x400.png"
          alt="No reels yet"
          className="h-64 w-64 opacity-50"
        />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">No reels yet</h2>
          <p className="text-white/70 max-w-md">
            Be the first to share! Upload your first reel using the upload button above.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-screen overflow-y-scroll snap-y snap-mandatory">
      {reels.map((reel, index) => (
        <ReelCard key={reel.id.toString()} reel={reel} isActive={index === activeIndex} />
      ))}
    </div>
  );
}
