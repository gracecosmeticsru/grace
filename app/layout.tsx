import type { Metadata } from "next";
import "./globals.css";
import StoreShell from '@/components/store-shell';

export const metadata: Metadata = {
  title: {default: "Grace Cosmetics — косметика и парфюмерия", template: "%s | Grace Cosmetics"},
  description: "Каталог косметики и парфюмерии Grace Cosmetics. Выберите свой оттенок, объём и ежедневный уход.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased"><StoreShell>{children}</StoreShell></body>
    </html>
  );
}
