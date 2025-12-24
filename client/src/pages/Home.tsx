import { Link } from "wouter";
import { ArrowRight, Mail, Send, ArrowUpRight, Vote, Trophy, Rocket, Coins, FileText, Wrench, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteLayout from "@/components/SiteLayout";

const covered = [
  {
    icon: Vote,
    title: "Governance & Treasury",
    description: "Proposal outcomes, treasury allocations, and governance votes that move capital.",
  },
  {
    icon: Trophy,
    title: "Grant Programs",
    description: "Who got funded and what happened. Grant round outcomes and program retrospectives.",
  },
  {
    icon: Rocket,
    title: "Funding Opportunities",
    description: "Active programs accepting applications. Grant rounds, ecosystem funds, RFPs, and bounties.",
  },
  {
    icon: Coins,
    title: "Incentives",
    description: "Performance-based reward programs and liquidity incentives across protocols.",
  },
  {
    icon: FileText,
    title: "Research & Analysis",
    description: "Reports on quadratic funding, retroactive public goods, and token incentive design.",
  },
  {
    icon: Wrench,
    title: "Tools & Infrastructure",
    description: "Platforms that support the grants ecosystem — dashboards, management tools, and more.",
  },
];

const notCovered = [
  "VC fundraises (seed rounds, Series A, etc.)",
  "Product launches unless tied to funding",
  "General crypto news (price action, listings)",
  "Job postings",
];

export default function Home() {
  return (
    <SiteLayout includeNavbarOffset={false} showFooter={true}>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img src="/images/image.png" alt="" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto px-6 pt-24 pb-32">
          <div className="flex flex-col items-center text-center">
            {/* Signal indicator */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/50 bg-background/70 backdrop-blur-md mb-10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-primary tracking-wide uppercase">Signal Active</span>
            </div>

            <img
              src="/images/cgw-logo-solo.png"
              alt="Crypto Grant Wire"
              className="w-24 h-24 md:w-32 md:h-32 mb-6 drop-shadow-2xl"
            />

            {/* Logo text */}
            <h1 className="text-5xl md:text-7xl font-bold mb-8 drop-shadow-2xl">
              <span className="text-primary">Crypto</span>
              <span className="text-foreground">Grant</span>
              <span className="text-primary">Wire</span>
            </h1>

            {/* Tagline */}
            <p className="text-lg md:text-xl text-foreground/90 max-w-xl text-pretty leading-relaxed mb-12 drop-shadow-lg">
              A curated intelligence feed tracking crypto grants and funding. DAO treasury decisions, grant program
              updates, funding opportunities, and ecosystem developments — so you don't have to.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button
                asChild
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 gap-2 shadow-lg shadow-primary/25"
              >
                <a href="https://sovereignsignal.substack.com" target="_blank" rel="noopener noreferrer">
                  <Mail className="w-4 h-4" />
                  Weekly Report
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-foreground/30 text-foreground hover:bg-foreground/10 bg-background/60 backdrop-blur-md px-8 gap-2"
              >
                <a href="https://t.me/cryptograntwire" target="_blank" rel="noopener noreferrer">
                  <Send className="w-4 h-4" />
                  Real-Time Feed
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Products Section - How to Follow */}
      <section className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center text-foreground mb-4">How to Follow</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
            Get funding intelligence through two channels, each designed for different workflows.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Weekly Report */}
            <a
              href="https://sovereignsignal.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-8 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card/80 transition-all"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Weekly Report</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                A curated summary of the week's most important funding developments. Published every week on Substack.
              </p>
              <span className="text-sm text-primary font-medium">Subscribe on Substack</span>
            </a>

            {/* Real-Time Feed */}
            <a
              href="https://t.me/cryptograntwire"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-8 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-accent/50 hover:bg-card/80 transition-all"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center">
                  <Send className="w-6 h-6 text-accent" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Real-Time Feed</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Updates as they happen throughout the week. The Telegram channel delivers news the moment it breaks.
              </p>
              <span className="text-sm text-accent font-medium">Join on Telegram</span>
            </a>
          </div>
        </div>
      </section>

      {/* Coverage Section - What I Cover */}
      <section className="py-24 px-6 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center text-foreground mb-4">What I Cover</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
            Focused coverage on the funding side of crypto. Everything builders need to find and track capital.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {covered.map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm hover:border-primary/40 transition-colors"
              >
                <item.icon className="w-5 h-5 text-primary mb-4" />
                <h3 className="text-base font-medium text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-xl border border-accent/30 bg-accent/10">
            <h3 className="text-sm font-medium text-accent uppercase tracking-wide mb-4">Not Covered</h3>
            <div className="flex flex-wrap gap-3">
              {notCovered.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/60 border border-accent/30 text-sm text-muted-foreground"
                >
                  <X className="w-3 h-3 text-accent/70" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
