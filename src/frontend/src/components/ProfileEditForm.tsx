import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { ExternalBlob, UserProfile } from '../backend';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileEditFormProps {
  currentProfile: UserProfile;
  onSuccess?: () => void;
}

export default function ProfileEditForm({ currentProfile, onSuccess }: ProfileEditFormProps) {
  const [username, setUsername] = useState(currentProfile.username);
  const [bio, setBio] = useState(currentProfile.bio);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const saveProfile = useSaveCallerUserProfile();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    try {
      let profilePictureBlob: ExternalBlob | undefined = currentProfile.profilePicture;

      if (profilePicture) {
        const arrayBuffer = await profilePicture.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        profilePictureBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      }

      await saveProfile.mutateAsync({
        username: username.trim(),
        bio: bio.trim(),
        profilePicture: profilePictureBlob,
      });

      toast.success('Profile updated successfully!');
      onSuccess?.();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage = error?.message || 'Failed to update profile. Please try again.';
      
      // Check if it's a validation error from the backend
      if (errorMessage.includes('Inappropriate language') || errorMessage.includes('profanity')) {
        setValidationError(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const currentProfilePictureUrl = currentProfile.profilePicture?.getDirectURL();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {validationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="username">Username *</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => {
            setBio(e.target.value);
            if (validationError) setValidationError(null);
          }}
          placeholder="Tell us about yourself..."
          rows={3}
          className={validationError ? 'border-destructive' : ''}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="profilePicture">Profile Picture</Label>
        {currentProfilePictureUrl && !profilePicture && (
          <div className="mb-2">
            <img
              src={currentProfilePictureUrl}
              alt="Current profile"
              className="h-20 w-20 rounded-full object-cover border-2 border-border"
            />
          </div>
        )}
        <div className="flex items-center gap-3">
          <Input
            id="profilePicture"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          {profilePicture && <span className="text-sm text-muted-foreground">{profilePicture.name}</span>}
        </div>
      </div>
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
      <Button type="submit" className="w-full" disabled={saveProfile.isPending}>
        {saveProfile.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating Profile...
          </>
        ) : (
          'Update Profile'
        )}
      </Button>
    </form>
  );
}
