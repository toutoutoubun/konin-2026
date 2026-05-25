import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  title: '高認パス | 高卒認定試験 公式PDF傾向分析',
  description: 'ユーザーが正当に取得した高卒認定試験の公式PDFを端末内で解析し、出題傾向データを科目別に可視化するWebツール',
  icons: {
    // Wordmark-style favicon — matches the header logo change (review A-1):
    // dropped the round "KP" badge in favour of typography.
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='8' fill='%23F5F0E8'/%3E%3Crect x='3' y='3' width='58' height='58' rx='6' fill='none' stroke='%231A1A1A' stroke-width='3'/%3E%3Ctext x='32' y='42' text-anchor='middle' font-size='28' font-family='serif' font-weight='bold' fill='%231A1A1A'%3E高%3C/text%3E%3C/svg%3E"
  }
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
