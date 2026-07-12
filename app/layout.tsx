import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = { title: "Atçylyk portaly", description: "Ahalteke atlarynyň hakyky nesil maglumatlaryny sanly dolandyryş ulgamy" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="tk" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}><body className="flex min-h-full flex-col">{children}</body></html>; }
