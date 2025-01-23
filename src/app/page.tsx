import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      {/* Left side - Image */}
      <div className="w-full md:w-1/2 relative">
        <Image src="/banner.png" alt="Chat banner" layout="fill" objectFit="cover" priority />
      </div>

      {/* Right side - Content */}
      <div className="w-full md:w-1/2 flex flex-col justify-between p-8">
        <header>
          <Link href="/" className="flex items-center space-x-2">
            <MessageCircle size={32} />
            <span className="text-2xl font-bold">Chaap</span>
          </Link>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center space-y-8">
          <h1 className="text-4xl font-bold text-center">Welcome to Chapp</h1>
          <p className="text-xl text-center max-w-md">Connect with friends!</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </main>

        <footer className="text-center text-sm text-gray-500">
          © 2025 Chapp. All rights reserved.
        </footer>
      </div>
    </div>
  )
}
