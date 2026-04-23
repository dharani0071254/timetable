/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  School, 
  Settings, 
  Cpu, 
  Calendar,
  LogOut,
  Menu,
  X,
  Plus,
  Trash2
} from "lucide-react";
import { DepartmentProvider, useDepartment } from "./context/DepartmentContext";
import { departmentApi } from "./services/api";

// Pages
import Dashboard from "./pages/Dashboard";
import StaffManagement from "./pages/StaffManagement";
import SubjectManagement from "./pages/SubjectManagement";
import ClassManagement from "./pages/ClassManagement";
import RulesConfig from "./pages/RulesConfig";
import TimetableGenerator from "./pages/TimetableGenerator";
import TimetableView from "./pages/TimetableView";
import Login from "./pages/Login";

function AppContent() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default true for demo
  const { departments, selectedDepartment, setSelectedDepartment, refreshDepartments, loading } = useDepartment();
  const [isNewDeptModalOpen, setNewDeptModalOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    try {
      const res = await departmentApi.create({ name: newDeptName });
      await refreshDepartments();
      setSelectedDepartment(res.data);
      setNewDeptName("");
      setNewDeptModalOpen(false);
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to create department";
      alert(msg);
    }
  };

  const handleDeleteDept = async (id: string) => {
    if (confirm("Are you sure? This will delete ALL data for this department!")) {
      await departmentApi.delete(id);
      await refreshDepartments();
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Loading...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex">
        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[90] md:hidden animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside className={`${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-20'} bg-slate-950 text-slate-300 border-r border-slate-800/50 transition-all duration-300 flex flex-col fixed inset-y-0 left-0 h-full z-[100] shadow-2xl`}>
          <div className="p-6 flex items-center justify-between">
            <div className={`flex items-center space-x-3 ${!isSidebarOpen && 'md:justify-center w-full'}`}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg shadow-indigo-500/30">
                P
              </div>
              <h1 className={`font-bold text-xl tracking-tight text-white ${!isSidebarOpen && 'md:hidden'}`}>ProScheduler</h1>
            </div>
            {isSidebarOpen && (
              <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            )}
          </div>
          {!isSidebarOpen && (
            <div className="hidden md:flex justify-center mb-6">
              <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
                <Menu size={20} />
              </button>
            </div>
          )}

          {/* Department Selector */}
          <div className={`px-4 mb-4 ${!isSidebarOpen && 'md:hidden'}`}>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Department / Config</label>
            <div className="space-y-2">
              <select 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedDepartment?._id || ""}
                onChange={(e) => {
                  const dept = departments.find(d => d._id === e.target.value);
                  setSelectedDepartment(dept || null);
                }}
              >
                {departments.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setNewDeptModalOpen(true)}
                  className="flex-1 flex items-center justify-center space-x-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 hover:text-indigo-300 text-[10px] font-bold py-1 px-2 rounded transition-all border border-indigo-500/20"
                >
                  <Plus size={12} />
                  <span>New</span>
                </button>
                {selectedDepartment && (
                  <button 
                    onClick={() => handleDeleteDept(selectedDepartment._id)}
                    className="flex items-center justify-center bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-[10px] font-bold py-1 px-2 rounded transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
            <NavItem onClick={() => window.innerWidth < 768 && setSidebarOpen(false)} to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" isOpen={isSidebarOpen} disabled={!selectedDepartment} />
            <NavItem onClick={() => window.innerWidth < 768 && setSidebarOpen(false)} to="/staff" icon={<Users size={20} />} label="Staff" isOpen={isSidebarOpen} disabled={!selectedDepartment} />
            <NavItem onClick={() => window.innerWidth < 768 && setSidebarOpen(false)} to="/subjects" icon={<BookOpen size={20} />} label="Subjects" isOpen={isSidebarOpen} disabled={!selectedDepartment} />
            <NavItem onClick={() => window.innerWidth < 768 && setSidebarOpen(false)} to="/classes" icon={<School size={20} />} label="Classes" isOpen={isSidebarOpen} disabled={!selectedDepartment} />
            <NavItem onClick={() => window.innerWidth < 768 && setSidebarOpen(false)} to="/rules" icon={<Settings size={20} />} label="Rules" isOpen={isSidebarOpen} disabled={!selectedDepartment} />
            <NavItem onClick={() => window.innerWidth < 768 && setSidebarOpen(false)} to="/generator" icon={<Cpu size={20} />} label="Generator" isOpen={isSidebarOpen} disabled={!selectedDepartment} />
            <NavItem onClick={() => window.innerWidth < 768 && setSidebarOpen(false)} to="/viewer" icon={<Calendar size={20} />} label="Viewer" isOpen={isSidebarOpen} disabled={!selectedDepartment} />
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button 
              onClick={() => setIsAuthenticated(false)}
              className="flex items-center space-x-3 px-4 py-3 w-full text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              {(isSidebarOpen || window.innerWidth < 768) && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'} p-4 md:p-8 bg-slate-50/50 relative overflow-x-hidden min-h-screen`}>
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30">
                P
              </div>
              <h1 className="font-bold text-xl tracking-tight text-slate-900">ProScheduler</h1>
            </div>
            <button onClick={() => setSidebarOpen(true)} className="p-2 bg-white border border-slate-200 shadow-sm rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
              <Menu size={20} />
            </button>
          </div>

          {/* Decorative background blob */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 animate-fade-in">
            {!selectedDepartment ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 pt-10 md:pt-20">
                <div className="p-6 md:p-10 bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 max-w-md w-full animate-slide-up text-center mx-4 md:mx-0">
                  <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <School size={40} className="text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome to ProScheduler</h2>
                  <p className="text-slate-500 mt-3 text-sm leading-relaxed">Let's get started by creating your first department or selecting an existing configuration.</p>
                  <button 
                    onClick={() => setNewDeptModalOpen(true)}
                    className="mt-8 w-full bg-slate-900 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-900/10"
                  >
                    Create Department
                  </button>
                </div>
              </div>
            ) : (
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/staff" element={<StaffManagement />} />
              <Route path="/subjects" element={<SubjectManagement />} />
              <Route path="/classes" element={<ClassManagement />} />
              <Route path="/rules" element={<RulesConfig />} />
              <Route path="/generator" element={<TimetableGenerator />} />
              <Route path="/viewer" element={<TimetableView />} />
              </Routes>
            )}
          </div>
        </main>

        {/* New Department Modal */}
        {isNewDeptModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
            <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 relative shadow-2xl shadow-indigo-900/10 border border-slate-100 animate-slide-up">
              <button 
                onClick={() => setNewDeptModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">New Department</h2>
              <form onSubmit={handleCreateDept} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department Name</label>
                  <input 
                    type="text" 
                    required
                    autoFocus
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Computer Science"
                    value={newDeptName}
                    onChange={e => setNewDeptName(e.target.value)}
                  />
                </div>
                  <button 
                    type="submit"
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-indigo-600 shadow-md shadow-slate-900/10 transition-colors mt-2"
                  >
                    Create
                  </button>
                </form>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <DepartmentProvider>
      <AppContent />
    </DepartmentProvider>
  );
}

function NavItem({ to, icon, label, isOpen, disabled, onClick }: { to: string, icon: any, label: string, isOpen: boolean, disabled?: boolean, onClick?: () => void }) {
  if (disabled) {
    return (
      <div className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-600 cursor-not-allowed opacity-50">
        {icon}
        {(isOpen || window.innerWidth < 768) && <span className="font-medium">{label}</span>}
      </div>
    );
  }

  return (
    <NavLink 
      to={to} 
      onClick={onClick}
      className={({ isActive }) => `
        group relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300
        ${isActive ? 'bg-indigo-500/10' : 'hover:bg-slate-800/50'}
      `}
    >
      {({ isActive }) => (
        <>
          {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full" />}
          <span className={`${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-white'} transition-colors duration-300`}>
            {icon}
          </span>
          {(isOpen || window.innerWidth < 768) && <span className={`font-medium tracking-wide ${isActive ? 'text-indigo-100' : 'text-slate-300 group-hover:text-white'} transition-colors duration-300`}>{label}</span>}
        </>
      )}
    </NavLink>
  );
}

