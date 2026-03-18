import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClipBattle",
  description: "Gaming Clips gegeneinander antreten lassen"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-black text-white antialiased">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.18),transparent_30%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.14),transparent_25%),radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_35%)]" />
        {children}
      </body>
    </html>
  );
}