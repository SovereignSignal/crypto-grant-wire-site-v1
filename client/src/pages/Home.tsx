import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Satellite, TrendingUp, DollarSign, Zap, FileText, Wrench } from "lucide-react";
import { Link } from "wouter";

const categories = [
  {
    icon: TrendingUp,
    name: "Governance & Treasury",
    description: "Proposal outcomes, treasury allocations, and governance votes that move capital.",
  },
  {
    icon: DollarSign,
    name: "Grant Programs",
    description: "Grant round outcomes, milestone completions, program retrospectives, and funding data.",
  },
  {
    icon: Satellite,
    name: "Funding Opportunities",
    description: "Active programs accepting applications. Grant rounds, ecosystem funds, RFPs, and bounties.",
  },
  {
    icon: Zap,
    name: "Incentives",
    description: "Performance-based reward programs and liquidity incentives with distribution updates.",
  },
  {
    icon: FileText,
    name: "Research & Analysis",
    description: "Reports and analysis on funding mechanisms, quadratic funding, and retroactive public goods.",
  },
  {
    icon: Wrench,
    name: "Tools & Infrastructure",
    description: "Platforms and resources that support the grants ecosystem and help builders find funding.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{ backgroundImage: "url('/images/hero_satellite_array.png')" }}
        />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        
        {/* Content */}
        <div className="relative z-10 container text-center px-4 py-20">
          <div className="inline-flex items-center gap-2 mb-6 text-primary">
            <Satellite className="w-8 h-8" />
            <span className="text-sm font-mono tracking-wider">SIGNAL ACTIVE</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
            Sov's Crypto Grant Wire
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Curated intelligence on crypto grants and funding
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="glow-orange text-lg px-8 py-6"
              asChild
            >
              <a href="https://sovereignsignal.substack.com" target="_blank" rel="noopener noreferrer">
                📰 Weekly Report
              </a>
            </Button>
            
            <Button 
              size="lg" 
              variant="secondary"
              className="glow-cyan text-lg px-8 py-6"
              asChild
            >
              <a href="https://t.me/cryptograntwire" target="_blank" rel="noopener noreferrer">
                ⚡ Real-Time Feed
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* What We Cover Section */}
      <section className="py-20 bg-card">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-4">What We Cover</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            The Grant Wire monitors DAO treasury decisions, grant program updates, funding opportunities, and ecosystem developments.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Card 
                  key={category.name}
                  className="p-6 hover:border-primary transition-colors bg-background/50 backdrop-blur"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How to Follow Section */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-12">How to Follow</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-8 bg-card border-2 hover:border-primary transition-colors">
              <div className="text-4xl mb-4">📰</div>
              <h3 className="text-2xl font-bold mb-4">Weekly Report</h3>
              <p className="text-muted-foreground mb-6">
                Every Friday, a curated summary of the week's most important funding developments on Substack.
              </p>
              <Button asChild className="w-full">
                <a href="https://sovereignsignal.substack.com" target="_blank" rel="noopener noreferrer">
                  Subscribe on Substack
                </a>
              </Button>
            </Card>
            
            <Card className="p-8 bg-card border-2 hover:border-secondary transition-colors">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-4">Real-Time Feed</h3>
              <p className="text-muted-foreground mb-6">
                The Telegram channel delivers updates throughout the week as they happen.
              </p>
              <Button asChild variant="secondary" className="w-full">
                <a href="https://t.me/cryptograntwire" target="_blank" rel="noopener noreferrer">
                  Join Telegram
                </a>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* What We Don't Cover Section */}
      <section className="py-20 bg-card">
        <div className="container max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-8">What We Don't Cover</h2>
          <div className="space-y-3 text-muted-foreground">
            <p className="flex items-start gap-3">
              <span className="text-destructive mt-1">✕</span>
              <span><strong>VC fundraises</strong> — Seed rounds, Series A, etc. are out of scope</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-destructive mt-1">✕</span>
              <span><strong>Product launches</strong> — New protocols or features unless tied to funding programs</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-destructive mt-1">✕</span>
              <span><strong>General crypto news</strong> — Price action, exchange listings, regulatory news</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-destructive mt-1">✕</span>
              <span><strong>Job postings</strong> — Unless part of a grants/ecosystem program</span>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-6">Start Tracking Funding Intelligence</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Browse the complete archive of grant wire entries, search by category, and discover funding opportunities.
          </p>
          <Button size="lg" asChild className="text-lg px-8 py-6">
            <Link href="/archive">
              Browse Archive →
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-card">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Satellite className="w-5 h-5 text-primary" />
                Grant Wire
              </h3>
              <p className="text-sm text-muted-foreground">
                Curated intelligence on crypto grants and funding opportunities.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
                <li><Link href="/archive" className="text-muted-foreground hover:text-primary transition-colors">Archive</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://twitter.com/sovereignsignal" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    𝕏 @sovereignsignal
                  </a>
                </li>
                <li>
                  <a href="https://t.me/cryptograntwire" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    📡 Telegram
                  </a>
                </li>
                <li>
                  <a href="https://sovereignsignal.substack.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    📰 Substack
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground pt-8 border-t border-border">
            <p>Curated by Sov • {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
