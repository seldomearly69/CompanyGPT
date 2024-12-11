import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { ChatProvider } from "@/context/ChatContext";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontHeading = localFont({
  src: "../fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "Company-GPT",
  description: "Chatgpt for Companies",
  icons: {
    icon: "/assets/images/company-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background from-gray-100 via-blue-50 to-gray-200 font-sans antialiased overflow-hidden",
          fontSans.variable,
          fontHeading.variable
        )}
        suppressHydrationWarning
      >
        <ChatProvider>
          {children}
          <Toaster />
        </ChatProvider>
      </body>
    </html>
  );
}