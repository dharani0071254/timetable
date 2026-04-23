import { useState, useEffect, FormEvent } from "react";
import { classApi, subjectApi } from "../services/api";
import { Plus, Trash2, X, Check, Pencil } from "lucide-react";
import { useDepartment } from "../context/DepartmentContext";

const EMPTY_FORM = {
  name: "",
  semester: 1,
  subjects: [] as string[],
  fixedTimings: [] as any[],
};

export default function ClassManagement() {
  const { selectedDepartment } = useDepartment();
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    if (selectedDepartment) fetchData();
  }, [selectedDepartment]);

  const fetchData = async () => {
    if (!selectedDepartment) return;
    const [cRes, sRes] = await Promise.all([
      classApi.getAll(selectedDepartment._id),
      subjectApi.getAll(selectedDepartment._id),
    ]);
    setClasses(cRes.data);
    setSubjects(sRes.data);
  };

  const openAdd = () => {
    setEditingClass(null);
    setFormData({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  const openEdit = (cls: any) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      semester: cls.semester,
      subjects: cls.subjects ?? [],
      fixedTimings: cls.fixedTimings ?? [],
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingClass(null);
    setFormData({ ...EMPTY_FORM });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedDepartment) return;
    try {
      if (editingClass) {
        await classApi.update(editingClass._id, {
          ...formData,
          departmentId: selectedDepartment._id,
        });
      } else {
        await classApi.create({ ...formData, departmentId: selectedDepartment._id });
      }
      closeModal();
      fetchData();
    } catch {
      alert("Error saving class. Name must be unique within department.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure?")) {
      await classApi.delete(id);
      fetchData();
    }
  };

  const toggleSubject = (code: string) => {
    setFormData((prev) => {
      const isSelected = prev.subjects.includes(code);
      if (isSelected) {
        return {
          ...prev,
          subjects: prev.subjects.filter((c) => c !== code),
          fixedTimings: prev.fixedTimings.filter((ft: any) => ft.subjectCode !== code),
        };
      }
      return { ...prev, subjects: [...prev.subjects, code] };
    });
  };

  const updateFixedTiming = (subjectCode: string, field: string, value: string | number) => {
    setFormData((prev) => {
      let ft = [...prev.fixedTimings];
      const idx = ft.findIndex((f: any) => f.subjectCode === subjectCode);

      if (field === "day" && !value) {
        if (idx >= 0) ft.splice(idx, 1);
        return { ...prev, fixedTimings: ft };
      }

      if (idx >= 0) {
        ft[idx] = { ...ft[idx], [field]: value };
      } else {
        ft.push({
          subjectCode,
          day: field === "day" ? value : "Monday",
          startPeriod: field === "startPeriod" ? value : 1,
          hours: field === "hours" ? value : 2,
        });
      }
      return { ...prev, fixedTimings: ft };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Class Management</h1>
          <p className="text-slate-500">Define sections and assign subjects to them.</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add Class</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700">Class Name</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Semester</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Subjects Assigned</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {classes.map((c) => (
              <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-indigo-600">{c.name}</td>
                <td className="px-6 py-4">Semester {c.semester}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 max-w-md">
                    {c.subjects.map((sub: string) => (
                      <span
                        key={sub}
                        className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-right flex items-center justify-end gap-1">
                  <button
                    onClick={() => openEdit(c)}
                    className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                    title="Edit class"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                    title="Delete class"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {classes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic text-sm">
                  No classes yet. Click "Add Class" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-6">
              {editingClass ? `Edit Class — ${editingClass.name}` : "Add New Class"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Class Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSE 3A"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="8"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.semester}
                    onChange={(e) =>
                      setFormData({ ...formData, semester: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Assign Subjects & Fixed Timings (Optional)
                </label>
                <div className="space-y-3 max-h-64 overflow-y-auto p-2 border border-slate-100 rounded-lg bg-slate-50/50">
                  {subjects
                    .filter((s) => s.semester === formData.semester)
                    .map((sub) => {
                      const isSelected = formData.subjects.includes(sub.code);
                      const fixedTiming = formData.fixedTimings.find(
                        (ft: any) => ft.subjectCode === sub.code
                      );
                      return (
                        <div
                          key={sub.code}
                          className={`border rounded-xl bg-white overflow-hidden transition-all shadow-sm ${
                            isSelected ? "border-indigo-200" : "border-slate-100"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleSubject(sub.code)}
                            className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between ${
                              isSelected
                                ? "bg-indigo-50/50 text-indigo-900 font-bold"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <span>{sub.name}</span>
                            {isSelected && <Check size={16} className="text-indigo-600" />}
                          </button>
                          {isSelected && (
                            <div className="p-3 bg-indigo-50/30 border-t border-indigo-50 flex items-end justify-between space-x-3">
                              <div className="flex-1">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase">
                                  Fixed Day
                                </label>
                                <select
                                  className="w-full text-xs p-2 border border-indigo-100 bg-white rounded-lg mt-1 outline-none text-slate-700"
                                  value={fixedTiming?.day || ""}
                                  onChange={(e) =>
                                    updateFixedTiming(sub.code, "day", e.target.value)
                                  }
                                >
                                  <option value="">Auto-Schedule (Flexible)</option>
                                  <option value="Monday">Monday</option>
                                  <option value="Tuesday">Tuesday</option>
                                  <option value="Wednesday">Wednesday</option>
                                  <option value="Thursday">Thursday</option>
                                  <option value="Friday">Friday</option>
                                </select>
                              </div>
                              <div className="w-20">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase">
                                  Start P.
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max="7"
                                  className="w-full text-xs p-2 border border-indigo-100 bg-white rounded-lg mt-1 outline-none"
                                  value={fixedTiming?.startPeriod || ""}
                                  onChange={(e) =>
                                    updateFixedTiming(
                                      sub.code,
                                      "startPeriod",
                                      parseInt(e.target.value)
                                    )
                                  }
                                  disabled={!fixedTiming?.day}
                                />
                              </div>
                              <div className="w-20">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase">
                                  Hours
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max="7"
                                  className="w-full text-xs p-2 border border-indigo-100 bg-white rounded-lg mt-1 outline-none"
                                  value={fixedTiming?.hours || ""}
                                  onChange={(e) =>
                                    updateFixedTiming(sub.code, "hours", parseInt(e.target.value))
                                  }
                                  disabled={!fixedTiming?.day}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  {subjects.filter((s) => s.semester === formData.semester).length === 0 && (
                    <p className="text-center py-6 text-slate-400 text-sm italic">
                      No subjects found for Semester {formData.semester}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors mt-4"
              >
                {editingClass ? "Save Changes" : "Save Class"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
