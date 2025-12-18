import { Link } from "wouter";
import { ArrowRight, Radio, Mail, ExternalLink, Calendar, ArrowUpRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import SiteLayout from "@/components/SiteLayout";
import { motion } from "framer-motion";

function LatestEntries() {
  const { data: entries, isLoading } = trpc.grants.recent.useQuery({ limit: 3 });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card rounded-xl p-6 h-[280px] animate-pulse">
            <div className="h-4 bg-muted/50 rounded w-3/4 mb-4" />
            <div className="h-3 bg-muted/50 rounded w-1/2 mb-6" />
            <div className="h-10 bg-muted/50 rounded mt-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        No entries available yet.
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
    >
      {entries.map((entry) => (
        <motion.div
          key={entry.id}
          variants={item}
          className="group glass-card rounded-xl overflow-hidden flex flex-col h-full relative"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500/0 via-orange-500/50 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="p-6 flex-1 flex flex-col">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              <Calendar className="w-3 h-3 text-orange-500" />
              <span className="uppercase tracking-wider font-medium">
                {entry.publishedAt ? new Date(entry.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
              </span>
            </div>

            <h3 className="font-display text-xl font-semibold mb-3 group-hover:text-orange-500 transition-colors line-clamp-2 leading-tight">
              {entry.title}
            </h3>

            {entry.category && (
              <div className="mb-6">
                <span className="inline-flex px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-md">
                  {entry.category}
                </span>
              </div>
            )}

            <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
              {entry.tags && typeof entry.tags === 'string' && entry.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {entry.tags.split(',').slice(0, 2).map((tag: string, idx: number) => (
                    <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-muted/30 text-muted-foreground rounded border border-border/50">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              ) : <div />}

              {entry.sourceUrl && (
                <a
                  href={entry.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-orange-500 transition-colors"
                >
                  Source <ArrowUpRight className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

const categories = [
  {
    name: "Governance & Treasury",
    description: "Proposal outcomes, treasury allocations, and governance votes that move capital."
  },
  {
    name: "Grant Programs",
    description: "Who got funded and what happened. Grant round outcomes, milestone completions, and retrospectives."
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
    description: "Reports and analysis on funding mechanisms, quadratic funding, and token incentive design."
  },
  {
    name: "Tools & Infrastructure",
    description: "Platforms and resources that support the grants ecosystem. Application tools and funding dashboards."
  },
];

export default function Home() {
  return (
    <SiteLayout includeNavbarOffset={false}>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Deep Field Background */}
        <div
          className="absolute inset-0 bg-background"
          style={{
            backgroundImage: "url(/hero-bg-logo.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />

        <div className="relative z-10 container mx-auto px-4 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center text-center max-w-4xl mx-auto"
          >
            {/* Signal Active Badge */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-12 backdrop-blur-sm"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
              </span>
              <span className="text-sm font-mono text-orange-500 uppercase tracking-widest font-semibold">
                Signal Active
              </span>
            </motion.div>

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mb-8"
            >
              <img src="/CGWLogoName.png" alt="Crypto Grant Wire" className="h-32 md:h-48 lg:h-56 w-auto drop-shadow-2xl" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl md:text-2xl text-muted-foreground/80 font-light max-w-2xl leading-relaxed"
            >
              The definitive intelligence layer for crypto grants, funding opportunities, and treasury governance.
            </motion.p>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <div className="w-[1px] h-16 bg-gradient-to-b from-orange-500/0 via-orange-500/50 to-orange-500/0 animate-pulse" />
        </motion.div>
      </section>

      {/* What We Cover Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/5 -skew-y-3 transform origin-top-left scale-110" />

        <div className="relative z-10 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">Intelligence Vectors</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Comprehensive coverage across six critical funding primitives
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative glass-card p-8 rounded-xl"
              >
                <div className="absolute top-6 right-6 text-orange-500/20 group-hover:text-orange-500/40 transition-colors">
                  <div className="w-8 h-8 rounded-full border border-current flex items-center justify-center font-mono text-sm">
                    0{index + 1}
                  </div>
                </div>
                <h3 className="font-display text-xl font-semibold mb-3 group-hover:text-orange-500 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {category.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Grant Wires Section */}
      <section className="py-24 bg-card/30 border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
            <div className="text-center md:text-left">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
                Latest <span className="text-orange-500">Wires</span>
              </h2>
              <p className="text-muted-foreground">
                Fresh intelligence from the ecosystem
              </p>
            </div>

            <Link
              href="/archive"
              className="group inline-flex items-center gap-2 px-6 py-2.5 bg-background/50 hover:bg-orange-500/10 border border-border/50 hover:border-orange-500/30 rounded-full text-foreground hover:text-orange-500 transition-all duration-300 text-sm font-medium"
            >
              View Archive
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <LatestEntries />
        </div>
      </section>

      {/* Distribution Channels Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Stay <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Connected</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Substack Card */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="group bg-gradient-to-br from-orange-950/20 to-background border border-orange-500/10 hover:border-orange-500/30 rounded-2xl p-8 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-full bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="font-display text-2xl font-bold">Weekly Report</h3>
              </div>
              <p className="text-muted-foreground mb-8 min-h-[48px]">
                Comprehensive weekly roundup of crypto grant opportunities and analysis delivered to your inbox.
              </p>
              <a
                href="https://sovereignsignal.substack.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-foreground font-medium hover:text-orange-500 transition-colors"
              >
                Subscribe on Substack
                <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>

            {/* Telegram Card */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="group bg-gradient-to-br from-cyan-950/20 to-background border border-cyan-500/10 hover:border-cyan-500/30 rounded-2xl p-8 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-full bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-colors duration-300">
                  <Radio className="w-6 h-6" />
                </div>
                <h3 className="font-display text-2xl font-bold">Real-Time Feed</h3>
              </div>
              <p className="text-muted-foreground mb-8 min-h-[48px]">
                Instant alerts on new grant announcements, funding opportunities, and breaking news.
              </p>
              <a
                href="https://t.me/cryptograntwire"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-foreground font-medium hover:text-cyan-500 transition-colors"
              >
                Join Telegram Channel
                <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

    </SiteLayout>
  );
}
