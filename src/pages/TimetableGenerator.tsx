import { useState } from "react";
import { timetableApi } from "../services/api";
import { Cpu, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useDepartment } from "../context/DepartmentContext";

export default function TimetableGenerator() {
  const { selectedDepartment } = useDepartment();
  const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState("");

  const handleGenerate = async () => {
    if (!selectedDepartment) return;
    setStatus('generating');
    setMessage("Analyzing constraints and allocating staff...");
    
    try {
      const res = await timetableApi.generate(selectedDepartment._id);
      setStatus('success');
      setMessage(res.data.message || "Timetable generated successfully!");
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.error || "An error occurred during generation.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-12">
      <div className="text-center space-y-4">
        <div className="inline-flex p-4 bg-indigo-100 rounded-full text-indigo-600 mb-2">
          <Cpu size={48} />
        </div>
        <h1 className="text-4xl font-bold text-slate-900">Timetable Engine</h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Our constraint-solving algorithm will automatically allocate staff to classes while ensuring no conflicts and satisfying all department rules.
        </p>
      </div>

      <div className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 text-center space-y-8">
        {status === 'idle' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <h3 className="font-semibold text-slate-800 mb-2">Ready to Generate?</h3>
              <p className="text-sm text-slate-500">
                This will overwrite any existing timetables for the current semester. 
                Make sure all staff, subjects, and classes are correctly configured.
              </p>
            </div>
            <button 
              onClick={handleGenerate}
              className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20 active:scale-95"
            >
              Start Generation Engine
            </button>
          </div>
        )}

        {status === 'generating' && (
          <div className="space-y-6 py-8">
            <div className="flex justify-center">
              <Loader2 size={64} className="text-indigo-600 animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Generating Timetable...</h3>
              <p className="text-slate-500 animate-pulse">{message}</p>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden max-w-md mx-auto">
              <div className="bg-indigo-600 h-full w-2/3 animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6 py-4">
            <div className="flex justify-center">
              <div className="p-4 bg-emerald-100 rounded-full text-emerald-600">
                <CheckCircle2 size={48} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">Success!</h3>
              <p className="text-slate-600">{message}</p>
            </div>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => setStatus('idle')}
                className="px-6 py-3 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Generate Again
              </button>
              <a 
                href="/viewer"
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
              >
                View Timetables
              </a>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6 py-4">
            <div className="flex justify-center">
              <div className="p-4 bg-red-100 rounded-full text-red-600">
                <AlertCircle size={48} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">Generation Failed</h3>
              <p className="text-red-600 font-medium">{message}</p>
            </div>
            <button 
              onClick={() => setStatus('idle')}
              className="px-8 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard 
          title="Conflict-Free" 
          desc="Ensures no staff member is assigned to multiple classes simultaneously." 
        />
        <FeatureCard 
          title="Lab Continuity" 
          desc="Automatically schedules lab sessions in consecutive periods." 
        />
        <FeatureCard 
          title="Hour Compliance" 
          desc="Guarantees every subject gets exactly its required weekly hours." 
        />
      </div>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <h4 className="font-bold text-slate-900 mb-2">{title}</h4>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}
