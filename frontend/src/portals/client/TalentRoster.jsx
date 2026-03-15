import { useState } from 'react';
import { useTalentProfiles } from '../../api/hooks';
import PhotoLightbox from '../../components/PhotoLightbox';
import {
  UserIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

export default function TalentRoster() {
  const { data: profilesData, isLoading } = useTalentProfiles({ approved_only: 'true' });
  const [typeFilter, setTypeFilter] = useState('all');

  const profiles = profilesData?.results || profilesData || [];
  const filtered = typeFilter === 'all'
    ? profiles
    : profiles.filter((p) => p.talent_type === typeFilter);

  const types = [...new Set(profiles.map((p) => p.talent_type))];

  if (isLoading) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Talent Roster</h1>
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-4 h-4 text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="all">All Types</option>
            {types.map((t) => (
              <option key={t} value={t} className="capitalize">{t}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-sm text-gray-400">
          No talent profiles available.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <TalentCard key={p.id} profile={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function TalentCard({ profile }) {
  const [expanded, setExpanded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
        {profile.primary_photo ? (
          <div className="relative group">
            <img
              src={profile.primary_photo}
              alt={profile.full_name}
              className="w-full h-48 object-cover"
            />
            <button
              className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors"
              onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}
              aria-label="Enlarge photo"
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-emerald-50 flex items-center justify-center">
            <UserIcon className="w-16 h-16 text-emerald-200" />
          </div>
        )}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900">{profile.full_name}</h3>
          <p className="text-xs text-emerald-600 font-medium capitalize mt-0.5">
            {profile.talent_type}
          </p>
          <div className="flex gap-3 mt-2 text-xs text-gray-500">
            {profile.age && <span>Age: {profile.age}</span>}
            {profile.height && <span>Height: {profile.height}</span>}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-2">
          {profile.skin_tone && (
            <p className="text-sm text-gray-600"><span className="text-gray-400">Skin Tone:</span> {profile.skin_tone}</p>
          )}
          <p className="text-sm text-gray-600">
            <span className="text-gray-400">Capability:</span>{' '}
            {profile.performance_capability?.replace(/_/g, ' ')}
          </p>
          {profile.specializations && (
            <p className="text-sm text-gray-600">
              <span className="text-gray-400">Specializations:</span> {profile.specializations}
            </p>
          )}
          {profile.bio && (
            <p className="text-sm text-gray-600 mt-2">{profile.bio}</p>
          )}
        </div>
      )}
    </div>

    {lightboxOpen && (
      <PhotoLightbox
        src={profile.primary_photo}
        alt={profile.full_name}
        onClose={() => setLightboxOpen(false)}
      />
    )}
    </>
  );
}
