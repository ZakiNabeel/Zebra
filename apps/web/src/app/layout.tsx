import type { Metadata, Viewport } from "next";
import { Baloo_2, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
});

const nastaliq = Noto_Nastaliq_Urdu({
  variable: "--font-nastaliq",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "Zebra — Safe Stories & Learning for Kids",
  description:
    "The safe, nourishing alternative to YouTube Kids. Stories, spellings, maths and morals for children under 12 — in Urdu and English.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // kid fingers double-tap; avoid accidental zoom in Kid Mode
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${baloo.variable} ${nastaliq.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
