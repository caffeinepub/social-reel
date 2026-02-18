import { useActor } from '../hooks/useActor';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Users as UsersIcon } from 'lucide-react';
import MemberCard from '../components/MemberCard';
import { Skeleton } from '../components/ui/skeleton';
import type { UserProfile } from '../backend';
import { Principal } from '@dfinity/principal';

interface MemberWithProfile {
  principal: Principal;
  profile: UserProfile;
  followerCount: number;
}

export default function MembersPage() {
  const { actor, isFetching: actorFetching } = useActor();

  const { data: members, isLoading } = useQuery<MemberWithProfile[]>({
    queryKey: ['allMembers'],
    queryFn: async () => {
      if (!actor) return [];

      const allReels = await actor.getAllReels();
      const uniquePrincipals = Array.from(new Set(allReels.map((reel) => reel.uploader.toString())));

      const membersData = await Promise.all(
        uniquePrincipals.map(async (principalStr) => {
          const principal = Principal.fromText(principalStr);
          const profile = await actor.getUserProfile(principal);
          const followerCount = await actor.getFollowerCount(principal);

          return profile
            ? {
                principal,
                profile,
                followerCount: Number(followerCount),
              }
            : null;
        })
      );

      return membersData.filter((m): m is MemberWithProfile => m !== null);
    },
    enabled: !!actor && !actorFetching,
  });

  if (isLoading) {
    return (
      <div className="container py-12 px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Members</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-6 space-y-4">
              <Skeleton className="h-24 w-24 rounded-full mx-auto" />
              <Skeleton className="h-6 w-32 mx-auto" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <div className="container py-12 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 px-4">
        <UsersIcon className="h-24 w-24 text-muted-foreground opacity-50" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">No members yet</h2>
          <p className="text-muted-foreground max-w-md">
            Be the first to join the community! Upload a reel to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Members</h1>
        <p className="text-muted-foreground">
          Discover and connect with {members.length} {members.length === 1 ? 'member' : 'members'} in the community
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <MemberCard
            key={member.principal.toString()}
            principal={member.principal}
            profile={member.profile}
            followerCount={member.followerCount}
          />
        ))}
      </div>
    </div>
  );
}
