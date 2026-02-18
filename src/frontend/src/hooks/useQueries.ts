import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Reel } from '../backend';
import { ExternalBlob } from '../backend';
import { Principal } from '@dfinity/principal';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.saveCallerUserProfile(profile);
      } catch (error: any) {
        const errorMessage = error?.message || String(error);
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetUserProfile(principalId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(principalId);
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !actorFetching && !!principalId,
  });
}

export function useUploadReel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ video, description }: { video: ExternalBlob; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.uploadReel(video, description);
      } catch (error: any) {
        const errorMessage = error?.message || String(error);
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allReels'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['reelsByUploader'] });
    },
  });
}

export function useGetAllReels() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Reel[]>({
    queryKey: ['allReels'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllReels();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetFeed() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Reel[]>({
    queryKey: ['feed'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeed();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetReelsByUploader(uploaderPrincipal: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Reel[]>({
    queryKey: ['reelsByUploader', uploaderPrincipal],
    queryFn: async () => {
      if (!actor) return [];
      const principal = Principal.fromText(uploaderPrincipal);
      return actor.getReelsByUploader(principal);
    },
    enabled: !!actor && !actorFetching && !!uploaderPrincipal,
  });
}

export function useFollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userToFollow: Principal) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.followUser(userToFollow);
      } catch (error: any) {
        const errorMessage = error?.message || String(error);
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['followerCount'] });
      queryClient.invalidateQueries({ queryKey: ['followingCount'] });
      queryClient.invalidateQueries({ queryKey: ['isFollowing'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userToUnfollow: Principal) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.unfollowUser(userToUnfollow);
      } catch (error: any) {
        const errorMessage = error?.message || String(error);
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['followerCount'] });
      queryClient.invalidateQueries({ queryKey: ['followingCount'] });
      queryClient.invalidateQueries({ queryKey: ['isFollowing'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useGetFollowers(principalId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['followers', principalId],
    queryFn: async () => {
      if (!actor) return [];
      const principal = Principal.fromText(principalId);
      return actor.getFollowers(principal);
    },
    enabled: !!actor && !actorFetching && !!principalId,
  });
}

export function useGetFollowing(principalId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['following', principalId],
    queryFn: async () => {
      if (!actor) return [];
      const principal = Principal.fromText(principalId);
      return actor.getFollowing(principal);
    },
    enabled: !!actor && !actorFetching && !!principalId,
  });
}

export function useGetFollowerCount(principalId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['followerCount', principalId],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      const principal = Principal.fromText(principalId);
      return actor.getFollowerCount(principal);
    },
    enabled: !!actor && !actorFetching && !!principalId,
  });
}

export function useGetFollowingCount(principalId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['followingCount', principalId],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      const principal = Principal.fromText(principalId);
      return actor.getFollowingCount(principal);
    },
    enabled: !!actor && !actorFetching && !!principalId,
  });
}

export function useIsFollowing(principalId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isFollowing', principalId],
    queryFn: async () => {
      if (!actor || !principalId) return false;
      const principal = Principal.fromText(principalId);
      const following = await actor.getFollowing(Principal.fromText(actor.toString()));
      return following.some((p) => p.toString() === principal.toString());
    },
    enabled: !!actor && !actorFetching && !!principalId,
  });
}
