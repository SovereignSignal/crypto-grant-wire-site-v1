import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import type { ReactNode } from "react";

type SiteLayoutProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  showFooter?: boolean;
  includeNavbarOffset?: boolean;
};

export default function SiteLayout({
  children,
  className,
  contentClassName,
  showFooter = true,
  includeNavbarOffset = true,
}: SiteLayoutProps) {
  return (
    <div className={cn("min-h-screen flex flex-col bg-background text-foreground", className)}>
      <Navbar />
      <div
        className={cn(
          "flex-1",
          includeNavbarOffset ? "pt-16" : undefined,
          contentClassName,
        )}
      >
        {children}
      </div>
      {showFooter ? <Footer /> : null}
    </div>
  );
}
