import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProjects, useCreateProject, useCreateTalentRequirement, useCreateCrewRequirement } from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import { PlusIcon, MagnifyingGlassIcon, ChevronDownIcon, ChevronRightIcon, UserCircleIcon, TrashIcon } from '@heroicons/react/24/outline';

const TALENT_TYPE_OPTIONS = [
  { value: 'model', label: 'Model' },
  { value: 'actor', label: 'Actor' },
  { value: 'voiceover', label: 'Voiceover' },
  { value: 'dancer', label: 'Dancer' },
  { value: 'livestream', label: 'Livestream Host' },
  { value: 'other', label: 'Other' },
];

const CREW_ROLE_OPTIONS = [
  { value: 'director', label: 'Director' },
  { value: 'photographer', label: 'Photographer' },
  { value: 'dop', label: 'Director of Photography' },
  { value: 'videographer', label: 'Videographer' },
  { value: 'first_ac', label: '1st Assistant Camera' },
  { value: 'second_ac', label: '2nd Assistant Camera' },
  { value: 'gaffer', label: 'Gaffer' },
  { value: 'grip', label: 'Grip' },
  { value: 'electric', label: 'Electric' },
  { value: 'wardrobe', label: 'Wardrobe' },
  { value: 'set_design', label: 'Set Design' },
  { value: 'bts', label: 'Behind-the-Scene' },
  { value: 'pa', label: 'Production Assistant' },
  { value: 'ac', label: 'Assistant Camera' },
  { value: 'audio', label: 'Audio' },
  { value: 'lighting', label: 'Lighting' },
  { value: 'hair_makeup', label: 'Hair & Makeup' },
  { value: 'stylist', label: 'Stylist' },
  { value: 'crafty', label: 'Crafty' },
  { value: 'other', label: 'Other' },
];

