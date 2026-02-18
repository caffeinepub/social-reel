import { Button } from '../components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <img
            src="/assets/generated/logo.dim_256x256.png"
            alt="Social Reel"
            className="h-24 w-24 mx-auto"
          />
          <h1 className="text-4xl font-bold tracking-tight">Welcome to Social Reel</h1>
          <p className="text-lg text-muted-foreground">
            Share your moments through reels and videos with the world
          </p>
        </div>
        <div className="pt-8">
          <Button onClick={login} disabled={isLoggingIn} size="lg" className="w-full max-w-xs mx-auto">
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Logging in...
              </>
            ) : (
              'Login with Internet Identity'
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground pt-4">
          Secure authentication powered by Internet Computer
        </p>
      </div>
    </div>
  );
}
