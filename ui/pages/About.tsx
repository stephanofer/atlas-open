import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About ATLAS</h1>
        <p className="text-lg text-gray-600 mb-6">
          ATLAS allows companies to manage, send, forward, and track digital
          documents across organizational areas securely, eliminating emails
          and manual processes.
        </p>

        <div className="space-y-4 mb-8">
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Frontend</h3>
            <p className="text-gray-600">
              React 19, Vite, TanStack Query, React Router, Tailwind CSS 4,
              Zustand, Framer Motion
            </p>
          </div>

          <div className="p-4 bg-pink-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Backend</h3>
            <p className="text-gray-600">
              Cloudflare Workers, Hono, Supabase (Auth, DB, Storage)
            </p>
          </div>
        </div>

        <Link
          to="/"
          className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
