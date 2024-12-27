import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="absolute top-4 right-4">
        <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Login
        </Link>
      </div>
      <div className="max-w-xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Mental Health Survey</h1>
        <p className="text-lg mb-8 text-center">Please choose your university:</p>
        <div className="grid grid-cols-1 gap-4">
          <a 
            href="/ual" 
            className="block p-4 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            University of the Arts London (UAL)
          </a>
          <a 
            href="/sol" 
            className="block p-4 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Solent University (SOL)
          </a>
        </div>
      </div>
    </div>
  );
}