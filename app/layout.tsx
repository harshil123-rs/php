import "@/app/globals.css";
import { ReactNode } from "react";
import { GoogleMapsProvider } from "@/components/GoogleMapsProvider";

export const metadata = {
  title: "HealthVault",
  description: "Personal health record management dashboard"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <GoogleMapsProvider>
      <html lang="en" className="dark">
        <body className="bg-background text-foreground antialiased">
          {children}
        </body>
      </html>
    </GoogleMapsProvider>
  );
}
