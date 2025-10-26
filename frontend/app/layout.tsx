import './globals.css'

export const metadata = {
  title: 'QuickPoll - Real-time Polling App',
  description: 'Create and vote on polls in real-time',
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
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">QuickPoll</h1>
            </div>
          </header>
          <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
          <footer className="mt-auto bg-white">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <p className="text-center text-sm text-gray-500">
                QuickPoll - Real-time polling made simple
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
