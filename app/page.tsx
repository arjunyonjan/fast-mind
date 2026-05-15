import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Medium + Notion Clone
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Write, edit, and organize your documents
          </p>
          <Link
            href="/documents"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 transition"
          >
            Get Started →
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">📝 Write</h2>
            <p className="text-gray-600">Create and edit documents with ease</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">📂 Organize</h2>
            <p className="text-gray-600">All your documents in one place</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">🚀 Fast</h2>
            <p className="text-gray-600">Built with Next.js and MongoDB</p>
          </div>
        </div>
      </div>
    </div>
  );
}
