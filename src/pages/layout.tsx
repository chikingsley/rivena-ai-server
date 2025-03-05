import '@livekit/components-styles';
import './globals.css';
// We need to replace next/font with a different font solution for Vite
// For now, we'll use a simple import of the font CSS

// Using CSS variables for the font instead of Next.js font module
const publicSans400 = {
  className: 'font-public-sans',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${publicSans400.className}`}>
      <body className="h-full">{children}</body>
    </html>
  );
}
