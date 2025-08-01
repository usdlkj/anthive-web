import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "KCIC Middleware",
  description: "KCIC Middleware",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-white text-kcicBlack">
      <body className="bg-[#F4F4F4] font-sans min-h-screen">
        <div className="flex flex-col min-h-screen">
          <Toaster />
          <main className="flex-1 container mx-auto px-4 py-6">
            {children}
          </main>
          {/* <Footer /> */}
        </div>
      </body>
    </html>
  );
}
