import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, User as UserIcon } from 'lucide-react';
import { useGetUserProfile } from '../hooks/useQueries';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Link } from '@tanstack/react-router';
import type { Reel } from '../backend';

interface VideoCardProps {
  reel: Reel;
}

export default function VideoCard({ reel }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { data: uploaderProfile } = useGetUserProfile(reel.uploader.toString());

  const videoUrl = reel.video.getDirectURL();

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const profilePictureUrl = uploaderProfile?.profilePicture?.getDirectURL();

  return (
    <div className="bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-video bg-muted group">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover"
          loop
          playsInline
          muted={isMuted}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <button
              onClick={togglePlay}
              className="p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
            >
              {isPlaying ? <Pause className="h-5 w-5 text-white" /> : <Play className="h-5 w-5 text-white" />}
            </button>
            <button
              onClick={toggleMute}
              className="p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
            >
              {isMuted ? <VolumeX className="h-5 w-5 text-white" /> : <Volume2 className="h-5 w-5 text-white" />}
            </button>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <Link
          to="/profile/$principalId"
          params={{ principalId: reel.uploader.toString() }}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Avatar className="h-10 w-10">
            {profilePictureUrl ? (
              <AvatarImage src={profilePictureUrl} alt={uploaderProfile?.username || 'User'} />
            ) : (
              <AvatarFallback>
                <UserIcon className="h-5 w-5" />
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{uploaderProfile?.username || 'Anonymous'}</p>
          </div>
        </Link>
        {reel.description && <p className="text-sm text-muted-foreground line-clamp-2">{reel.description}</p>}
      </div>
    </div>
  );
}
