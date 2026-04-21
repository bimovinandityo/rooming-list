import type { Metadata } from "next";
import { Providers } from "./providers";
import { AgentationProvider } from "./AgentationProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rooming List",
  description: "Rooming list management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>
        <Providers>{children}</Providers>
        <AgentationProvider />
      </body>
    </html>
  );
}
