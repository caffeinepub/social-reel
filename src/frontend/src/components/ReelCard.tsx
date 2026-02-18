import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, User as UserIcon } from 'lucide-react';
import { useGetUserProfile } from '../hooks/useQueries';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Link } from '@tanstack/react-router';
import type { Reel } from '../backend';

interface ReelCardProps {
  reel: Reel;
  isActive: boolean;
}

export default function ReelCard({ reel, isActive }: ReelCardProps) {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { data: uploaderProfile } = useGetUserProfile(reel.uploader.toString());

  const videoUrl = reel.video.getDirectURL();

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().catch((err) => console.log('Autoplay prevented:', err));
    } else {
      video.pause();
    }
  }, [isActive]);

  const profilePictureUrl = uploaderProfile?.profilePicture?.getDirectURL();

  return (
    <div className="relative w-full h-screen snap-start snap-always bg-black">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        loop
        playsInline
        muted={isMuted}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
      <div className="absolute top-6 left-6 right-6 flex items-start justify-between pointer-events-auto">
        <Link
          to="/profile/$principalId"
          params={{ principalId: reel.uploader.toString() }}
          className="flex items-center gap-3 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 hover:bg-black/60 transition-colors"
        >
          <Avatar className="h-10 w-10 border-2 border-white">
            {profilePictureUrl ? (
              <AvatarImage src={profilePictureUrl} alt={uploaderProfile?.username || 'User'} />
            ) : (
              <AvatarFallback className="bg-muted">
                <UserIcon className="h-5 w-5" />
              </AvatarFallback>
            )}
          </Avatar>
          <span className="font-semibold text-white">{uploaderProfile?.username || 'Anonymous'}</span>
        </Link>
        <button
          onClick={toggleMute}
          className="p-3 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
        >
          {isMuted ? <VolumeX className="h-6 w-6 text-white" /> : <Volume2 className="h-6 w-6 text-white" />}
        </button>
      </div>
      {reel.description && (
        <div className="absolute bottom-20 left-6 right-6 pointer-events-none">
          <p className="text-white text-base font-medium drop-shadow-lg">{reel.description}</p>
        </div>
      )}
    </div>
  );
}
