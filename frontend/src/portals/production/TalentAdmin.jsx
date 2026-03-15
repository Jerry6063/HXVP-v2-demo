import { useState } from 'react';
import {
  useTalentProfiles,
  useTalentProfile,
  useApproveTalentProfile,
  useRejectTalentProfile,
  useCreateBooking,
  useShoots,
} from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import PhotoLightbox from '../../components/PhotoLightbox';
import {
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

export default function TalentAdmin() {
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const { data: profilesData, isLoading } = useTalentProfiles(
    filter === 'all' ? {} : { approval_status: filter }
  );

  const profiles = profilesData?.results || profilesData || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Talent Management</h1>

      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'approved', 'draft', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => { setFilter(s); setSelectedId(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
              filter === s
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s === 'all' ? 'All' : s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile List */}
        <div className="lg:col-span-1 space-y-2">
          {isLoading ? (
            <p className="text-center py-8 text-gray-400">Loading...</p>
          ) : profiles.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <UserIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No profiles found</p>
            </div>
          ) : (
            profiles.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`bg-white rounded-lg border p-4 cursor-pointer transition-all hover:shadow-sm ${
                  selectedId === p.id
                    ? 'border-indigo-400 ring-1 ring-indigo-200'
                    : 'border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  {p.primary_photo ? (
                    <img
                      src={p.primary_photo}
                      alt={p.full_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm font-bold">
                      {p.user?.first_name?.[0]}{p.user?.last_name?.[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {p.full_name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{p.talent_type}</p>
                  </div>
                  <StatusBadge status={p.approval_status} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2">
          {selectedId ? (
            <TalentDetailPanel profileId={selectedId} />
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <EyeIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Select a talent profile to review</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TalentDetailPanel({ profileId }) {
  const { data: profile, isLoading } = useTalentProfile(profileId);
  const approveProfile = useApproveTalentProfile();
  const rejectProfile = useRejectTalentProfile();
  const [adminNotes, setAdminNotes] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (isLoading || !profile) {
    return <div className="bg-white rounded-xl border p-8 text-center text-gray-400">Loading...</div>;
  }

  const handleApprove = () => {
    approveProfile.mutate({ id: profile.id, admin_notes: adminNotes });
  };

  const handleReject = () => {
    rejectProfile.mutate({ id: profile.id, admin_notes: adminNotes });
  };

  const photos = profile.photos || [];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">{profile.user?.first_name} {profile.user?.last_name}</h2>
          <p className="text-xs text-gray-500">{profile.user?.email}</p>
        </div>
        <StatusBadge status={profile.approval_status} />
      </div>

      <div className="p-6 space-y-6">
        {/* Photos */}
        {photos.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Photos</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {photos.map((photo, idx) => (
                <img
                  key={photo.id}
                  src={photo.image_url || photo.image}
                  alt={photo.caption}
                  className="h-32 w-auto rounded-lg object-cover border border-gray-200 flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setLightboxIndex(idx)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <InfoItem label="Type" value={profile.talent_type} />
          <InfoItem label="Age" value={profile.age || '—'} />
          <InfoItem label="Height" value={profile.height || '—'} />
          <InfoItem label="Skin Tone" value={profile.skin_tone || '—'} />
          <InfoItem label="Rate" value={`$${profile.hourly_rate}/hr`} />
          <InfoItem label="Capability" value={profile.performance_capability?.replace(/_/g, ' ')} />
        </div>

        {profile.specializations && (
          <div>
            <p className="text-xs text-gray-400 mb-1">Specializations</p>
            <p className="text-sm text-gray-700">{profile.specializations}</p>
          </div>
        )}

        {profile.bio && (
          <div>
            <p className="text-xs text-gray-400 mb-1">Bio</p>
            <p className="text-sm text-gray-700">{profile.bio}</p>
          </div>
        )}

        {/* Admin Actions */}
        {profile.approval_status !== 'approved' && (
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Admin Notes</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={2}
                placeholder="Optional feedback for the talent..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={approveProfile.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <CheckCircleIcon className="w-4 h-4" />
                {approveProfile.isPending ? 'Approving...' : 'Approve Profile'}
              </button>
              <button
                onClick={handleReject}
                disabled={rejectProfile.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50 transition-colors"
              >
                <XCircleIcon className="w-4 h-4" />
                Reject
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (() => {
        const photo = photos[lightboxIndex];
        return (
          <PhotoLightbox
            src={photo.image_url || photo.image}
            alt={photo.caption || profile.full_name}
            onClose={() => setLightboxIndex(null)}
            onPrev={photos.length > 1 ? () => setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length) : undefined}
            onNext={photos.length > 1 ? () => setLightboxIndex((lightboxIndex + 1) % photos.length) : undefined}
          />
        );
      })()}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-900 capitalize">{value}</p>
    </div>
  );
}
