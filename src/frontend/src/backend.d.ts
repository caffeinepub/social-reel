import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Reel {
    id: bigint;
    video: ExternalBlob;
    description: string;
    uploader: Principal;
}
export interface UserProfile {
    bio: string;
    username: string;
    profilePicture?: ExternalBlob;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    followUser(userToFollow: Principal): Promise<void>;
    getAllReels(): Promise<Array<Reel>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFeed(): Promise<Array<Reel>>;
    getFollowerCount(user: Principal): Promise<bigint>;
    getFollowers(user: Principal): Promise<Array<Principal>>;
    getFollowing(user: Principal): Promise<Array<Principal>>;
    getFollowingCount(user: Principal): Promise<bigint>;
    getReel(id: bigint): Promise<Reel>;
    getReelsByUploader(uploader: Principal): Promise<Array<Reel>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    unfollowUser(userToUnfollow: Principal): Promise<void>;
    uploadReel(video: ExternalBlob, description: string): Promise<bigint>;
}
