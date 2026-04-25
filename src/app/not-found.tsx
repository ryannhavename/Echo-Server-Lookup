import Link from "next/link";
import { Server, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex p-4 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl mb-6">
          <Server className="w-12 h-12 text-gray-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">404 - Page Not Found</h2>
        <p className="text-gray-400 mb-6">Looks like you're lost on the server.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl font-medium transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
