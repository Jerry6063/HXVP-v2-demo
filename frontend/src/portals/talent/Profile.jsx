import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  useMyTalentProfile,
  useUpdateTalentProfile,
  useUploadTalentPhoto,
  useDeleteTalentPhoto,
  useSetPrimaryTalentPhoto,
  useUpdateMe,
} from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import PhotoLightbox from '../../components/PhotoLightbox';
import {
  CameraIcon,
  TrashIcon,
  StarIcon,
  PencilSquareIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

export default function TalentProfile() {
  const { user, refreshUser } = useAuth();
  const { data: profile, isLoading } = useMyTalentProfile();
  const updateProfile = useUpdateTalentProfile();
  const updateMe = useUpdateMe();
  const uploadPhoto = useUploadTalentPhoto();
  const deletePhoto = useDeleteTalentPhoto();
  const setPrimary = useSetPrimaryTalentPhoto();
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [contact, setContact] = useState({ phone: '', email: '' });

  const [form, setForm] = useState({
    talent_type: 'model',
    gender: '',
    race_ethnicity: '',
    age: '',
    heightUnit: 'cm',
    heightCm: '',
    heightFt: '',
    heightIn: '',
    skin_tone: '',
    measurements: '',
    performance_capability: 'model_only',
    specializations: '',
    bio: '',
    hourly_rate: '',
    portfolio_url: '',
  });

  function parseHeightToForm(h) {
    if (!h) return { heightUnit: 'cm', heightCm: '', heightFt: '', heightIn: '' };
    if (h.includes("'")) {
      const ftMatch = h.match(/^(\d+)'/);
      const inMatch = h.match(/'(\d+)/);
      return { heightUnit: 'ftin', heightCm: '', heightFt: ftMatch?.[1] || '', heightIn: inMatch?.[1] || '' };
    }
    const cmMatch = h.match(/(\d+(?:\.\d+)?)/); 
    return { heightUnit: 'cm', heightCm: cmMatch?.[1] || '', heightFt: '', heightIn: '' };
  }

  useEffect(() => {
    if (profile) {
      const hf = parseHeightToForm(profile.height || '');
      setForm({
        talent_type: profile.talent_type || 'model',
        gender: profile.gender || '',
        race_ethnicity: profile.race_ethnicity || '',
        age: profile.age || '',
        ...hf,
        skin_tone: profile.skin_tone || '',
        measurements: profile.measurements || '',
        performance_capability: profile.performance_capability || 'model_only',
        specializations: profile.specializations || '',
        bio: profile.bio || '',
        hourly_rate: profile.hourly_rate || '',
        portfolio_url: profile.portfolio_url || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      setContact({ phone: user.phone || '', email: user.email || '' });
    }
  }, [user]);

  const handleCancel = () => {
    const hf = parseHeightToForm(profile.height || '');
    setForm({
      talent_type: profile.talent_type || 'model',
      gender: profile.gender || '',
      race_ethnicity: profile.race_ethnicity || '',
      age: profile.age || '',
      ...hf,
      skin_tone: profile.skin_tone || '',
      measurements: profile.measurements || '',
      performance_capability: profile.performance_capability || 'model_only',
      specializations: profile.specializations || '',
      bio: profile.bio || '',
      hourly_rate: profile.hourly_rate || '',
      portfolio_url: profile.portfolio_url || '',
    });
    setContact({ phone: user?.phone || '', email: user?.email || '' });
    setIsEditing(false);
  };

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!profile) return;
    if (!profile.photos?.length) {
      setSaveError('Please upload at least one headshot photo before saving your profile.');
      return;
    }
    const heightStr = form.heightUnit === 'cm'
      ? form.heightCm ? `${form.heightCm} cm` : ''
      : form.heightFt ? `${form.heightFt}'${form.heightIn || 0}"` : '';
    const missing = [];
    if (!form.age) missing.push('Age');
    if (!heightStr) missing.push('Height');
    if (!form.gender) missing.push('Gender');
    if (!form.skin_tone) missing.push('Skin Tone');
    if (!form.race_ethnicity) missing.push('Race / Ethnicity');
    if (!form.measurements) missing.push('Measurements');
    if (!form.hourly_rate) missing.push('Hourly Rate');
    if (!contact.phone) missing.push('Phone Number');
    if (missing.length) {
      setSaveError(`Please fill in all required fields: ${missing.join(', ')}.`);
      return;
    }
    setSaveError('');
    await updateProfile.mutateAsync({
      id: profile.id,
      talent_type: form.talent_type,
      gender: form.gender,
      race_ethnicity: form.race_ethnicity,
      age: form.age ? parseInt(form.age, 10) : null,
      height: heightStr,
      skin_tone: form.skin_tone,
      measurements: form.measurements,
      performance_capability: form.performance_capability,
      specializations: form.specializations,
      bio: form.bio,
      hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : 0,
      portfolio_url: form.portfolio_url,
    });
    await updateMe.mutateAsync({ phone: contact.phone });
    await refreshUser();
    setIsEditing(false);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !profile) return;
    setSaveError('');
    uploadPhoto.mutate({ profileId: profile.id, image: file, is_primary: !profile.photos?.length });
  };

  if (isLoading) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
        <p className="text-sm text-gray-400">No talent profile found for your account.</p>
      </div>
    );
  }

  const approvalColors = {
    draft: 'bg-gray-50 border-gray-200 text-gray-600',
    pending: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    approved: 'bg-green-50 border-green-200 text-green-700',
    rejected: 'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <div className="flex items-center gap-3">
          <StatusBadge status={profile.approval_status} />
          {isEditing ? (
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
              Cancel
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
            >
              <PencilSquareIcon className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Approval Status Banner */}
      <div className={`rounded-lg border p-4 ${approvalColors[profile.approval_status] || approvalColors.draft}`}>
        {profile.approval_status === 'draft' && !isEditing && (
          <p className="text-sm">Your profile is in draft. Click <strong>Edit Profile</strong> to fill in your details — saving will automatically submit it for review.</p>
        )}
        {profile.approval_status === 'draft' && isEditing && (
          <p className="text-sm">You're editing your profile. Saving will submit it for review.</p>
        )}
        {profile.approval_status === 'pending' && !isEditing && (
          <p className="text-sm">Your profile is under review. You can still edit it — any saved changes will re-trigger the review process.</p>
        )}
        {profile.approval_status === 'pending' && isEditing && (
          <p className="text-sm">Editing your profile. Saving will re-submit it for review.</p>
        )}
        {profile.approval_status === 'approved' && !isEditing && (
          <p className="text-sm">Your profile is approved and visible to clients. Editing and saving will require re-approval.</p>
        )}
        {profile.approval_status === 'approved' && isEditing && (
          <p className="text-sm">You're editing your approved profile. Saving will require re-approval before it's visible to clients again.</p>
        )}
        {profile.approval_status === 'rejected' && (
          <p className="text-sm">Your profile was not approved. {profile.admin_notes ? `Reason: ${profile.admin_notes}.` : ''} Click <strong>Edit Profile</strong> to make changes and resubmit.</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Photos */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Photos</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {(profile.photos || []).map((photo, idx) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.image_url || photo.image}
                  alt={photo.caption || 'Profile photo'}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer"
                  onClick={() => setLightboxIndex(idx)}
                />
                {/* Primary badge / Set-as-primary button */}
                {photo.is_primary ? (
                  <span className="absolute top-1 left-1 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <StarSolidIcon className="w-3 h-3" /> Primary
                  </span>
                ) : isEditing ? (
                  <button
                    title="Set as primary photo"
                    onClick={(e) => { e.stopPropagation(); setPrimary.mutate({ profileId: profile.id, photoId: photo.id }); }}
                    className="absolute top-1 left-1 bg-white/80 hover:bg-amber-500 hover:text-white text-amber-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <StarIcon className="w-3 h-3" />
                  </button>
                ) : null}
                {isEditing && (
                  <button
                    onClick={(e) => { e.stopPropagation(); deletePhoto.mutate({ profileId: profile.id, photoId: photo.id }); }}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {isEditing && (
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 cursor-pointer transition-colors">
              <CameraIcon className="w-4 h-4" />
              Upload Photo
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Profile Details — read-only or edit form */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Profile Details</h2>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Talent Type <span className="text-red-400">*</span></label>
                  <select
                    value={form.talent_type}
                    onChange={set('talent_type')}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  >
                    <option value="model">Model</option>
                    <option value="actor">Actor / Actress</option>
                    <option value="voiceover">Voiceover</option>
                    <option value="dancer">Dancer</option>
                    <option value="livestream">Livestream Host</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Performance Capability <span className="text-red-400">*</span></label>
                  <select
                    value={form.performance_capability}
                    onChange={set('performance_capability')}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  >
                    <option value="model_only">Model Only (No Dialogue)</option>
                    <option value="with_dialogue">Can Perform with Dialogue</option>
                    <option value="both">Both Model &amp; Dialogue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Age <span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={set('age')}
                    min={1}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Height — unit picker */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Height <span className="text-red-400">*</span></label>
                  <div className="flex gap-2">
                    <div className="flex rounded-lg border border-gray-300 overflow-hidden text-xs font-medium shrink-0">
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, heightUnit: 'cm', heightFt: '', heightIn: '' }))}
                        className={`px-2.5 py-2 transition-colors ${
                          form.heightUnit === 'cm'
                            ? 'bg-amber-500 text-white'
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        cm
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, heightUnit: 'ftin', heightCm: '' }))}
                        className={`px-2.5 py-2 transition-colors ${
                          form.heightUnit === 'ftin'
                            ? 'bg-amber-500 text-white'
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        ft&quot;
                      </button>
                    </div>
                    {form.heightUnit === 'cm' ? (
                      <input
                        type="number"
                        value={form.heightCm}
                        onChange={set('heightCm')}
                        placeholder="e.g. 173"
                        min={1}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                      />
                    ) : (
                      <div className="flex flex-1 gap-1.5">
                        <input
                          type="number"
                          value={form.heightFt}
                          onChange={set('heightFt')}
                          placeholder="ft"
                          min={1}
                          className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                        />
                        <input
                          type="number"
                          value={form.heightIn}
                          onChange={set('heightIn')}
                          placeholder="in"
                          min={0}
                          max={11}
                          className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Skin Tone — dropdown */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Skin Tone <span className="text-red-400">*</span></label>
                  <select
                    value={form.skin_tone}
                    onChange={set('skin_tone')}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select skin tone…</option>
                    <option value="very_fair">Very Fair</option>
                    <option value="fair">Fair</option>
                    <option value="light">Light</option>
                    <option value="medium">Medium</option>
                    <option value="olive">Olive</option>
                    <option value="tan">Tan</option>
                    <option value="brown">Brown</option>
                    <option value="dark">Dark</option>
                    <option value="deep">Deep</option>
                  </select>
                </div>

                {/* Gender — dropdown */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Gender <span className="text-red-400">*</span></label>
                  <select
                    value={form.gender}
                    onChange={set('gender')}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select gender…</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non_binary">Non-Binary</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer Not to Say</option>
                  </select>
                </div>

                {/* Race / Ethnicity — dropdown */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Race / Ethnicity <span className="text-red-400">*</span></label>
                  <select
                    value={form.race_ethnicity}
                    onChange={set('race_ethnicity')}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select race / ethnicity…</option>
                    <option value="asian">Asian</option>
                    <option value="black_african">Black / African</option>
                    <option value="east_asian">East Asian</option>
                    <option value="hispanic_latino">Hispanic / Latino</option>
                    <option value="middle_eastern">Middle Eastern</option>
                    <option value="mixed">Mixed / Multiracial</option>
                    <option value="native_american">Native American / Indigenous</option>
                    <option value="pacific_islander">Pacific Islander</option>
                    <option value="south_asian">South Asian</option>
                    <option value="southeast_asian">Southeast Asian</option>
                    <option value="white_caucasian">White / Caucasian</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer Not to Say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Measurements <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.measurements}
                    onChange={set('measurements')}
                    placeholder="e.g. 34-26-36 / S-M"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Hourly Rate ($) <span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    value={form.hourly_rate}
                    onChange={set('hourly_rate')}
                    min={0}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Specializations</label>
                <textarea
                  value={form.specializations}
                  onChange={set('specializations')}
                  rows={2}
                  placeholder="Special skills: 'I can ride a bike, play guitar, swim...'"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={set('bio')}
                  rows={3}
                  placeholder="Tell us about yourself..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Portfolio URL</label>
                <input
                  type="url"
                  value={form.portfolio_url}
                  onChange={set('portfolio_url')}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Contact Information */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Phone Number <span className="text-red-400">*</span></label>
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                      placeholder="e.g. +1 (555) 000-0000"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Email</label>
                    <input
                      type="email"
                      value={contact.email}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-0.5">Email is your login — contact admin to change.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="px-5 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors"
                >
                  {updateProfile.isPending ? 'Saving...' : 'Submit'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
              {saveError && (
                <p className="text-sm text-red-600 flex items-center gap-1.5 mt-1">
                  <span className="font-medium">⚠</span> {saveError}
                </p>
              )}
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ProfileField label="Talent Type" value={profile.talent_type?.replace(/_/g, ' ')} />
                <ProfileField label="Performance Capability" value={profile.performance_capability?.replace(/_/g, ' ')} />
                <ProfileField label="Age" value={profile.age || null} />
                <ProfileField label="Height" value={profile.height || null} />
                <ProfileField label="Gender" value={profile.gender?.replace(/_/g, ' ') || null} />
                <ProfileField label="Skin Tone" value={profile.skin_tone?.replace(/_/g, ' ') || null} />
                <ProfileField label="Race / Ethnicity" value={profile.race_ethnicity?.replace(/_/g, ' ') || null} />
                <ProfileField label="Measurements" value={profile.measurements || null} />
                <ProfileField label="Hourly Rate" value={profile.hourly_rate ? `$${profile.hourly_rate}/hr` : null} />
                <ProfileField label="Phone" value={user?.phone || null} />
                <ProfileField label="Email" value={user?.email || null} />
              </div>
              {profile.specializations && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Specializations</p>
                  <p className="text-sm text-gray-800">{profile.specializations}</p>
                </div>
              )}
              {profile.bio && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Bio</p>
                  <p className="text-sm text-gray-800 leading-relaxed">{profile.bio}</p>
                </div>
              )}
              {profile.portfolio_url && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Portfolio</p>
                  <a
                    href={profile.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-amber-600 hover:underline break-all"
                  >
                    {profile.portfolio_url}
                  </a>
                </div>
              )}
              {!profile.bio && !profile.specializations && !profile.portfolio_url && (
                <p className="text-sm text-gray-400 italic">No details filled in yet. Click <strong className="not-italic text-gray-600">Edit Profile</strong> to get started.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Lightbox */}
    {lightboxIndex !== null && (() => {
      const photos = profile.photos || [];
      const photo = photos[lightboxIndex];
      return (
        <PhotoLightbox
          src={photo.image_url || photo.image}
          alt={photo.caption || 'Profile photo'}
          onClose={() => setLightboxIndex(null)}
          onPrev={photos.length > 1 ? () => setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length) : undefined}
          onNext={photos.length > 1 ? () => setLightboxIndex((lightboxIndex + 1) % photos.length) : undefined}
        />
      );
    })()}
    </>
  );
}

function ProfileField({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className={`text-sm font-medium capitalize ${value ? 'text-gray-800' : 'text-gray-300 italic'}`}>
        {value ?? 'Not set'}
      </p>
    </div>
  );
}
