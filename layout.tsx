import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RailSync — Intelligent Railway Reservation",
  description: "A modern railway reservation and management prototype.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
