import "./globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "@/components/providers";

export const metadata = {
  title: "Bill Tracker",
  description: "Track bills, due dates, and subscriptions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-900 text-slate-50">
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
