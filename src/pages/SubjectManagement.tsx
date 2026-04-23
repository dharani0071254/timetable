import { useState, useEffect, FormEvent } from "react";
import { subjectApi } from "../services/api";
import { Plus, Trash2, X, Edit2 } from "lucide-react";
import { useDepartment } from "../context/DepartmentContext";

export default function SubjectManagement() {
  const { selectedDepartment } = useDepartment();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "Theory",
    hoursPerWeek: 4,
    semester: 1
  });

  useEffect(() => {
    if (selectedDepartment) {
      fetchData();
    }
  }, [selectedDepartment]);

  const fetchData = async () => {
    if (!selectedDepartment) return;
    const res = await subjectApi.getAll(selectedDepartment._id);
    setSubjects(res.data);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedDepartment) return;

    try {
      if (editingId) {
        await subjectApi.update(editingId, { ...formData, departmentId: selectedDepartment._id });
      } else {
        await subjectApi.create({ ...formData, departmentId: selectedDepartment._id });
      }
      setModalOpen(false);
      setEditingId(null);
      setFormData({ code: "", name: "", type: "Theory", hoursPerWeek: 4, semester: 1 });
      fetchData();
    } catch (err) {
      alert("Error saving subject. Code must be unique within department.");
    }
  };

  const handleEdit = (sub: any) => {
    setFormData({
      code: sub.code,
      name: sub.name,
      type: sub.type || "Theory",
      hoursPerWeek: sub.hoursPerWeek,
      semester: sub.semester
    });
    setEditingId(sub._id);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure?")) {
      await subjectApi.delete(id);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subject Management</h1>
          <p className="text-slate-500">Define subjects and their weekly hour requirements.</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add Subject</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-bottom border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700">Code</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Name</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Type</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Hours/Week</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Semester</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subjects.map((s) => (
              <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-sm">{s.code}</td>
                <td className="px-6 py-4 font-medium">{s.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    s.type === 'Lab' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {s.type}
                  </span>
                </td>
                <td className="px-6 py-4">{s.hoursPerWeek}h</td>
                <td className="px-6 py-4">Sem {s.semester}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleEdit(s)}
                    className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                    title="Edit Subject"
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
              onClick={() => {
                setModalOpen(false);
                setEditingId(null);
                setFormData({ code: "", name: "", type: "Theory", hoursPerWeek: 4, semester: 1 });
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-6">{editingId ? 'Edit Subject' : 'Add New Subject'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. CS301"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.code}
                    onChange={e => setFormData({...formData, code: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
                  <input 
                    type="number" 
                    required
                    min="1" max="8"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.semester}
                    onChange={e => setFormData({...formData, semester: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject Name</label>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="Theory">Theory</option>
                    <option value="Lab">Lab</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hours/Week</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.hoursPerWeek}
                    onChange={e => setFormData({...formData, hoursPerWeek: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors mt-4"
              >
                {editingId ? 'Update Subject' : 'Save Subject'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
