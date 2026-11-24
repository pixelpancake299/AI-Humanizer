import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Humanizer — schrijven op jouw manier",
  description: "Een persoonlijke schrijfcoach die helpt je tekst duidelijker te maken en jouw eigen schrijfstijl te behouden."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}