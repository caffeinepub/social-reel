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
        // Extract meaningful error message from backend trap
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
        // Extract meaningful error message from backend trap
        const errorMessage = error?.message || String(error);
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allReels'] });
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
