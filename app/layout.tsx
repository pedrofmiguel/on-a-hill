import type { Metadata } from "next";
import { Martian_Mono } from "next/font/google";
import "./globals.css";
import SiteBackground from "./components/site/SiteBackground";
import SiteNav from "./components/site/SiteNav";
import Footer from "./components/site/Footer";
import Gate from "./components/gate/Gate";
import SmoothScroll from "./components/site/SmoothScroll";

// One face for the entire site, after the Brain Dead reference: monospace top
// to bottom, held at light-to-medium weights. The character comes from the
// fixed rhythm and the width, never from weight — nothing here is set heavier
// than 500, which is what separates this from a "bold Helvetica poster".
const martianMono = Martian_Mono({
  subsets: ["latin"],
  variable: "--font-martian-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pedroferreira.dev"),
  title: {
    default: "Pedro Ferreira — on a hill",
    template: "%s — Pedro Ferreira",
  },
  description:
    "Pedro Ferreira, frontend developer and designer. Websites that behave themselves — client work, product work, and side projects.",
  openGraph: {
    title: "Pedro Ferreira — on a hill",
    description:
      "Pedro Ferreira, frontend developer and designer. Websites that behave themselves — client work, product work, and side projects.",
    type: "website",
  },
};

// Runs during HTML parse, before the gate overlay is painted: returning
// visitors in this session skip the entrance animation with no flash.
// `?gate` forces the entrance to replay (handy for demos / testing).
const GATE_PREPAINT = `try{var f=/[?&]gate(=|&|$)/.test(location.search);if(!f&&sessionStorage.getItem('gate:entered')==='1'){document.documentElement.setAttribute('data-gate','done')}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${martianMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: GATE_PREPAINT }} />

        {/* Page sections — and the header — start hidden and wait for the
            entrance gate to hand off. With JS off nothing ever hands off, so
            pin them visible and give the nav links back their clicks. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}[data-nav-shell]{opacity:1!important}[data-nav-item]{pointer-events:auto!important}`}</style>
        </noscript>

        {/* Mounted before anything that locks the page, so the Lenis instance
            exists by the time the gate reaches for it. */}
        <SmoothScroll />

        <SiteBackground />
        <SiteNav />
        <main className="relative z-10">{children}</main>
        <Footer />

        <Gate />
      </body>
    </html>
  );
}
