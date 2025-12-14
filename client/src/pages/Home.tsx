import { Link } from "wouter";
import { ArrowRight, Radio, Mail, ExternalLink } from "lucide-react";

const categories = [
  {
    name: "Governance & Treasury",
    description: "Proposal outcomes, treasury allocations, and governance votes that move capital."
  },
  {
    name: "Grant Programs",
    description: "Who got funded and what happened. Grant round outcomes, milestone completions, and program retrospectives."
  },
  {
    name: "Funding Opportunities",
    description: "Active programs accepting applications. Grant rounds, ecosystem funds, RFPs, and bounties."
  },
  {
    name: "Incentives",
    description: "Performance-based reward programs and liquidity incentives where rewards follow on-chain activity."
  },
  {
    name: "Research & Analysis",
    description: "Reports and analysis on funding mechanisms, quadratic funding, retroactive public goods, and token incentive design."
  },
  {
    name: "Tools & Infrastructure",
    description: "Platforms and resources that support the grants ecosystem. Application tools, funding dashboards, and grant management software."
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/CGWLogoSolo.png" alt="Crypto Grant Wire" className="h-10 w-auto" />
            <span className="font-display text-xl font-bold">
              <span className="text-orange-500">Crypto</span>{" "}
              <span className="text-foreground">Grant</span>{" "}
              <span className="text-orange-500">Wire</span>
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm hover:text-orange-500 transition-colors">
              Home
            </Link>
            <Link href="/archive" className="text-sm hover:text-orange-500 transition-colors">
              Archive
            </Link>
            <Link href="/contact" className="text-sm hover:text-orange-500 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: "url(/hero-bg-logo.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background/80" />

        <div className="relative z-10 container mx-auto px-4 text-center pt-24 pb-16">
          {/* Signal Active Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-12 animate-pulse">
            <Radio className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-mono text-orange-500 uppercase tracking-wider">
              Signal Active
            </span>
          </div>

          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <img src="/CGWLogoName.png" alt="Crypto Grant Wire" className="h-24 md:h-32 w-auto" />
          </div>

          <p className="text-xl md:text-2xl text-muted-foreground mb-16 max-w-3xl mx-auto">
            Curated intelligence on crypto grants and funding
          </p>

          {/* Simple Text Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8 text-lg">
            <a
              href="https://sovereignsignal.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-orange-500 transition-colors group"
            >
              <Mail className="w-5 h-5 group-hover:text-orange-500" />
              <span>Weekly Report</span>
              <ExternalLink className="w-4 h-4 opacity-50" />
            </a>
            <span className="hidden sm:block text-muted-foreground/30">|</span>
            <a
              href="https://t.me/sovereignsignal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-cyan-400 transition-colors group"
            >
              <Radio className="w-5 h-5 group-hover:text-cyan-400" />
              <span>Real-Time Feed</span>
              <ExternalLink className="w-4 h-4 opacity-50" />
            </a>
          </div>

          {/* Archive Link */}
          <Link href="/archive" className="inline-flex items-center gap-2 text-sm text-muted-foreground/70 hover:text-orange-500 transition-colors">
            Browse Archive
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* What We Cover Section */}
      <section className="py-24 relative">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url(/cosmic_space_dark.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        />
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              What We Cover
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Tracking crypto grant opportunities across six key categories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {categories.map((category, index) => (
              <div
                key={index}
                className="group relative bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10"
              >
                <h3 className="font-display text-xl font-semibold mb-3 group-hover:text-orange-500 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {category.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Distribution Channels Section */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Stay Updated
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get grant wire intelligence delivered through your preferred channel
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Substack Card */}
            <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-8 h-8 text-orange-500" />
                <h3 className="font-display text-2xl font-bold">Weekly Report</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Comprehensive weekly roundup of crypto grant opportunities, funding trends, and analysis delivered to your inbox.
              </p>
              <a
                href="https://sovereignsignal.substack.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 font-medium transition-colors"
              >
                Subscribe on Substack
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Telegram Card */}
            <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <Radio className="w-8 h-8 text-cyan-500" />
                <h3 className="font-display text-2xl font-bold">Real-Time Feed</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Instant alerts on new grant announcements, funding opportunities, and breaking news in the crypto grants space.
              </p>
              <a
                href="https://t.me/sovereignsignal"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-cyan-500 hover:text-cyan-400 font-medium transition-colors"
              >
                Join Telegram Channel
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/CGWLogoSolo.png" alt="Crypto Grant Wire" className="h-8 w-auto" />
                <span className="font-display text-lg font-bold">
                  <span className="text-orange-500">Crypto</span> Grant Wire
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Curated intelligence on crypto grants and funding
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Navigation</h4>
              <div className="flex flex-col gap-2">
                <Link href="/" className="text-sm text-muted-foreground hover:text-orange-500 transition-colors">
                  Home
                </Link>
                <Link href="/archive" className="text-sm text-muted-foreground hover:text-orange-500 transition-colors">
                  Archive
                </Link>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-orange-500 transition-colors">
                  Contact
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex flex-col gap-2">
                <a
                  href="https://x.com/sovereignsignal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-orange-500 transition-colors inline-flex items-center gap-2"
                >
                  𝕏 @sovereignsignal
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://t.me/sovereignsignal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-orange-500 transition-colors inline-flex items-center gap-2"
                >
                  📡 Telegram
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://sovereignsignal.substack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-orange-500 transition-colors inline-flex items-center gap-2"
                >
                  📰 Substack
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Curated by{" "}
              <a
                href="https://x.com/sovereignsignal"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500 hover:text-orange-400 transition-colors"
              >
                Sov
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
