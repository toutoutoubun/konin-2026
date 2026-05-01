import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '高認パス | 高卒認定試験 過去問頻出分析',
  description: '高卒認定試験の過去問頻出傾向を科目別に可視化し、英語PDFのブラウザ内分析を提供するWebツール',
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='32' fill='%23FFD166'/%3E%3Ctext x='32' y='39' text-anchor='middle' font-size='22' font-family='serif' fill='%231A1A1A'%3EKP%3C/text%3E%3C/svg%3E"
  }
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
