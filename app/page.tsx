import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0099cc]/10 via-transparent to-[#0077aa]/5" />
        
        <div className="max-w-5xl mx-auto px-4 py-20 text-center relative">
          <div className="inline-block mb-4">
            <span className="text-5xl animate-pulse">⚡</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-[#0099cc] to-[#0077aa] bg-clip-text text-transparent">
              FastMind
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Lightning-fast document writing and organization. 
            Inspired by Yamaha FZ25 Aqua Blue — sleek, powerful, and efficient.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link
              href="/documents"
              className="bg-gradient-to-r from-[#0099cc] to-[#0077aa] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-[#0099cc]/30 transition-all"
            >
              Get Started
            </Link>
            <Link
              href="/documents/new"
              className="border-2 border-[#0099cc] text-[#0099cc] px-6 py-3 rounded-lg font-semibold hover:bg-[#0099cc]/10 transition"
            >
              Create New
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p className="text-gray-500">Built with Next.js 16 for instant page loads and smooth editing.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
            <div className="text-3xl mb-3">📝</div>
            <h3 className="text-xl font-semibold mb-2">Easy Writing</h3>
            <p className="text-gray-500">Create, edit, and organize your documents effortlessly.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
            <div className="text-3xl mb-3">🔄</div>
            <h3 className="text-xl font-semibold mb-2">Always Synced</h3>
            <p className="text-gray-500">Your data lives in MongoDB Atlas, accessible anywhere.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
