import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 pt-32 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
            <p className="text-xl text-muted-foreground">
              Connect with Sov or submit grant program updates and funding opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* About Section */}
            <Card className="p-8 bg-card/50 backdrop-blur-sm border-border">
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <p className="text-muted-foreground leading-relaxed">
                I've been tracking crypto grants and funding mechanisms for years. The Grant Wire is how I share what I learn with builders, grant managers, and anyone navigating the funding landscape.
              </p>
            </Card>

            {/* Connect Section */}
            <Card className="p-8 bg-card/50 backdrop-blur-sm border-border">
              <h2 className="text-2xl font-bold mb-4">Connect</h2>
              <div className="space-y-4">
                <a
                  href="https://twitter.com/sovereignsignal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-orange-500 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                    <span className="text-xl">𝕏</span>
                  </div>
                  <div>
                    <div className="font-semibold">X (Twitter)</div>
                    <div className="text-sm">@sovereignsignal</div>
                  </div>
                </a>

                <a
                  href="https://t.me/cryptograntwire"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-orange-500 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                    <span className="text-xl">📡</span>
                  </div>
                  <div>
                    <div className="font-semibold">Telegram Feed</div>
                    <div className="text-sm">t.me/cryptograntwire</div>
                  </div>
                </a>

                <a
                  href="https://sovereignsignal.substack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-orange-500 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                    <span className="text-xl">📰</span>
                  </div>
                  <div>
                    <div className="font-semibold">Substack</div>
                    <div className="text-sm">sovereignsignal.substack.com</div>
                  </div>
                </a>
              </div>
            </Card>
          </div>

          {/* Submit a Tip Section */}
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-border">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold">Submit a Tip</h2>
            </div>

            <p className="text-muted-foreground mb-6">
              Share grant program updates, funding opportunities, or ecosystem developments that should be covered in the Grant Wire.
            </p>

            <a
              href="https://www.notion.so/sovs/13b000c0d59080cf8a88f085c7437552?v=13b000c0d59080d69f72000cca70d4ae"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button size="lg" className="w-full md:w-auto bg-orange-500 hover:bg-orange-600">
                <Send className="w-4 h-4 mr-2" />
                Submit a Tip
              </Button>
            </a>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
