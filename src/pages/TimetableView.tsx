import React, { useState, useEffect } from "react";
import { timetableApi, rulesApi, staffApi, subjectApi } from "../services/api";
import { Printer, FileText, Table as TableIcon, ChevronLeft, ChevronRight, User, Coffee, BookOpen, Sun, Clock } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { useDepartment } from "../context/DepartmentContext";

// ─── Staff Day View ────────────────────────────────────────────────────────────
function StaffDayView({ timetables, staff, rules }: { timetables: any[]; staff: any[]; rules: any }) {
  const staffNames: string[] = Array.from(new Set(staff.map((s: any) => s.name)));
  const [selectedStaff, setSelectedStaff] = useState<string>(staffNames[0] || "");
  const [selectedDay, setSelectedDay] = useState<string>(rules.days[0] || "");

  // Build the day schedule for the selected staff on the selected day
  const daySchedule: (any | null)[] = Array(rules.periodsPerDay).fill(null);
  timetables.forEach((t) => {
    const dayData: any[] = t.data[selectedDay] || [];
    dayData.forEach((slot: any, period: number) => {
      if (slot && slot.staffName === selectedStaff) {
        daySchedule[period] = { ...slot, classId: t.classId };
      }
    });
  });

  const teachingCount = daySchedule.filter(Boolean).length;
  const freeCount = rules.periodsPerDay - teachingCount;

  // Accent colours cycling for variety
  const subjectColors = [
    "from-indigo-500 to-indigo-600",
    "from-violet-500 to-purple-600",
    "from-sky-500 to-blue-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-500",
    "from-pink-500 to-rose-600",
  ];
  const colorMap: Record<string, string> = {};
  let colorIdx = 0;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-200/60 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Staff picker */}
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2.5 bg-indigo-100 rounded-xl">
            <User size={20} className="text-indigo-600" />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Staff Member</label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              {staffNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Teaching load summary */}
        <div className="flex gap-4 flex-shrink-0">
          <div className="text-center px-5 py-3 bg-indigo-50 rounded-2xl border border-indigo-100">
            <p className="text-2xl font-black text-indigo-600">{teachingCount}</p>
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Teaching</p>
          </div>
          <div className="text-center px-5 py-3 bg-emerald-50 rounded-2xl border border-emerald-100">
            <p className="text-2xl font-black text-emerald-600">{freeCount}</p>
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Free</p>
          </div>
        </div>
      </div>

      {/* Day tabs */}
      <div className="flex flex-wrap gap-2">
        {rules.days.map((day: string) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
              selectedDay === day
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105"
                : "bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Day header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-amber-100 rounded-xl">
          <Sun size={20} className="text-amber-600" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900">{selectedDay}</h3>
          <p className="text-xs text-slate-400 font-medium">{selectedStaff} — {rules.periodsPerDay} periods total</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {daySchedule.map((slot, idx) => {
          const isLunchAfter = idx === 3; // after P4 comes lunch

          // Assign a colour per subject code
          if (slot && !colorMap[slot.subjectCode]) {
            colorMap[slot.subjectCode] = subjectColors[colorIdx++ % subjectColors.length];
          }
          const gradient = slot ? colorMap[slot.subjectCode] : null;

          return (
            <React.Fragment key={idx}>
              {/* Period card */}
              <div
                className={`flex items-stretch gap-4 rounded-2xl overflow-hidden border transition-all duration-300 ${
                  slot
                    ? "border-transparent shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                {/* Period number pill */}
                <div
                  className={`flex flex-col items-center justify-center w-16 flex-shrink-0 py-4 ${
                    slot ? `bg-gradient-to-b ${gradient} text-white` : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <Clock size={14} className="mb-1 opacity-80" />
                  <span className="text-xs font-black tracking-wide">P{idx + 1}</span>
                </div>

                {/* Content */}
                <div className="flex-1 py-4 pr-4">
                  {slot ? (
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`bg-gradient-to-r ${gradient} text-transparent bg-clip-text font-black text-base tracking-tight`}>
                            {slot.subjectCode}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800">{slot.subjectName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                          {slot.classId}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 py-1">
                      <Coffee size={16} />
                      <span className="text-sm font-medium italic">Free Period</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Lunch break separator after P4 */}
              {isLunchAfter && (
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-emerald-200" />
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5">
                    <Coffee size={14} className="text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Lunch Break</span>
                  </div>
                  <div className="flex-1 h-px bg-emerald-200" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default function TimetableView() {
  const { selectedDepartment } = useDepartment();
  const [timetables, setTimetables] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [rules, setRules] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'class' | 'staff' | 'day'>('class');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [dragSlot, setDragSlot] = useState<{day: string, period: number} | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [editSlot, setEditSlot] = useState<{day: string, period: number} | null>(null);
  const [editForm, setEditForm] = useState({ subjectCode: '', staffId: '' });

  useEffect(() => {
    if (selectedDepartment) {
      fetchData();
    }
  }, [selectedDepartment]);

  const fetchData = async () => {
    if (!selectedDepartment) return;
    try {
      const [tRes, rRes, sRes, subRes] = await Promise.all([
        timetableApi.getAll(selectedDepartment._id), 
        rulesApi.get(selectedDepartment._id),
        staffApi.getAll(selectedDepartment._id),
        subjectApi.getAll(selectedDepartment._id)
      ]);
      setTimetables(tRes.data);
      setRules(rRes.data);
      setStaff(sRes.data);
      setSubjects(subRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF() as any;
    const current = timetables[currentIndex];
    if (!current) return;

    doc.text(`Timetable - ${current.classId}`, 14, 15);
    
    const head = [["Day", ...Array.from({ length: rules.periodsPerDay }, (_, i) => `P${i + 1}`)]];
    const body = rules.days.map((day: string) => {
      const row = [day];
      const dayData = current.data[day] || [];
      for (let i = 0; i < rules.periodsPerDay; i++) {
        row.push(dayData[i] ? `${dayData[i].subjectCode}\n(${dayData[i].staffName})` : "-");
      }
      return row;
    });

    doc.autoTable({
      head: head,
      body: body,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save(`Timetable_${current.classId}.pdf`);
  };

  const exportExcel = () => {
    const current = timetables[currentIndex];
    if (!current) return;

    const data = rules.days.map((day: string) => {
      const row: any = { Day: day };
      const dayData = current.data[day] || [];
      for (let i = 0; i < rules.periodsPerDay; i++) {
        row[`P${i + 1}`] = dayData[i] ? `${dayData[i].subjectCode} (${dayData[i].staffName})` : "-";
      }
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Timetable");
    XLSX.writeFile(wb, `Timetable_${current.classId}.xlsx`);
  };

  const handleDragStart = (e: any, day: string, period: number) => {
    if (!isEditMode || viewMode !== 'class') return;
    setDragSlot({ day, period });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: any) => {
    if (!isEditMode || viewMode !== 'class') return;
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: any, targetDay: string, targetPeriod: number) => {
    e.preventDefault();
    if (!isEditMode || viewMode !== 'class' || !dragSlot) return;
    if (dragSlot.day === targetDay && dragSlot.period === targetPeriod) return;

    const currentTable = timetables[currentIndex];
    const newData = JSON.parse(JSON.stringify(currentTable.data));
    
    // Swap the slots
    const temp = newData[dragSlot.day][dragSlot.period];
    newData[dragSlot.day][dragSlot.period] = newData[targetDay][targetPeriod];
    newData[targetDay][targetPeriod] = temp;
    
    // Optimistic Update
    const updatedTimetables = [...timetables];
    updatedTimetables[currentIndex] = { ...currentTable, data: newData };
    setTimetables(updatedTimetables);
    
    try {
      await timetableApi.update(currentTable._id, { data: newData });
    } catch (err) {
      alert("Failed to save timetable changes.");
      fetchData(); // Rollback on fail
    }
    setDragSlot(null);
  };

  const handleSaveEdit = async () => {
    if (!editSlot) return;
    const currentTable = timetables[currentIndex];
    const newData = JSON.parse(JSON.stringify(currentTable.data));
    const { day, period } = editSlot;

    if (!editForm.subjectCode || !editForm.staffId) {
      newData[day][period] = null;
    } else {
      const sub = subjects.find(s => s.code === editForm.subjectCode);
      const stf = staff.find(s => s.staffId === editForm.staffId);
      newData[day][period] = {
        subjectCode: editForm.subjectCode,
        subjectName: sub?.name || "",
        staffId: editForm.staffId,
        staffName: stf?.name || ""
      };
    }

    const updatedTimetables = [...timetables];
    updatedTimetables[currentIndex] = { ...currentTable, data: newData };
    setTimetables(updatedTimetables);
    setEditSlot(null);

    try {
      await timetableApi.update(currentTable._id, { data: newData });
    } catch (err) {
      alert("Failed to save cell edit.");
      fetchData();
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  if (timetables.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
        <TableIcon size={48} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">No Timetables Found</h2>
        <p className="text-slate-500 mb-6">You need to generate a timetable first.</p>
        <a href="/generator" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">Go to Generator</a>
      </div>
    );
  }

  const current = viewMode === 'class' 
    ? timetables[currentIndex] 
    : (() => {
        const staffList = Array.from(new Set(staff.map(s => s.name)));
        const staffName = staffList[currentIndex];
        if (!staffName) return null;

        const staffData: any = {};
        rules.days.forEach((day: string) => {
          staffData[day] = Array(rules.periodsPerDay).fill(null);
          timetables.forEach(t => {
            const dayData = t.data[day] || [];
            dayData.forEach((slot: any, period: number) => {
              if (slot && slot.staffName === staffName) {
                staffData[day][period] = {
                  ...slot,
                  classId: t.classId
                };
              }
            });
          });
        });

        return { classId: staffName, data: staffData, isStaff: true };
      })();

  const totalItems = viewMode === 'class' ? timetables.length : staff.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in delay-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Timetable Viewer</h1>
          <p className="text-slate-500">View and export generated schedules.</p>
        </div>
        
        <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => { setViewMode('class'); setCurrentIndex(0); }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'class' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            By Class
          </button>
          <button 
            onClick={() => { setViewMode('staff'); setCurrentIndex(0); }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'staff' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            By Staff
          </button>
          <button 
            onClick={() => { setViewMode('day'); setCurrentIndex(0); }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${viewMode === 'day' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Staff Day View
          </button>
        </div>
      </div>

      {/* ── Staff Day View ─────────────────────────────────────── */}
      {viewMode === 'day' && (
        <div className="animate-slide-up delay-150">
          <StaffDayView timetables={timetables} staff={staff} rules={rules} />
        </div>
      )}

      {viewMode !== 'day' && (
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 space-y-8 animate-slide-up delay-150">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-30"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-900 min-w-[120px] text-center">
              {current?.classId || "N/A"}
            </h2>
            <button 
              onClick={() => setCurrentIndex(prev => Math.min(totalItems - 1, prev + 1))}
              disabled={currentIndex === totalItems - 1}
              className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-30"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {viewMode === 'class' && (
              <button 
                onClick={() => setIsEditMode(!isEditMode)} 
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm font-bold ${isEditMode ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 shadow-inner' : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 shadow-sm'}`}
              >
                <span>{isEditMode ? 'Done Editing' : 'Drag & Drop Edit'}</span>
              </button>
            )}
            <button onClick={exportPDF} className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-bold">
              <FileText size={16} />
              <span>PDF</span>
            </button>
            <button onClick={exportExcel} className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-bold">
              <TableIcon size={16} />
              <span>Excel</span>
            </button>
            <button onClick={() => window.print()} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-bold">
              <Printer size={16} />
              <span>Print</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200/60 rounded-2xl shadow-sm bg-white/50">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-slate-200/60 p-4 text-slate-700 font-bold w-32">Day</th>
                {Array.from({ length: rules.periodsPerDay }, (_, i) => (
                  <React.Fragment key={i}>
                    <th className="border border-slate-200/60 p-4 text-slate-700 font-bold text-center min-w-[140px]">P{i + 1}</th>
                    {i === 3 && (
                      <th className="border border-slate-200/60 py-4 px-2 text-emerald-600 font-black text-center bg-emerald-50/50 shadow-inner w-12 tracking-widest align-middle">
                        <div className="flex flex-col items-center justify-center space-y-1 text-[10px]">
                          <span>L</span><span>U</span><span>N</span><span>C</span><span>H</span>
                        </div>
                      </th>
                    )}
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {rules.days.map((day: string) => (
                <tr key={day}>
                  <td className="border p-4 font-bold bg-slate-50/50">{day}</td>
                  {Array.from({ length: rules.periodsPerDay }, (_, i) => {
                    const slot = current.data[day]?.[i];
                      return (
                        <React.Fragment key={i}>
                          <td 
                            className={`border border-slate-200/60 p-4 text-center min-w-[140px] transition-all duration-300 ${slot ? 'bg-indigo-50/40 hover:bg-indigo-50/80' : 'hover:bg-slate-50/80'} ${isEditMode && viewMode === 'class' ? 'cursor-grab active:cursor-grabbing hover:border-dashed hover:border-indigo-400 hover:border-2' : ''}`}
                            draggable={isEditMode && viewMode === 'class'}
                            onDragStart={(e) => handleDragStart(e, day, i)}
                            onDrop={(e) => handleDrop(e, day, i)}
                            onDragOver={handleDragOver}
                            onClick={() => {
                              if (isEditMode && viewMode === 'class') {
                                setEditSlot({ day, period: i });
                                setEditForm({
                                  subjectCode: slot?.subjectCode || '',
                                  staffId: slot?.staffId || ''
                                });
                              }
                            }}
                          >
                            {slot ? (
                              <div className="space-y-1.5 transform transition-transform hover:scale-105 pointer-events-none">
                                <div className="font-extrabold text-indigo-700 tracking-tight">{slot.subjectCode}</div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider leading-tight">{slot.subjectName}</div>
                                {viewMode === 'class' ? (
                                  <div className="text-[11px] text-slate-400 italic bg-white/60 inline-block px-2 py-0.5 rounded-full">{slot.staffName}</div>
                                ) : (
                                  <div className="text-[11px] text-indigo-700 font-bold bg-indigo-100/50 inline-block px-2 py-0.5 rounded-full">{slot.classId}</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          {i === 3 && <td className="bg-emerald-50/20 border-x border-emerald-200/50 min-w-[48px]"></td>}
                        </React.Fragment>
                      );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Edit Slot Modal */}
      {editSlot && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 relative shadow-2xl shadow-indigo-900/10 border border-slate-100 animate-slide-up">
            <button 
              onClick={() => setEditSlot(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">
              Edit {editSlot.day} - P{editSlot.period + 1}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <select 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editForm.subjectCode}
                  onChange={e => setEditForm({...editForm, subjectCode: e.target.value})}
                >
                  <option value="">-- Free Period (Empty) --</option>
                  {subjects.map(s => (
                    <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>
              {editForm.subjectCode && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Staff Member</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={editForm.staffId}
                    onChange={e => setEditForm({...editForm, staffId: e.target.value})}
                  >
                    <option value="">-- Select Staff --</option>
                    {staff.filter(s => s.subjects.includes(editForm.subjectCode)).map(s => (
                      <option key={s.staffId} value={s.staffId}>{s.name}</option>
                    ))}
                    {/* Fallback to show all staff if the subject filter yields nothing or if they want to override */}
                    <option disabled>──────────</option>
                    {staff.map(s => (
                      <option key={`all-${s.staffId}`} value={s.staffId}>{s.name} (All)</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="pt-4 flex items-center justify-end space-x-3">
                <button 
                  onClick={() => setEditSlot(null)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveEdit}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
