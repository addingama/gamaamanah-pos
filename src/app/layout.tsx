import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Toko Sembako",
  description: "Aplikasi internal toko sembako (admin + cek harga).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
