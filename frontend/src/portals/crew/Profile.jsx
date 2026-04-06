import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  useMyCrewProfile,
  useUpdateCrewProfile,
  useUploadCrewPhoto,
  useUpdateMe,
} from '../../api/hooks';
import LoadingSpinner from '../../components/LoadingSpinner';

const ROLE_OPTIONS = [
  { value: 'photographer', label: 'Photographer' },
  { value: 'dop', label: 'Director of Photography' },
  { value: 'videographer', label: 'Videographer' },
  { value: 'gaffer', label: 'Gaffer' },
  { value: 'grip', label: 'Grip' },
  { value: 'wardrobe', label: 'Wardrobe' },
  { value: 'set_design', label: 'Set Design' },
  { value: 'bts', label: 'Behind-the-Scene' },
  { value: 'pa', label: 'Production Assistant' },
  { value: 'ac', label: 'Assistant Camera' },
  { value: 'audio', label: 'Audio' },
  { value: 'lighting', label: 'Lighting' },
  { value: 'hair_makeup', label: 'Hair & Makeup' },
  { value: 'stylist', label: 'Stylist' },
  { value: 'other', label: 'Other' },
];

export default function CrewProfilePage() {
  const { user, refreshUser } = useAuth();
  const { data: myProfile, isLoading } = useMyCrewProfile();
  const updateProfile = useUpdateCrewProfile();
  const updateMe = useUpdateMe();
  const uploadPhoto = useUploadCrewPhoto();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    crew_role: '',
    hourly_rate: '',
    day_rate: '',
    bio: '',
    skills: '',
    equipment_owned: '',
    years_experience: '',
    availability: 'available',
  });
  const [contact, setContact] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
  });
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (myProfile) {
      setForm({
        crew_role: myProfile.crew_role || '',
        hourly_rate: myProfile.hourly_rate || '',
        day_rate: myProfile.day_rate || '',
        bio: myProfile.bio || '',
        skills: myProfile.skills || '',
        equipment_owned: myProfile.equipment_owned || '',
        years_experience: myProfile.years_experience || '',
        availability: myProfile.availability || 'available',
      });
    }
  }, [myProfile]);

  useEffect(() => {
    if (user) {
      setContact({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        email: user.email || '',
      });
    }
  }, [user]);

  if (isLoading) return <LoadingSpinner />;

  if (!myProfile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          No crew profile found. Please contact the admin to set up your profile.
        </p>
      </div>
    );
  }

  const handleSave = async (e) => {
    e.preventDefault();
    if (!contact.phone.trim()) {
      setSaveError('Phone number is required.');
      return;
    }
    setSaveError('');
    await Promise.all([
      updateProfile.mutateAsync({
        id: myProfile.id,
        ...form,
        hourly_rate: parseFloat(form.hourly_rate) || 0,
        day_rate: parseFloat(form.day_rate) || 0,
        years_experience: form.years_experience ? parseInt(form.years_experience) : null,
      }),
      updateMe.mutateAsync({
        first_name: contact.first_name,
        last_name: contact.last_name,
        phone: contact.phone,
      }),
    ]);
    await refreshUser();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await uploadPhoto.mutateAsync({ profileId: myProfile.id, photo: file });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      <div className="bg-white rounded-xl shadow p-6 space-y-6">
        {/* Photo + Name Header */}
        <div className="flex items-center gap-6">
          <div className="relative">
            {myProfile.profile_photo_url ? (
              <img
                src={myProfile.profile_photo_url}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-sky-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 text-3xl font-bold">
                {user?.first_name?.[0] || 'C'}
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-sky-600 text-white rounded-full p-1.5 text-xs hover:bg-sky-700"
            >
              📷
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user?.first_name} {user?.last_name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <p className="text-sm text-sky-600 font-medium mt-1 capitalize">
              {ROLE_OPTIONS.find((r) => r.value === myProfile.crew_role)?.label || myProfile.crew_role}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <select
                value={form.crew_role}
                onChange={(e) => setForm((f) => ({ ...f, crew_role: e.target.value }))}
                required
                className="w-full border rounded-lg p-2"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
              <select
                value={form.availability}
                onChange={(e) => setForm((f) => ({ ...f, availability: e.target.value }))}
                className="w-full border rounded-lg p-2"
              >
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.hourly_rate}
                onChange={(e) => setForm((f) => ({ ...f, hourly_rate: e.target.value }))}
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day Rate ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.day_rate}
                onChange={(e) => setForm((f) => ({ ...f, day_rate: e.target.value }))}
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
              <input
                type="number"
                value={form.years_experience}
                onChange={(e) => setForm((f) => ({ ...f, years_experience: e.target.value }))}
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              rows={3}
              className="w-full border rounded-lg p-2 text-sm"
              placeholder="Brief introduction about yourself..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills & Specializations</label>
            <textarea
              value={form.skills}
              onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
              rows={3}
              className="w-full border rounded-lg p-2 text-sm"
              placeholder="e.g. Proficient with RED cameras, aerial drone photography, underwater cinematography..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Owned</label>
            <textarea
              value={form.equipment_owned}
              onChange={(e) => setForm((f) => ({ ...f, equipment_owned: e.target.value }))}
              rows={2}
              className="w-full border rounded-lg p-2 text-sm"
              placeholder="e.g. Sony A7IV, DJI Mavic 3, Aputure lights..."
            />
          </div>

          {/* Contact Information */}
          <div className="border-t border-gray-100 pt-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={contact.first_name}
                  onChange={(e) => setContact((c) => ({ ...c, first_name: e.target.value }))}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={contact.last_name}
                  onChange={(e) => setContact((c) => ({ ...c, last_name: e.target.value }))}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={contact.phone}
                  onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                  placeholder="e.g. +1 (555) 000-0000"
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={contact.email}
                  readOnly
                  className="w-full border rounded-lg p-2 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-0.5">Email is your login — contact admin to change it.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={updateProfile.isPending || updateMe.isPending}
              className="bg-sky-600 text-white px-6 py-2 rounded-lg hover:bg-sky-700 disabled:opacity-50"
            >
              {(updateProfile.isPending || updateMe.isPending) ? 'Saving...' : 'Save Profile'}
            </button>
            {saved && <span className="text-green-600 text-sm font-medium">Saved successfully!</span>}
            {saveError && <span className="text-red-600 text-sm font-medium">{saveError}</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
