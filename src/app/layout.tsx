import type { Metadata } from 'next';
import { AppProvider } from '@/context/app-provider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

export const metadata: Metadata = {
  title: 'ProCoach AI',
  description: 'Overcome procrastination with AI-powered coaches.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Source+Code+Pro:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AppProvider>
          <div className="relative mx-auto flex h-full min-h-screen w-full max-w-[390px] flex-col overflow-hidden bg-background shadow-2xl md:min-h-[844px] md:rounded-3xl md:my-8">
            {children}
          </div>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
