import { Geist_Mono, Manrope, Sora } from "next/font/google";
import "./globals.css";

const bodySans = Manrope({
  variable: "--font-body-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const displaySans = Sora({
  variable: "--font-display-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "3D Wardrobe",
  description: "Virtual 3D clothing try-on",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${bodySans.variable} ${displaySans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
