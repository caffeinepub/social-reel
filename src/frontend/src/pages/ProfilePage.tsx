import { useParams } from '@tanstack/react-router';
import { useGetUserProfile, useGetReelsByUploader, useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Loader2, User as UserIcon, Edit } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import { useState } from 'react';
import ProfileEditForm from '../components/ProfileEditForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';

export default function ProfilePage() {
  const { principalId } = useParams({ from: '/profile/$principalId' });
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useGetUserProfile(principalId);
  const { data: reels, isLoading: reelsLoading } = useGetReelsByUploader(principalId);
  const { data: currentUserProfile } = useGetCallerUserProfile();
  const [editOpen, setEditOpen] = useState(false);

  const isOwnProfile = identity?.getPrincipal().toString() === principalId;

  const handleEditSuccess = () => {
    setEditOpen(false);
  };

  if (profileLoading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-12 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <h2 className="text-2xl font-bold">Profile not found</h2>
        <p className="text-muted-foreground">This user hasn't set up their profile yet.</p>
      </div>
    );
  }

  const profilePictureUrl = profile.profilePicture?.getDirectURL();

  return (
    <div className="container py-8 px-4 max-w-5xl">
      <div className="bg-card rounded-xl border border-border p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <Avatar className="h-32 w-32 border-4 border-border">
            {profilePictureUrl ? (
              <AvatarImage src={profilePictureUrl} alt={profile.username} />
            ) : (
              <AvatarFallback className="bg-muted">
                <UserIcon className="h-16 w-16" />
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold">{profile.username}</h1>
              {isOwnProfile && (
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <ProfileEditForm currentProfile={currentUserProfile!} onSuccess={handleEditSuccess} />
                  </DialogContent>
                </Dialog>
              )}
            </div>
            {profile.bio && <p className="text-muted-foreground">{profile.bio}</p>}
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="font-semibold">{reels?.length || 0}</span>{' '}
                <span className="text-muted-foreground">reels</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Reels</h2>
        {reelsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !reels || reels.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-muted-foreground">No reels yet</p>
            {isOwnProfile && <p className="text-sm text-muted-foreground">Upload your first reel to get started!</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reels.map((reel) => (
              <VideoCard key={reel.id.toString()} reel={reel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
