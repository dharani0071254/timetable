import { useState, useEffect, FormEvent } from "react";
import { staffApi, subjectApi } from "../services/api";
import { Plus, Trash2, Edit2, X, Check } from "lucide-react";
import { useDepartment } from "../context/DepartmentContext";

export default function StaffManagement() {
  const { selectedDepartment } = useDepartment();
  const [staff, setStaff] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [formData, setFormData] = useState({
    staffId: "",
    name: "",
    subjects: [] as string[],
    maxHoursPerWeek: 20,
    maxClassesPerDay: 4
  });

  useEffect(() => {
    if (selectedDepartment) {
      fetchData();
    }
  }, [selectedDepartment]);

  const fetchData = async () => {
    if (!selectedDepartment) return;
    const [sRes, subRes] = await Promise.all([
      staffApi.getAll(selectedDepartment._id), 
      subjectApi.getAll(selectedDepartment._id)
    ]);
    setStaff(sRes.data);
    setSubjects(subRes.data);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedDepartment) return;

    try {
      const dataWithDept = { ...formData, departmentId: selectedDepartment._id };
      if (editingStaff) {
        await staffApi.update(editingStaff._id, dataWithDept);
      } else {
        await staffApi.create(dataWithDept);
      }
      setModalOpen(false);
      setEditingStaff(null);
      setFormData({ staffId: "", name: "", subjects: [], maxHoursPerWeek: 20, maxClassesPerDay: 4 });
      fetchData();
    } catch (err) {
      alert("Error saving staff");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure?")) {
      await staffApi.delete(id);
      fetchData();
    }
  };

  const toggleSubject = (code: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(code) 
        ? prev.subjects.filter(c => c !== code)
        : [...prev.subjects, code]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
          <p className="text-slate-500">Add and manage department faculty members.</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add Staff</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-bottom border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700">Staff ID</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Name</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Subjects</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Max Hours/Week</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Max Periods/Day</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staff.map((s) => (
              <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-sm">{s.staffId}</td>
                <td className="px-6 py-4 font-medium">{s.name}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {s.subjects.map((sub: string) => (
                      <span key={sub} className="bg-indigo-50 text-indigo-600 text-xs px-2 py-1 rounded">
                        {sub}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">{s.maxHoursPerWeek}h</td>
                <td className="px-6 py-4">{s.maxClassesPerDay || 4}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => {
                      setEditingStaff(s);
                      setFormData({ staffId: s.staffId, name: s.name, subjects: s.subjects, maxHoursPerWeek: s.maxHoursPerWeek, maxClassesPerDay: s.maxClassesPerDay || 4 });
                      setModalOpen(true);
                    }}
                    className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(s._id)}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 relative">
            <button 
              onClick={() => { setModalOpen(false); setEditingStaff(null); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-6">{editingStaff ? 'Edit Staff' : 'Add New Staff'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Staff ID</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.staffId}
                  onChange={e => setFormData({...formData, staffId: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Max Hours/Week</label>
                  <input 
                    type="number" 
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.maxHoursPerWeek}
                    onChange={e => setFormData({...formData, maxHoursPerWeek: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Max Periods/Day</label>
                  <input 
                    type="number" 
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.maxClassesPerDay || 4}
                    onChange={e => setFormData({...formData, maxClassesPerDay: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Subjects Handled</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-100 rounded-lg">
                  {subjects.map(sub => (
                    <button
                      key={sub.code}
                      type="button"
                      onClick={() => toggleSubject(sub.code)}
                      className={`text-left px-3 py-2 rounded text-xs flex items-center justify-between ${
                        formData.subjects.includes(sub.code) 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{sub.name}</span>
                      {formData.subjects.includes(sub.code) && <Check size={12} />}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors mt-4"
              >
                {editingStaff ? 'Update Staff' : 'Save Staff'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
