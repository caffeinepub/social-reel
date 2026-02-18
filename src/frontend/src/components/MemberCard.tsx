import { Link } from '@tanstack/react-router';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { User as UserIcon } from 'lucide-react';
import type { UserProfile } from '../backend';
import { Principal } from '@dfinity/principal';

interface MemberCardProps {
  principal: Principal;
  profile: UserProfile;
  followerCount: number;
}

export default function MemberCard({ principal, profile, followerCount }: MemberCardProps) {
  const profilePictureUrl = profile.profilePicture?.getDirectURL();
  const principalId = principal.toString();

  return (
    <Link
      to="/profile/$principalId"
      params={{ principalId }}
      className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow flex flex-col items-center text-center space-y-4"
    >
      <Avatar className="h-24 w-24 border-4 border-border">
        {profilePictureUrl ? (
          <AvatarImage src={profilePictureUrl} alt={profile.username} />
        ) : (
          <AvatarFallback className="bg-muted">
            <UserIcon className="h-12 w-12" />
          </AvatarFallback>
        )}
      </Avatar>
      <div className="space-y-1">
        <h3 className="font-semibold text-lg">{profile.username}</h3>
        <p className="text-sm text-muted-foreground">
          {followerCount} {followerCount === 1 ? 'follower' : 'followers'}
        </p>
      </div>
      {profile.bio && <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>}
    </Link>
  );
}
