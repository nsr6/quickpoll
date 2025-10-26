import './globals.css'
import Image from 'next/image'

export const metadata = {
  title: 'QuickPoll - Real-time Polling App',
  description: 'Create and vote on polls in real-time',
  icons: {
    icon: '/icon.png',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-gray-50">
        <div className="flex min-h-full flex-col">
          <header className="bg-white shadow">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <Image
                  src="/icon.png"
                  alt="QuickPoll Logo"
                  width={36}
                  height={36}
                  className="rounded-lg"
                />
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">QuickPoll</h1>
              </div>
            </div>
          </header>
          <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
          <footer className="mt-auto bg-white">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <p className="text-center text-sm text-gray-500">
                QuickPoll - Real-time opinion polling platform
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
