import { Link } from "wouter";
import { ArrowRight, Radio, Mail, ExternalLink, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function LatestEntries() {
  const { data: entries, isLoading } = trpc.grants.recent.useQuery({ limit: 3 });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card/50 border border-border rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-4" />
            <div className="h-3 bg-muted rounded w-1/2 mb-6" />
            <div className="h-10 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No entries available yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="group bg-card/50 backdrop-blur-sm border border-border rounded-xl overflow-hidden hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10"
        >
          <div className="p-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Calendar className="w-3 h-3" />
              <span>{entry.publishedAt ? new Date(entry.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
            </div>
            <h3 className="font-display text-lg font-semibold mb-3 group-hover:text-orange-500 transition-colors line-clamp-2">
              {entry.title}
            </h3>
            {entry.category && (
              <span className="inline-block px-3 py-1 text-xs bg-orange-500/10 text-orange-500 rounded-full mb-4">
                {entry.category}
              </span>
            )}
            {entry.tags && typeof entry.tags === 'string' && entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {entry.tags.split(',').slice(0, 3).map((tag: string, idx: number) => (
                  <span key={idx} className="text-xs px-2 py-0.5 bg-muted/50 text-muted-foreground rounded">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
            <a
              href={entry.sourceUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-orange-500 hover:text-orange-400 transition-colors font-medium"
            >
              View Source
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

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
      <Navbar />

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
          <div className="flex justify-center">
            <img src="/CGWLogoName.png" alt="Crypto Grant Wire" className="h-40 md:h-56 lg:h-64 w-auto" />
          </div>
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

      {/* Latest Grant Wires Section */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Latest Grant Wires
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Fresh intelligence from the crypto grants ecosystem
            </p>
          </div>

          <LatestEntries />

          <div className="text-center mt-12">
            <Link
              href="/archive"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 hover:border-orange-500/40 rounded-lg text-orange-500 transition-all duration-300 font-medium"
            >
              View All Entries
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Distribution Channels Section */}
      <section className="py-24">
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
                href="https://t.me/cryptograntwire"
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

      <Footer />
    </div>
  );
}
