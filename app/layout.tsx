import './globals.css'
import type { ReactNode } from 'react'
// import { WagmiConfig } from 'wagmi'
// import { wagmiClient } from '../lib/wagmi'
import Link from 'next/link'
import Providers from './providers'

export const metadata = {
  title: 'ElementPay Frontend Assessment',
  description: 'Assessment app'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="container">
            <header className="header">
              <div>
                <h1 className="text-2xl font-bold">ElementPay — Frontend Assessment</h1>
                <p className="text-sm text-slate-600">Next.js + TypeScript — Wallets, Polling, Webhooks</p>
              </div>
              <nav className="nav text-sm">
                <Link href="/" className="mr-4">Home</Link>
                <Link href="/wallet" className="mr-4">Wallet</Link>
                <Link href="/order" className="mr-4">Order</Link>
              </nav>
            </header>

            <main>
              {children}
            </main>

            <footer className="mt-8 text-sm text-slate-500">Made for ElementPay assessment</footer>
          </div>
        </Providers>
      </body>
    </html>
  )
}
