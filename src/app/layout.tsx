import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MotionHub — motion effects, ready to remix",
  description:
    "A bilingual gallery of web motion & WebGL demos. Copy the AI prompt and generate your own effect.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
