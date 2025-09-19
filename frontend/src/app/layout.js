import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// The themeColor has been removed from here
export const metadata = {
  title: "CDEWS - Crop Disease Warning System",
  description: "AI-powered crop disease detection.",
  manifest: "/manifest.json",
};

// A new viewport export has been added to hold the themeColor
export const viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}