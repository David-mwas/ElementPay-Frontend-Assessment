import Link from 'next/link'

export default function Home() {
  return (
    <main className='mt-32'>
      {/* <h1 className="text-2xl font-bold mb-4">ElementPay — Frontend Assessment</h1> */}
      <p className="mb-4 font-semibold">Use the links below to open Wallet and Order pages.</p>
      <ul className="space-y-2">
        <li><Link href="/wallet" className="text-blue-600">Wallet (connect/disconnect)</Link></li>
        <li><Link href="/order" className="text-blue-600">Order (create & watch status)</Link></li>
      </ul>
    </main>
  )
}
