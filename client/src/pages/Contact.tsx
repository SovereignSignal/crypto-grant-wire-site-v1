import { Mail, MessageCircle, Send } from "lucide-react";
import SiteLayout from "@/components/SiteLayout";

export default function Contact() {
  return (
    <SiteLayout>
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Get in <span className="text-primary">Touch</span>
          </h1>
          <p className="text-muted-foreground text-center mb-12">
            Have a tip, question, or want to collaborate? Reach out through any of these channels.
          </p>

          <div className="grid gap-4">
            <a
              href="https://t.me/sovereignsignal"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-5 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Send className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Telegram</h3>
                <p className="text-sm text-muted-foreground">@sovereignsignal — DMs open</p>
              </div>
            </a>

            <a
              href="https://x.com/sovereignsignal"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-5 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  X (Twitter)
                </h3>
                <p className="text-sm text-muted-foreground">@sovereignsignal — DMs open</p>
              </div>
            </a>

            <a
              href="mailto:sov@cryptograntwire.com"
              className="group flex items-center gap-4 p-5 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Email</h3>
                <p className="text-sm text-muted-foreground">sov@cryptograntwire.com</p>
              </div>
            </a>
          </div>

          <div className="mt-12 p-6 bg-card border border-border rounded-xl text-center">
            <h3 className="font-semibold text-foreground mb-2">Submit a Tip</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Know about a grant program, funding round, or governance update that should be on the wire?
            </p>
            <a
              href="https://t.me/sovereignsignal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Send className="w-4 h-4" />
              Send a Tip
            </a>
          </div>
        </div>
      </main>
    </SiteLayout>
  );
}
