import { useState, useEffect } from "react";
import { staffApi, subjectApi, classApi, timetableApi, seedApi, departmentApi } from "../services/api";
import { Users, BookOpen, School, CalendarCheck, Cpu } from "lucide-react";
import { useDepartment } from "../context/DepartmentContext";

export default function Dashboard() {
  const { selectedDepartment, departments, setSelectedDepartment, refreshDepartments } = useDepartment();
  const [stats, setStats] = useState({
    staff: 0,
    subjects: 0,
    classes: 0,
    timetables: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedDepartment) return;
      try {
        const [staff, subjects, classes, timetables] = await Promise.all([
          staffApi.getAll(selectedDepartment._id),
          subjectApi.getAll(selectedDepartment._id),
          classApi.getAll(selectedDepartment._id),
          timetableApi.getAll(selectedDepartment._id)
        ]);
        setStats({
          staff: staff.data.length,
          subjects: subjects.data.length,
          classes: classes.data.length,
          timetables: timetables.data.length
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [selectedDepartment]);

  const [isSettingUp, setIsSettingUp] = useState(false);

  const handleQuickSetupECE = async () => {
    setIsSettingUp(true);
    try {
      // 1. Create ECE department if it doesn't exist
      let eceDept = departments.find(d => d.name === "Electronics and Communication Engineering (ECE)");
      if (!eceDept) {
        const res = await departmentApi.create({ 
          name: "Electronics and Communication Engineering (ECE)", 
          description: "Department of Electronics and Communication Engineering" 
        });
        eceDept = res.data;
        await refreshDepartments();
      }
      
      // 2. Select it
      setSelectedDepartment(eceDept);
      
      // 3. Seed it
      await seedApi.seed(eceDept._id);
      
      // 4. Generate Timetable
      await timetableApi.generate(eceDept._id);
      
      alert("ECE Department setup complete with a generated timetable!");
      window.location.href = "/viewer";
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.error || "Error during quick setup. Please try again.";
      alert(msg);
    } finally {
      setIsSettingUp(false);
    }
  };

  if (!selectedDepartment) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-8">
        <div className="p-10 bg-white rounded-[40px] border border-slate-100 text-center max-w-2xl shadow-2xl shadow-indigo-100/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
          <div className="bg-indigo-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <School className="text-indigo-600" size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Ready for your Demo? 🚀</h2>
          <p className="text-slate-500 mb-10 text-lg leading-relaxed">
            I've prepared a complete <b>ECE Department</b> configuration with subjects, staff, and a generated timetable. Click below to launch the demo instantly.
          </p>
          <button 
            onClick={handleQuickSetupECE}
            disabled={isSettingUp}
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20 flex items-center justify-center space-x-3 disabled:opacity-50 group"
          >
            {isSettingUp ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Building Demo...</span>
              </>
            ) : (
              <>
                <Cpu size={24} className="group-hover:rotate-12 transition-transform" />
                <span>Launch ECE Demo Mode</span>
              </>
            )}
          </button>
          <p className="mt-6 text-xs text-slate-400 font-medium uppercase tracking-widest">
            One-click: Dept + Rules + Staff + Subjects + Timetable
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tutorial Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-[2rem] p-10 text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden animate-slide-up">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 relative z-10">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-2">Welcome to your Timetable Scheduler! 🎓</h2>
            <p className="text-indigo-100 mb-6 font-medium">Follow these simple steps to generate a conflict-free schedule for your department.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div className="bg-white/20 rounded-lg p-2 mt-1 min-w-[32px] flex items-center justify-center">
                  <span className="font-bold text-sm">01</span>
                </div>
                <div>
                  <h4 className="font-bold">Add Subjects</h4>
                  <p className="text-xs text-indigo-100">Define all courses, their types (Theory/Lab), and weekly hours.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-white/20 rounded-lg p-2 mt-1 min-w-[32px] flex items-center justify-center">
                  <span className="font-bold text-sm">02</span>
                </div>
                <div>
                  <h4 className="font-bold">Register Staff</h4>
                  <p className="text-xs text-indigo-100">Add faculty members and assign the subjects they are qualified to teach.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-white/20 rounded-lg p-2 mt-1 min-w-[32px] flex items-center justify-center">
                  <span className="font-bold text-sm">03</span>
                </div>
                <div>
                  <h4 className="font-bold">Define Classes</h4>
                  <p className="text-xs text-indigo-100">Create sections (e.g., ECE 3A) and assign the required subjects for that semester.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-white/20 rounded-lg p-2 mt-1 min-w-[32px] flex items-center justify-center">
                  <span className="font-bold text-sm">04</span>
                </div>
                <div>
                  <h4 className="font-bold">Generate!</h4>
                  <p className="text-xs text-indigo-100">Go to the Generator and let the algorithm handle the complex scheduling.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 h-full">
              <h4 className="font-bold mb-2 flex items-center space-x-2">
                <CalendarCheck size={18} />
                <span>Pro Tip</span>
              </h4>
              <p className="text-xs text-indigo-100 leading-relaxed mb-4">
                Use the "Quick Setup ECE" button to instantly populate a department with realistic data and a generated timetable!
              </p>
              <button 
                onClick={handleQuickSetupECE}
                disabled={isSettingUp}
                className="w-full bg-white text-indigo-600 py-2 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSettingUp ? "Setting up..." : "Quick Setup ECE"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="animate-fade-in delay-100">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 mt-2 font-medium">Manage resources for <span className="text-indigo-600 font-bold">{selectedDepartment.name}</span>.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up delay-150">
        <StatCard icon={<Users className="text-blue-600" />} label="Total Staff" value={stats.staff} color="blue" />
        <StatCard icon={<BookOpen className="text-emerald-600" />} label="Subjects" value={stats.subjects} color="emerald" />
        <StatCard icon={<School className="text-amber-600" />} label="Classes" value={stats.classes} color="amber" />
        <StatCard icon={<CalendarCheck className="text-indigo-600" />} label="Timetables" value={stats.timetables} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up delay-200">
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 hover:shadow-xl transition-all">
          <h2 className="text-xl font-bold text-slate-800 mb-6 tracking-tight">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <QuickActionLink to="/staff" label="Add Staff" color="blue" />
            <QuickActionLink to="/subjects" label="Add Subject" color="emerald" />
            <QuickActionLink to="/classes" label="Manage Classes" color="amber" />
            <QuickActionLink to="/generator" label="Generate Timetable" color="indigo" />
          </div>
          <button 
            onClick={async () => {
              if(confirm("This will add sample data to the current department. Continue?")) {
                await seedApi.seed(selectedDepartment._id);
                window.location.reload();
              }
            }}
            className="w-full mt-4 p-3 border border-dashed border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            Seed Sample Data
          </button>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 hover:shadow-xl transition-all">
          <h2 className="text-xl font-bold text-slate-800 mb-6 tracking-tight">System Status</h2>
          <div className="space-y-4">
            <StatusItem label="Database Connection" status="Connected" color="emerald" />
            <StatusItem label="Algorithm Engine" status="Ready" color="blue" />
            <StatusItem label="Last Generation" status={stats.timetables > 0 ? "Successful" : "Never"} color={stats.timetables > 0 ? "emerald" : "slate"} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    indigo: "bg-indigo-50 text-indigo-600"
  };

  return (
    <div className="p-6 rounded-[1.5rem] bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center space-x-5 group">
      <div className={`p-4 rounded-xl shadow-inner ${colors[color]} group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function QuickActionLink({ to, label, color }: { to: string, label: string, color: string }) {
  const colors: any = {
    blue: "hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-lg hover:shadow-blue-600/20 text-blue-700 border-blue-200 bg-blue-50/50",
    emerald: "hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:shadow-lg hover:shadow-emerald-600/20 text-emerald-700 border-emerald-200 bg-emerald-50/50",
    amber: "hover:bg-amber-600 hover:text-white hover:border-amber-600 hover:shadow-lg hover:shadow-amber-600/20 text-amber-900 border-amber-200 bg-amber-50/50",
    indigo: "hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-600/20 text-indigo-700 border-indigo-200 bg-indigo-50/50"
  };

  return (
    <a href={to} className={`p-4 border rounded-xl text-center font-bold text-sm transition-all duration-300 ${colors[color]}`}>
      {label}
    </a>
  );
}

function StatusItem({ label, status, color }: { label: string, status: string, color: string }) {
  const dotColors: any = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    slate: "bg-slate-400"
  };

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
      <span className="text-slate-600 font-medium">{label}</span>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${dotColors[color]}`}></div>
        <span className="text-slate-900 font-semibold">{status}</span>
      </div>
    </div>
  );
}
