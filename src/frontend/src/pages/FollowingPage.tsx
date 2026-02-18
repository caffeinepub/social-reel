import { useParams, Link } from '@tanstack/react-router';
import { useGetFollowing, useGetUserProfile } from '../hooks/useQueries';
import { Loader2, ArrowLeft, Users as UsersIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import MemberCard from '../components/MemberCard';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import type { UserProfile } from '../backend';
import { Principal } from '@dfinity/principal';

interface FollowingWithProfile {
  principal: Principal;
  profile: UserProfile;
  followerCount: number;
}

export default function FollowingPage() {
  const { principalId } = useParams({ from: '/profile/$principalId/following' });
  const { data: profile } = useGetUserProfile(principalId);
  const { data: following, isLoading: followingLoading } = useGetFollowing(principalId);
  const { actor, isFetching: actorFetching } = useActor();

  const { data: followingWithProfiles, isLoading: profilesLoading } = useQuery<FollowingWithProfile[]>({
    queryKey: ['followingWithProfiles', principalId],
    queryFn: async () => {
      if (!actor || !following) return [];

      const followingData = await Promise.all(
        following.map(async (followingPrincipal) => {
          const profile = await actor.getUserProfile(followingPrincipal);
          const followerCount = await actor.getFollowerCount(followingPrincipal);

          return profile
            ? {
                principal: followingPrincipal,
                profile,
                followerCount: Number(followerCount),
              }
            : null;
        })
      );

      return followingData.filter((f): f is FollowingWithProfile => f !== null);
    },
    enabled: !!actor && !actorFetching && !!following,
  });

  const isLoading = followingLoading || profilesLoading;

  return (
    <div className="container py-12 px-4 max-w-6xl">
      <div className="mb-8">
        <Link to="/profile/$principalId" params={{ principalId }}>
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">{profile?.username} is Following</h1>
        <p className="text-muted-foreground">
          {followingWithProfiles?.length || 0} {followingWithProfiles?.length === 1 ? 'user' : 'users'}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !followingWithProfiles || followingWithProfiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
          <UsersIcon className="h-24 w-24 text-muted-foreground opacity-50" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Not following anyone yet</h2>
            <p className="text-muted-foreground max-w-md">
              When this user follows others, they'll appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {followingWithProfiles.map((followingUser) => (
            <MemberCard
              key={followingUser.principal.toString()}
              principal={followingUser.principal}
              profile={followingUser.profile}
              followerCount={followingUser.followerCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
