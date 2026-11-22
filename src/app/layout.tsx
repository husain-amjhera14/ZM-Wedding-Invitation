import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  Great_Vibes,
  Cinzel,
  Plus_Jakarta_Sans,
  Amiri,
} from "next/font/google";
import "./globals.css";
import { WEDDING } from "@/lib/invitation";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-script",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#4f0a1d",
  width: "device-width",
  initialScale: 1,
};

function getSiteBaseUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) {
    return new URL(explicit.startsWith("http") ? explicit : `https://${explicit}`);
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }
  if (process.env.URL) {
    return new URL(process.env.URL);
  }
  return new URL("http://localhost:3000");
}

export const metadata: Metadata = {
  metadataBase: getSiteBaseUrl(),
  title: `${WEDDING.bride.name} & ${WEDDING.groom.name} — Wedding Invitation`,
  description: `${WEDDING.bride.parents} solicit the honour of your presence at the wedding of ${WEDDING.bride.name} & ${WEDDING.groom.name} on ${WEDDING.event.fullDate} at ${WEDDING.venue.fullAddress}.`,
  icons: {
    icon: "/images/zm-monogram.svg",
  },
  openGraph: {
    type: "website",
    title: `${WEDDING.bride.name} & ${WEDDING.groom.name} — Wedding Invitation`,
    description: `Tuesday, 12th Jan 2027 (5 Shaban Al Karim 1448 H) • Dinner 8:00 P.M. at Siyaganj Jamat Khana, Indore.`,
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${WEDDING.bride.name} & ${WEDDING.groom.name} — Wedding Invitation`,
    description: `Tuesday, 12th Jan 2027 • Dinner 8:00 P.M. at Siyaganj Jamat Khana, Indore.`,
    images: ["/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${greatVibes.variable} ${cinzel.variable} ${jakarta.variable} ${amiri.variable}`}
    >
      <body className="antialiased selection:bg-[#5e0e24] selection:text-[#faf7f2]">
        {children}
      </body>
    </html>
  );
}
