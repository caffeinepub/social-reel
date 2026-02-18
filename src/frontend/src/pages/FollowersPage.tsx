import { useParams, Link } from '@tanstack/react-router';
import { useGetFollowers, useGetUserProfile } from '../hooks/useQueries';
import { Loader2, ArrowLeft, Users as UsersIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import MemberCard from '../components/MemberCard';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import type { UserProfile } from '../backend';
import { Principal } from '@dfinity/principal';

interface FollowerWithProfile {
  principal: Principal;
  profile: UserProfile;
  followerCount: number;
}

export default function FollowersPage() {
  const { principalId } = useParams({ from: '/profile/$principalId/followers' });
  const { data: profile } = useGetUserProfile(principalId);
  const { data: followers, isLoading: followersLoading } = useGetFollowers(principalId);
  const { actor, isFetching: actorFetching } = useActor();

  const { data: followersWithProfiles, isLoading: profilesLoading } = useQuery<FollowerWithProfile[]>({
    queryKey: ['followersWithProfiles', principalId],
    queryFn: async () => {
      if (!actor || !followers) return [];

      const followersData = await Promise.all(
        followers.map(async (followerPrincipal) => {
          const profile = await actor.getUserProfile(followerPrincipal);
          const followerCount = await actor.getFollowerCount(followerPrincipal);

          return profile
            ? {
                principal: followerPrincipal,
                profile,
                followerCount: Number(followerCount),
              }
            : null;
        })
      );

      return followersData.filter((f): f is FollowerWithProfile => f !== null);
    },
    enabled: !!actor && !actorFetching && !!followers,
  });

  const isLoading = followersLoading || profilesLoading;

  return (
    <div className="container py-12 px-4 max-w-6xl">
      <div className="mb-8">
        <Link to="/profile/$principalId" params={{ principalId }}>
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">{profile?.username}'s Followers</h1>
        <p className="text-muted-foreground">
          {followersWithProfiles?.length || 0}{' '}
          {followersWithProfiles?.length === 1 ? 'follower' : 'followers'}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !followersWithProfiles || followersWithProfiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
          <UsersIcon className="h-24 w-24 text-muted-foreground opacity-50" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">No followers yet</h2>
            <p className="text-muted-foreground max-w-md">
              When people follow this user, they'll appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {followersWithProfiles.map((follower) => (
            <MemberCard
              key={follower.principal.toString()}
              principal={follower.principal}
              profile={follower.profile}
              followerCount={follower.followerCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
