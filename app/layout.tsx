import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Schrijfmaat — schrijven dat bij jou past",
  description: "Een schrijfcoach die helpt je tekst duidelijker te maken en jouw eigen schrijfstijl te behouden."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}