import { useState, useEffect } from "react";
import { rulesApi } from "../services/api";
import { Save, AlertCircle } from "lucide-react";
import { useDepartment } from "../context/DepartmentContext";

export default function RulesConfig() {
  const { selectedDepartment } = useDepartment();
  const [rules, setRules] = useState<any>({
    periodsPerDay: 7,
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    semesterType: "Odd",
    maxSubjectPeriodsPerDay: 2
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedDepartment) {
      fetchRules();
    }
  }, [selectedDepartment]);

  const fetchRules = async () => {
    if (!selectedDepartment) return;
    try {
      const res = await rulesApi.get(selectedDepartment._id);
      if (res.data) setRules(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedDepartment) return;
    setSaving(true);
    try {
      await rulesApi.update({ ...rules, departmentId: selectedDepartment._id });
      alert("Rules updated successfully!");
    } catch (err) {
      alert("Failed to update rules");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Department Rules Configuration</h1>
        <p className="text-slate-500 mt-1">Configure global constraints for the timetable generator.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
          <h2 className="text-lg font-semibold border-b pb-2">General Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Periods Per Day</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={rules.periodsPerDay}
                onChange={e => setRules({...rules, periodsPerDay: parseInt(e.target.value)})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Semester Type</label>
              <select 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={rules.semesterType}
                onChange={e => setRules({...rules, semesterType: e.target.value})}
              >
                <option value="Odd">Odd Semester</option>
                <option value="Even">Even Semester</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Max Subject Periods / Day</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={rules.maxSubjectPeriodsPerDay || 2}
                onChange={e => setRules({...rules, maxSubjectPeriodsPerDay: parseInt(e.target.value)})}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
          <h2 className="text-lg font-semibold border-b pb-2">Special Slots</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div className="flex items-center space-x-2 text-amber-700 mb-2">
                <AlertCircle size={18} />
                <span className="font-semibold text-sm">Saturday Rule</span>
              </div>
              <p className="text-xs text-amber-600 leading-relaxed">
                {rules.semesterType === 'Odd' 
                  ? "Odd Saturdays will be marked as holidays for the current Odd semester."
                  : "Even Saturdays will be marked as holidays for the current Even semester."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full justify-end">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full md:w-auto bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-900/20"
        >
          <Save size={20} />
          <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>
    </div>
  );
}
