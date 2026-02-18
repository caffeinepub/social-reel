import { Button } from './ui/button';
import { useFollowUser, useUnfollowUser, useGetFollowing } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';
import { Loader2, UserPlus, UserMinus } from 'lucide-react';
import { toast } from 'sonner';

interface FollowButtonProps {
  targetPrincipal: Principal;
}

export default function FollowButton({ targetPrincipal }: FollowButtonProps) {
  const { identity } = useInternetIdentity();
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const currentPrincipalId = identity?.getPrincipal().toString() || '';
  const { data: following, isLoading: followingLoading } = useGetFollowing(currentPrincipalId);

  const isOwnProfile = currentPrincipalId === targetPrincipal.toString();
  const isFollowing = following?.some((p) => p.toString() === targetPrincipal.toString()) || false;
  const isLoading = followMutation.isPending || unfollowMutation.isPending || followingLoading;

  if (isOwnProfile) {
    return null;
  }

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await unfollowMutation.mutateAsync(targetPrincipal);
        toast.success('Unfollowed successfully');
      } else {
        await followMutation.mutateAsync(targetPrincipal);
        toast.success('Followed successfully');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update follow status');
    }
  };

  return (
    <Button
      onClick={handleFollow}
      disabled={isLoading}
      variant={isFollowing ? 'outline' : 'default'}
      size="sm"
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="h-4 w-4" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Follow
        </>
      )}
    </Button>
  );
}
