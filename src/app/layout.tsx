import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import "@mdxeditor/editor/style.css";
import { ClerkProvider } from "@/services/clerk/components/clerk-provider";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { UploadthingSSR } from "@/services/uploadthing/components/uploadthing-ssr";

const outfitSans = Outfit({
  variable: "--font-outfit-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dao Jobs",
  description:
    "Dao Jobs is a AI powered job board application built by Daniel Dao.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${outfitSans.className} antialiased font-sans`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableColorScheme
            disableTransitionOnChange
          >
            <Toaster />
            {children}
            <UploadthingSSR />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
