import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ToastNotifications from "@/components/common/toastNotifications/toastNotifications";

const sans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable}`}>
        {children}
        <ToastNotifications />
      </body>
    </html>
  );
}
