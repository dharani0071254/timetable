import { useState, FormEvent } from "react";
import { LogIn, ShieldCheck } from "lucide-react";

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Simplified login for demo
    if (email && password) {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-indigo-600 p-10 text-center text-white space-y-2">
          <div className="inline-flex p-3 bg-white/20 rounded-2xl mb-2">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-3xl font-bold">HOD Portal</h1>
          <p className="text-indigo-100">College Timetable Scheduler</p>
        </div>
        
        <div className="p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="hod@college.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Password</label>
              <input 
                type="password" 
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20 active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              <LogIn size={20} />
              <span>Login to Dashboard</span>
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              Forgot your password? <a href="#" className="text-indigo-600 font-bold hover:underline">Contact Admin</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
