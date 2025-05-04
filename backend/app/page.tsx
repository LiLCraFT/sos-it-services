import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold mb-6">
          SOS IT Services API
        </h1>
        <p className="mb-6 text-lg">
          Bienvenue sur l'API de SOS IT Services. Cette API fournit des services pour la gestion des utilisateurs.
        </p>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">Documentation</h2>
          <p className="mb-4">
            Consultez notre documentation API pour découvrir les endpoints disponibles :
          </p>
          <Link 
            href="/api-docs" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Accéder à la documentation API
          </Link>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">Routes principales</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><code className="bg-gray-100 p-1 rounded">/api/auth/register</code> - Inscription</li>
            <li><code className="bg-gray-100 p-1 rounded">/api/auth/login</code> - Authentification</li>
            <li><code className="bg-gray-100 p-1 rounded">/api/users</code> - Gestion des utilisateurs</li>
          </ul>
        </div>
      </div>
    </main>
  );
} 