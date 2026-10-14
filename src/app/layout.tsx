import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PHASE | Serverless Magnet-to-Native OTT Streaming & Download Engine",
  description:
    "JioHotstar & Netflix style UI powered by a Sequential Magnet/Torrent Piece-Assembler and Open-Source Archive.org WebSeeds."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#07090e] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
