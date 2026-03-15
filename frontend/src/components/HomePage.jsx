import { Link } from 'react-router-dom';
import {
  FilmIcon,
  UserGroupIcon,
  SparklesIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

const portals = [
  {
    name: 'Production Portal',
    description: 'Manage projects, crew, talent, and shoots',
    to: '/production/login',
    icon: FilmIcon,
    color: 'bg-indigo-600 hover:bg-indigo-700',
  },
  {
    name: 'Client Portal',
    description: 'View project status, review deliverables, and approve work',
    to: '/client/login',
    icon: UserGroupIcon,
    color: 'bg-emerald-600 hover:bg-emerald-700',
  },
  {
    name: 'Talent Portal',
    description: 'Manage bookings, view call sheets, and track earnings',
    to: '/talent/login',
    icon: SparklesIcon,
    color: 'bg-amber-600 hover:bg-amber-700',
  },
  {
    name: 'Crew Portal',
    description: 'View assignments, call sheets, contracts, and earnings',
    to: '/crew/login',
    icon: WrenchScrewdriverIcon,
    color: 'bg-sky-600 hover:bg-sky-700',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Studio Portal</h1>
        <p className="text-gray-400 mb-10">Photography Studio Management Platform</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {portals.map((portal) => (
            <Link
              key={portal.to}
              to={portal.to}
              className={`${portal.color} rounded-xl p-6 text-left text-white transition-all transform hover:scale-[1.02] hover:shadow-xl`}
            >
              <portal.icon className="h-8 w-8 mb-3 opacity-80" />
              <h2 className="text-lg font-semibold">{portal.name}</h2>
              <p className="text-sm opacity-75 mt-1">{portal.description}</p>
            </Link>
          ))}
        </div>
        <p className="text-gray-500 text-xs mt-8">
          Demo credentials &mdash; All passwords: <code className="bg-gray-800 px-1.5 py-0.5 rounded">password123</code>
        </p>
        <div className="text-gray-600 text-xs mt-2 space-x-4">
          <span>Admin: admin@studio.com</span>
          <span>Client: client@brandco.com</span>
          <span>Talent: talent1@studio.com</span>
          <span>Crew: crew1@studio.com</span>
        </div>
      </div>
    </div>
  );
}
