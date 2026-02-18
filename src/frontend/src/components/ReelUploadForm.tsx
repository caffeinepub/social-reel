import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { useUploadReel } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { Loader2, Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ReelUploadFormProps {
  onSuccess?: () => void;
}

export default function ReelUploadForm({ onSuccess }: ReelUploadFormProps) {
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const uploadReel = useUploadReel();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
      } else {
        toast.error('Please select a valid video file');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!videoFile) {
      toast.error('Please select a video file');
      return;
    }

    try {
      const arrayBuffer = await videoFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const videoBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await uploadReel.mutateAsync({
        video: videoBlob,
        description: description.trim(),
      });

      toast.success('Reel uploaded successfully!');
      setDescription('');
      setVideoFile(null);
      setUploadProgress(0);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error uploading reel:', error);
      const errorMessage = error?.message || 'Failed to upload reel. Please try again.';
      
      // Check if it's a validation error from the backend
      if (errorMessage.includes('Inappropriate language') || errorMessage.includes('profanity')) {
        setValidationError(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {validationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="video">Video File *</Label>
        <div className="flex flex-col gap-2">
          <Input
            id="video"
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="cursor-pointer"
            required
          />
          {videoFile && (
            <span className="text-sm text-muted-foreground">
              {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (validationError) setValidationError(null);
          }}
          placeholder="What's this reel about?"
          rows={3}
          className={validationError ? 'border-destructive' : ''}
        />
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
      <Button type="submit" className="w-full" disabled={uploadReel.isPending || !videoFile}>
        {uploadReel.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Reel
          </>
        )}
      </Button>
    </form>
  );
}
