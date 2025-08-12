
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/context/auth-provider';

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.804 12.04C34.553 8.182 29.589 6 24 6C13.49 6 5 14.49 5 25s8.49 19 19 19s19-8.49 19-19c0-1.896-.286-3.719-.814-5.417z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.843-5.843C34.553 8.182 29.589 6 24 6C16.3 6 9.29 10.15 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.619-3.356-11.283-7.942l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.426 44 31.023 44 25c0-1.896-.286-3.719-.814-5.417z" />
    </svg>
);

const AppleIcon = () => (
    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
        <path fill="currentColor" d="M15.226 1.343a4.135 4.135 0 0 1 1.637.354a4.17 4.17 0 0 1 1.48 1.055a4.074 4.074 0 0 1 .84 1.588a2.91 2.91 0 0 0-.244-1.589a3.86 3.86 0 0 0-1.122-1.43a4.24 4.24 0 0 0-1.637-.8a4.57 4.57 0 0 0-1.805.215a4.138 4.138 0 0 0-1.42 1.01a4.265 4.265 0 0 0-.89 1.535a2.49 2.49 0 0 1 .184 1.43a4.045 4.045 0 0 1 1.25 1.535a4.204 4.204 0 0 1 .6 1.858a.42.42 0 0 1-.354.469a4.342 4.342 0 0 1-2.073-.47a4.67 4.67 0 0 1-1.744-1.42a4.425 4.425 0 0 1-1.02-1.984a4.52 4.52 0 0 0-1.923.47a4.253 4.253 0 0 0-1.637 1.325a4.438 4.438 0 0 0-.938 1.947a4.2 4.2 0 0 0 .041 2.118a4.437 4.437 0 0 0 .72 1.534a4.37 4.37 0 0 0 1.23 1.166a4.226 4.226 0 0 0 1.688.665a.42.42 0 0 1 .323-.448a4.174 4.174 0 0 1 .53-2.129a4.4 4.4 0 0 1 1.28-1.545a4.238 4.238 0 0 1 1.826-.9a4.512 4.512 0 0 1 1.964.3a.44.44 0 0 1 .282.448a4.25 4.25 0 0 1-.58 2.02a4.323 4.323 0 0 1-1.315 1.589a4.588 4.588 0 0 1-1.897.948a4.463 4.463 0 0 1-2.128-.312a4.37 4.37 0 0 1-1.765-1.324a4.524 4.524 0 0 1-1.01-2.062a10.82 10.82 0 0 1 .01-4.167a4.417 4.417 0 0 1 .84-1.734a4.352 4.352 0 0 1 1.534-1.29a4.535 4.535 0 0 1 2.02-.75a4.31 4.31 0 0 1 2.128.183" />
    </svg>
);

export default function Login() {
  const { signInWithGoogle, signInWithApple } = useAuth();

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to ProCoach AI</CardTitle>
          <CardDescription>Sign in to continue to your personal coach.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full" onClick={signInWithGoogle}>
            <GoogleIcon />
            Continue with Google
          </Button>
          <Button variant="outline" className="w-full" onClick={signInWithApple}>
            <AppleIcon />
            Continue with Apple
          </Button>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground text-center px-4">
              By continuing, you agree to our Terms of Service and Privacy policy
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