function ClientGroup({ clientName, projects }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Client header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <UserCircleIcon className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="font-semibold text-gray-800 text-sm">{clientName}</span>
          <span className="text-xs text-gray-400 bg-white border border-gray-200 rounded-full px-2 py-0.5">
            {projects.length} production{projects.length !== 1 ? 's' : ''}
          </span>
        </div>
        {open
          ? <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          : <ChevronRightIcon className="w-4 h-4 text-gray-400" />}
      </button>

      {/* Projects table */}
      {open && (
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wider">Production</th>
              <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wider">Budget</th>
              <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wider">Deadline</th>
              <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wider">Shoots</th>
              <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-indigo-50/40 transition-colors">
                <td className="px-5 py-3.5">
                  <Link
                    to={`/production/projects/${p.id}`}
                    className="font-medium text-indigo-600 hover:text-indigo-700 text-sm"
                  >
                    {p.name}
                  </Link>
                  {p.description && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{p.description}</p>
                  )}
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-600">${Number(p.budget).toLocaleString()}</td>
                <td className="px-5 py-3.5 text-sm text-gray-600">{p.deadline || '—'}</td>
                <td className="px-5 py-3.5 text-sm text-gray-600">{p.shoot_count || 0}</td>
                <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function ActiveProjects() {
  const { data: projects, isLoading } = useProjects({ status: 'active' });
  const createProject = useCreateProject();
  const createTalentReq = useCreateTalentRequirement();
  const createCrewReq = useCreateCrewRequirement();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    name: '', description: '', budget: '', deadline: '', client: '',
    location: '', other_requirements: '',
  });
  const [talentReqs, setTalentReqs] = useState([]);
  const [crewReqs, setCrewReqs] = useState([]);

  const projectList = (projects?.results || projects || []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Group by client
  const grouped = useMemo(() => {
    const map = new Map();
    projectList.forEach((p) => {
      const key = p.client_name || 'No Client';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [projectList]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const project = await createProject.mutateAsync({
      ...form,
      budget: form.budget || 0,
      status: 'active',
    });
    // Create requirement rows
    await Promise.all([
      ...talentReqs.map((r) => createTalentReq.mutateAsync({ project: project.id, talent_type: r.type, count: r.count || 1, notes: r.notes })),
      ...crewReqs.map((r) => createCrewReq.mutateAsync({ project: project.id, crew_role: r.role, count: r.count || 1, notes: r.notes })),
    ]);
    setShowForm(false);
    setForm({ name: '', description: '', budget: '', deadline: '', client: '', location: '', other_requirements: '' });
    setTalentReqs([]);
    setCrewReqs([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Active Productions</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          New Production
        </button>
      </div>

      {/* New Project Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Production</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Production Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
              <input
                type="number"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Venue, city, or general area"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Talent Requirements</label>
                <button
                  type="button"
                  onClick={() => setTalentReqs([...talentReqs, { type: 'model', count: 1, notes: '' }])}
                  className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  <PlusIcon className="h-3.5 w-3.5" /> Add Row
                </button>
              </div>
              {talentReqs.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No talent requirements added yet</p>
              ) : (
                <div className="space-y-2">
                  {talentReqs.map((r, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <input
                        type="number"
                        min="1"
                        value={r.count}
                        onChange={(e) => { const arr = [...talentReqs]; arr[i] = { ...r, count: parseInt(e.target.value) || 1 }; setTalentReqs(arr); }}
                        className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                      <select
                        value={r.type}
                        onChange={(e) => { const arr = [...talentReqs]; arr[i] = { ...r, type: e.target.value }; setTalentReqs(arr); }}
                        className="w-40 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      >
                        {TALENT_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <input
                        value={r.notes}
                        onChange={(e) => { const arr = [...talentReqs]; arr[i] = { ...r, notes: e.target.value }; setTalentReqs(arr); }}
                        placeholder="Notes (e.g. age range, look)"
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                      <button type="button" onClick={() => setTalentReqs(talentReqs.filter((_, j) => j !== i))} className="p-1.5 text-gray-400 hover:text-red-500">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Crew Requirements</label>
                <button
                  type="button"
                  onClick={() => setCrewReqs([...crewReqs, { role: 'photographer', count: 1, notes: '' }])}
                  className="flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700"
                >
                  <PlusIcon className="h-3.5 w-3.5" /> Add Row
                </button>
              </div>
              {crewReqs.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No crew requirements added yet</p>
              ) : (
                <div className="space-y-2">
                  {crewReqs.map((r, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <input
                        type="number"
                        min="1"
                        value={r.count}
                        onChange={(e) => { const arr = [...crewReqs]; arr[i] = { ...r, count: parseInt(e.target.value) || 1 }; setCrewReqs(arr); }}
                        className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                      <select
                        value={r.role}
                        onChange={(e) => { const arr = [...crewReqs]; arr[i] = { ...r, role: e.target.value }; setCrewReqs(arr); }}
                        className="w-52 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      >
                        {CREW_ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <input
                        value={r.notes}
                        onChange={(e) => { const arr = [...crewReqs]; arr[i] = { ...r, notes: e.target.value }; setCrewReqs(arr); }}
                        placeholder="Notes"
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                      <button type="button" onClick={() => setCrewReqs(crewReqs.filter((_, j) => j !== i))} className="p-1.5 text-gray-400 hover:text-red-500">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Other Requirements</label>
              <textarea
                rows={2}
                value={form.other_requirements}
                onChange={(e) => setForm({ ...form, other_requirements: e.target.value })}
                placeholder="Props, permits, special equipment, client preferences…"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={createProject.isPending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {createProject.isPending ? 'Creating...' : 'Create Production'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search productions..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Grouped by client */}
      {isLoading ? (
        <div className="text-center py-10 text-gray-400">Loading...</div>
      ) : grouped.length === 0 ? (
        <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-gray-100">No active productions found</div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([clientName, clientProjects]) => (
            <ClientGroup key={clientName} clientName={clientName} projects={clientProjects} />
          ))}
        </div>
      )}
    </div>
  );
}
