import "@/app/globals.css";
import { ReactNode } from "react";


export const metadata = {
  title: "HealthVault",
  description: "Personal health record management dashboard"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
