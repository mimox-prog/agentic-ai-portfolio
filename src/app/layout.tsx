import "./globals.css";
import type { ReactNode } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "Marouan — Agentic AI Architect",
  description:
    "Agentic AI and automation systems for enterprises. Autonomous agents, orchestration platforms, and compliance automation with high-performance UI.",
  icons: { icon: "/favicon.ico" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Marouan — Agentic AI Architect",
    description:
      "Enterprise-ready agentic AI, orchestration, and automation systems with transparent metrics and stunning, accessible UI.",
    url: "https://your-domain.com",
    siteName: "Agentic AI Portfolio",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Agentic AI Portfolio" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Marouan — Agentic AI Architect",
    description:
      "Autonomous agents, compliance automation, multi-agent orchestration. Measurable impact with uptime, latency, and ROI.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased bg-neutral-950 text-neutral-100 selection:bg-cyan-500/30`}
      >
        <header
          role="banner"
          className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-neutral-950/70 backdrop-blur-lg"
        >
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
            <a
              aria-label="Go to homepage"
              href="/"
              className="text-sm font-bold tracking-wide text-neutral-100 hover:text-cyan-300 transition"
            >
              Marouan — Agentic AI
            </a>
            <nav aria-label="Primary" className="flex items-center gap-6 text-sm">
              <a href="/" className="nav-link">Home</a>
              <a href="/projects" className="nav-link">Projects</a>
              <a href="/services" className="nav-link">Services</a>
              <a href="/about" className="nav-link">About</a>
              <a href="/blog" className="nav-link">Blog</a>
              <a href="/contact" className="nav-link">Contact</a>
            </nav>
          </div>
        </header>

        <main role="main" className="pt-24">{children}</main>

        <footer role="contentinfo" className="mt-24 border-t border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-10 grid gap-8 md:grid-cols-3 text-sm text-neutral-300">
            <div>
              <div className="font-semibold text-neutral-100 mb-2">Marouan — Agentic AI</div>
              <p>Enterprise-grade agentic systems. Autonomy with governance, speed with transparency.</p>
            </div>
            <div>
              <div className="font-semibold text-neutral-100 mb-2">Explore</div>
              <ul className="space-y-2">
                <li><a className="footer-link" href="/projects">Projects</a></li>
                <li><a className="footer-link" href="/services">Services</a></li>
                <li><a className="footer-link" href="/blog">Blog</a></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-neutral-100 mb-2">Connect</div>
              <ul className="space-y-2">
                <li><a className="footer-link" href="mailto:hello@yourdomain.com">Email</a></li>
                <li><a className="footer-link" href="https://linkedin.com/in/your">LinkedIn</a></li>
                <li><a className="footer-link" href="https://github.com/your">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className={`${jetbrains.className} text-center text-xs text-neutral-500 pb-6`}>
            © {new Date().getFullYear()} Marouan. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
