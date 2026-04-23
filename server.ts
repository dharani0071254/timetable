import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

let __filename = "";
let __dirname = "";
try {
  __filename = import.meta.url.startsWith('file://') ? fileURLToPath(import.meta.url) : import.meta.url;
  __dirname = path.dirname(__filename);
} catch (e) {
  __filename = import.meta.url;
  __dirname = path.dirname(__filename);
}

dotenv.config();

// --- Models ---
const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  createdAt: { type: Date, default: Date.now },
});

const staffSchema = new mongoose.Schema({
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  staffId: { type: String, required: true },
  name: { type: String, required: true },
  subjects: [String], // Subject codes
  maxHoursPerWeek: { type: Number, default: 20 },
  maxClassesPerDay: { type: Number, default: 4 },
});
staffSchema.index({ staffId: 1, departmentId: 1 }, { unique: true });

const subjectSchema = new mongoose.Schema({
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ["Theory", "Lab"], required: true },
  hoursPerWeek: { type: Number, required: true },
  semester: { type: Number, required: true },
});
subjectSchema.index({ code: 1, departmentId: 1 }, { unique: true });

const classSchema = new mongoose.Schema({
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  name: { type: String, required: true },
  semester: { type: Number, required: true },
  subjects: [String], // Subject codes
  fixedTimings: [
    {
      subjectCode: String,
      day: String,
      startPeriod: Number,
      hours: Number
    }
  ]
});
classSchema.index({ name: 1, departmentId: 1 }, { unique: true });

const rulesSchema = new mongoose.Schema({
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true, unique: true },
  periodsPerDay: { type: Number, default: 7 },
  days: [String], // ["Monday", "Tuesday", ...]
  semesterType: { type: String, enum: ["Odd", "Even"], default: "Odd" },
  maxSubjectPeriodsPerDay: { type: Number, default: 2 },
});

const timetableSchema = new mongoose.Schema({
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  classId: String,
  data: mongoose.Schema.Types.Mixed, // { "Monday": [ { subjectCode, staffId }, ... ], ... }
  generatedAt: { type: Date, default: Date.now },
});

const Department = mongoose.model("Department", departmentSchema);
const Staff = mongoose.model("Staff", staffSchema);
const Subject = mongoose.model("Subject", subjectSchema);
const Class = mongoose.model("Class", classSchema);
const Rules = mongoose.model("Rules", rulesSchema);
const Timetable = mongoose.model("Timetable", timetableSchema);

// --- Server Setup ---
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // MongoDB Connection
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    })
      .then(() => console.log("Successfully connected to MongoDB Atlas"))
      .catch((err) => {
        console.error("MongoDB connection error:", err.message);
        console.error("Troubleshooting: Check your password, IP whitelist, and Secret key name.");
      });
  } else {
    console.warn("WARNING: MONGODB_URI is not defined. Database features will be unavailable.");
    console.warn("Please add MONGODB_URI to your Secrets panel in AI Studio.");
  }

  // --- API Routes ---

  // Departments
  app.get("/api/departments", async (req, res) => {
    try {
      const departments = await Department.find();
      res.json(departments);
    } catch (err: any) {
      console.error('GET /api/departments error:', err.message);
      res.status(500).json({ error: "Failed to fetch departments: " + err.message });
    }
  });
  app.post("/api/departments", async (req, res) => {
    try {
      const dept = new Department(req.body);
      await dept.save();
      res.json(dept);
    } catch (err: any) {
      if (err.code === 11000) {
        return res.status(400).json({ error: "A department with this name already exists." });
      }
      res.status(400).json({ error: err.message });
    }
  });
  app.delete("/api/departments/:id", async (req, res) => {
    try {
      const deptId = req.params.id;
      await Promise.all([
        Department.findByIdAndDelete(deptId),
        Staff.deleteMany({ departmentId: deptId }),
        Subject.deleteMany({ departmentId: deptId }),
        Class.deleteMany({ departmentId: deptId }),
        Rules.deleteMany({ departmentId: deptId }),
        Timetable.deleteMany({ departmentId: deptId }),
      ]);
      res.json({ message: "Department and all associated data deleted" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Staff
  app.get("/api/staff", async (req, res) => {
    try {
      const { departmentId } = req.query;
      if (!departmentId) return res.status(400).json({ error: "departmentId required" });
      const staff = await Staff.find({ departmentId });
      res.json(staff);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/staff", async (req, res) => {
    try {
      const staff = new Staff(req.body);
      await staff.save();
      res.json(staff);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });
  app.put("/api/staff/:id", async (req, res) => {
    try {
      const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(staff);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });
  app.delete("/api/staff/:id", async (req, res) => {
    try {
      await Staff.findByIdAndDelete(req.params.id);
      res.json({ message: "Deleted" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Subjects
  app.get("/api/subjects", async (req, res) => {
    try {
      const { departmentId } = req.query;
      if (!departmentId) return res.status(400).json({ error: "departmentId required" });
      const subjects = await Subject.find({ departmentId });
      res.json(subjects);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/subjects", async (req, res) => {
    try {
      const subject = new Subject(req.body);
      await subject.save();
      res.json(subject);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });
  app.put("/api/subjects/:id", async (req, res) => {
    try {
      const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(subject);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });
  app.delete("/api/subjects/:id", async (req, res) => {
    try {
      await Subject.findByIdAndDelete(req.params.id);
      res.json({ message: "Deleted" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Classes
  app.get("/api/classes", async (req, res) => {
    try {
      const { departmentId } = req.query;
      if (!departmentId) return res.status(400).json({ error: "departmentId required" });
      const classes = await Class.find({ departmentId });
      res.json(classes);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/classes", async (req, res) => {
    try {
      const cls = new Class(req.body);
      await cls.save();
      res.json(cls);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });
  app.put("/api/classes/:id", async (req, res) => {
    try {
      const cls = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(cls);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });
  app.delete("/api/classes/:id", async (req, res) => {
    try {
      await Class.findByIdAndDelete(req.params.id);
      res.json({ message: "Deleted" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Rules
  app.get("/api/rules", async (req, res) => {
    try {
      const { departmentId } = req.query;
      if (!departmentId) return res.status(400).json({ error: "departmentId required" });
      let rules = await Rules.findOne({ departmentId });
      if (!rules) {
        rules = new Rules({
          departmentId,
          periodsPerDay: 7,
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          semesterType: "Odd",
          maxSubjectPeriodsPerDay: 2
        });
        await rules.save();
      }
      res.json(rules);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/rules", async (req, res) => {
    try {
      const { departmentId } = req.body;
      if (!departmentId) return res.status(400).json({ error: "departmentId required" });
      let rules = await Rules.findOne({ departmentId });
      if (rules) {
        Object.assign(rules, req.body);
        await rules.save();
      } else {
        rules = new Rules(req.body);
        await rules.save();
      }
      res.json(rules);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Timetable Generation Logic
  app.post("/api/generate-timetable", async (req, res) => {
    try {
      const { departmentId } = req.body;
      if (!departmentId) return res.status(400).json({ error: "departmentId required" });

      const staff = await Staff.find({ departmentId });
      const subjects = await Subject.find({ departmentId });
      const classes = await Class.find({ departmentId });
      const rules = await Rules.findOne({ departmentId });

      if (!rules) return res.status(400).json({ error: "Rules not configured" });

      // Clear old timetables for this department
      await Timetable.deleteMany({ departmentId });

      // Constraint Satisfaction Backtracking Algorithm
      const classGrids: Record<string, Record<string, any[]>> = {};
      classes.forEach(cls => {
        classGrids[cls.name] = {};
        rules.days.forEach(day => {
          classGrids[cls.name][day] = new Array(rules.periodsPerDay).fill(null);
        });
      });

      // Track staff usage: staffId -> day -> period -> Boolean
      const staffBusy: Record<string, Record<string, boolean[]>> = {};
      staff.forEach(s => {
        staffBusy[s.staffId] = {};
        rules.days.forEach(day => {
          staffBusy[s.staffId][day] = new Array(rules.periodsPerDay).fill(false);
        });
      });

      // 1. Pre-fill Fixed Timings for all classes
      classes.forEach(cls => {
        if (cls.fixedTimings && Array.isArray(cls.fixedTimings)) {
          cls.fixedTimings.forEach((ft: any) => {
            const subStaff = staff.find(s => s.subjects.includes(ft.subjectCode));
            const sub = subjects.find(s => s.code === ft.subjectCode);
            if (subStaff && sub && classGrids[cls.name][ft.day]) {
              for (let p = 0; p < ft.hours; p++) {
                const periodIndex = ft.startPeriod - 1 + p; // Fixed API uses 1-indexed startPeriod
                if (periodIndex >= 0 && periodIndex < rules.periodsPerDay) {
                  classGrids[cls.name][ft.day][periodIndex] = {
                    subjectCode: sub.code,
                    subjectName: sub.name,
                    staffName: subStaff.name,
                    staffId: subStaff.staffId
                  };
                  staffBusy[subStaff.staffId][ft.day][periodIndex] = true;
                }
              }
            }
          });
        }
      });

      // 2. Prepare Allocation Tasks
      const allocationTasks: any[] = [];

      for (const cls of classes) {
        const classSubjects = subjects.filter(s => cls.subjects.includes(s.code));
        
        for (const sub of classSubjects) {
          const subStaff = staff.find(s => s.subjects.includes(sub.code));
          if (!subStaff) continue; 

          let hoursNeeded = sub.hoursPerWeek;
          
          if (cls.fixedTimings && Array.isArray(cls.fixedTimings)) {
            const fixedForSub = cls.fixedTimings.filter((ft: any) => ft.subjectCode === sub.code);
            fixedForSub.forEach((ft: any) => {
              hoursNeeded -= ft.hours;
            });
          }
          if (hoursNeeded <= 0) continue;
          
          if (sub.type === "Lab") {
            let remaining = hoursNeeded;
            while (remaining >= 2) {
              allocationTasks.push({
                cls, subject: sub, staff: subStaff, type: "Lab", hours: 2
              });
              remaining -= 2;
            }
            if (remaining > 0) {
              allocationTasks.push({
                cls, subject: sub, staff: subStaff, type: "Lab", hours: remaining
              });
            }
          } else {
            for (let i = 0; i < hoursNeeded; i++) {
              allocationTasks.push({
                cls, subject: sub, staff: subStaff, type: "Theory", hours: 1
              });
            }
          }
        }
      }

      allocationTasks.sort((a, b) => {
        if (a.type === "Lab" && b.type !== "Lab") return -1;
        if (a.type !== "Lab" && b.type === "Lab") return 1;
        return (b.hours as number) - (a.hours as number); 
      });

      // 3. Backtracking Solvers
      const isValid = (task: any, day: string, startPeriod: number) => {
        if (startPeriod + task.hours > rules.periodsPerDay) return false;
        
        // Prevent block from crossing the lunch break (between P4 and P5, indices 3 and 4)
        if (startPeriod < 4 && startPeriod + task.hours > 4) return false;

        // Prevent multiple labs in the same half-day (Morning: P1-P4, Afternoon: P5-P7)
        if (task.type === "Lab") {
          const isMorning = startPeriod < 4;
          for (let p = 0; p < rules.periodsPerDay; p++) {
            if (classGrids[task.cls.name][day][p] !== null) {
              const existingSubCode = classGrids[task.cls.name][day][p].subjectCode;
              const existingSub = subjects.find(s => s.code === existingSubCode);
              if (existingSub && existingSub.type === "Lab") {
                const existingIsMorning = p < 4;
                if (isMorning === existingIsMorning) {
                  return false; // Found another lab in the same half-day
                }
              }
            }
          }
        }

        for (let p = 0; p < task.hours; p++) {
          const period = startPeriod + p;
          if (classGrids[task.cls.name][day][period] !== null) return false;
          if (task.subjectCode !== "NM" && staffBusy[task.staff.staffId][day][period]) return false;
        }

        if (task.type === "Theory") {
            let countInDay = 0;
            for(let p=0; p<rules.periodsPerDay; p++) {
                if (classGrids[task.cls.name][day][p]?.subjectCode === task.subject.code) {
                    countInDay++;
                }
            }
            const allowMax = rules.maxSubjectPeriodsPerDay || 2;
            if (countInDay + task.hours > allowMax) return false; 
        }

        let staffHoursInDay = 0;
        for(let p=0; p<rules.periodsPerDay; p++) {
            if(staffBusy[task.staff.staffId][day][p]) {
                staffHoursInDay++;
            }
        }
        const maxStaffClasses = task.staff.maxClassesPerDay || 4;
        if (staffHoursInDay + task.hours > maxStaffClasses) return false;

        return true;
      };

      const placeTask = (task: any, day: string, startPeriod: number) => {
        for (let p = 0; p < task.hours; p++) {
          const period = startPeriod + p;
          classGrids[task.cls.name][day][period] = {
            subjectCode: task.subject.code,
            subjectName: task.subject.name,
            staffName: task.staff.name,
            staffId: task.staff.staffId
          };
          staffBusy[task.staff.staffId][day][period] = true;
        }
      };

      const removeTask = (task: any, day: string, startPeriod: number) => {
        for (let p = 0; p < task.hours; p++) {
          const period = startPeriod + p;
          classGrids[task.cls.name][day][period] = null;
          staffBusy[task.staff.staffId][day][period] = false;
        }
      };

      let maxIndexReached = 0;

      const solve = (index: number): boolean => {
        if (index > maxIndexReached) {
          maxIndexReached = index;
        }
        
        if (index === allocationTasks.length) return true; 

        const task = allocationTasks[index];
        const shuffledDays = [...rules.days].sort(() => Math.random() - 0.5);

        for (const day of shuffledDays) {
          for (let period = 0; period <= rules.periodsPerDay - task.hours; period++) {
            if (isValid(task, day, period)) {
              placeTask(task, day, period);

              if (solve(index + 1)) return true;

              removeTask(task, day, period); 
            }
          }
        }

        return false;
      };

      const success = solve(0);

      const generatedTimetables = [];
      for (const cls of classes) {
        const newTimetable = new Timetable({
          departmentId,
          classId: cls.name,
          data: classGrids[cls.name]
        });
        await newTimetable.save();
        generatedTimetables.push(newTimetable);
      }

      if (!success) {
        return res.status(200).json({ 
          message: `Timetable generated with remaining conflicts (partial success). Only placed ${maxIndexReached}/${allocationTasks.length} subjects. Please check staff constraints or increase periods.`, 
          count: generatedTimetables.length,
          partial: true,
          placedCount: maxIndexReached,
          totalCount: allocationTasks.length
        });
      }

      res.json({ message: "Optimal Timetable generated successfully", count: generatedTimetables.length, partial: false });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Generation failed" });
    }
  });

  app.get("/api/timetable", async (req, res) => {
    try {
      const { departmentId } = req.query;
      if (!departmentId) return res.status(400).json({ error: "departmentId required" });
      const timetables = await Timetable.find({ departmentId });
      res.json(timetables);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/timetable/:id", async (req, res) => {
    try {
      const timetable = await Timetable.findByIdAndUpdate(
        req.params.id, 
        { data: req.body.data }, 
        { new: true }
      );
      res.json(timetable);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/seed", async (req, res) => {
    try {
      const { departmentId } = req.body;
      if (!departmentId) return res.status(400).json({ error: "departmentId required" });

      await Staff.deleteMany({ departmentId });
      await Subject.deleteMany({ departmentId });
      await Class.deleteMany({ departmentId });
      await Timetable.deleteMany({ departmentId });

      const sampleSubjects = [
        // ECE 3A subjects (34 hours)
        { departmentId, code: "MA3351", name: "Transforms and Partial Differential Equations", type: "Theory", hoursPerWeek: 5, semester: 3 },
        { departmentId, code: "EC3351", name: "Control Systems", type: "Theory", hoursPerWeek: 4, semester: 3 },
        { departmentId, code: "EC3352", name: "Digital Systems Design", type: "Theory", hoursPerWeek: 5, semester: 3 },
        { departmentId, code: "EC3353", name: "Electronic Devices and Circuits", type: "Theory", hoursPerWeek: 5, semester: 3 },
        { departmentId, code: "EC3354", name: "Signals and Systems", type: "Theory", hoursPerWeek: 5, semester: 3 },
        { departmentId, code: "EC3355", name: "Electromagnetics", type: "Theory", hoursPerWeek: 4, semester: 3 },
        { departmentId, code: "EC3361", name: "DSD Lab", type: "Lab", hoursPerWeek: 3, semester: 3 },
        { departmentId, code: "EC3311", name: "EDC Lab", type: "Lab", hoursPerWeek: 3, semester: 3 },
        
        // ECE 5A subjects (34 hours)
        { departmentId, code: "EC3501", name: "Wireless Communication", type: "Theory", hoursPerWeek: 4, semester: 5 },
        { departmentId, code: "EC3551", name: "Transmission Lines and RF Systems", type: "Theory", hoursPerWeek: 5, semester: 5 },
        { departmentId, code: "EC3552", name: "VLSI and Chip Design", type: "Theory", hoursPerWeek: 5, semester: 5 },
        { departmentId, code: "EC3553", name: "Digital Signal Processing", type: "Theory", hoursPerWeek: 5, semester: 5 },
        { departmentId, code: "EC3554", name: "Communication Systems", type: "Theory", hoursPerWeek: 5, semester: 5 },
        { departmentId, code: "EC3555", name: "Optical Communication Networks", type: "Theory", hoursPerWeek: 4, semester: 5 },
        { departmentId, code: "EC3561", name: "VLSI Lab", type: "Lab", hoursPerWeek: 3, semester: 5 },
        { departmentId, code: "EC3511", name: "DSP Lab", type: "Lab", hoursPerWeek: 3, semester: 5 },
      ];
      await Subject.insertMany(sampleSubjects);

      const sampleStaff = [
        { departmentId, staffId: "ECE001", name: "Dr. Sathish Kumar", subjects: ["MA3351", "EC3552", "EC3561"], maxHoursPerWeek: 20, maxClassesPerDay: 4 },
        { departmentId, staffId: "ECE002", name: "Mrs. Meena", subjects: ["EC3353", "EC3553", "EC3311"], maxHoursPerWeek: 20, maxClassesPerDay: 4 },
        { departmentId, staffId: "ECE003", name: "Mr. Rajesh", subjects: ["EC3354", "EC3554"], maxHoursPerWeek: 20, maxClassesPerDay: 4 },
        { departmentId, staffId: "ECE004", name: "Dr. Lakshmi", subjects: ["EC3352", "EC3551", "EC3361"], maxHoursPerWeek: 20, maxClassesPerDay: 4 },
        { departmentId, staffId: "ECE005", name: "Prof. Vijay", subjects: ["EC3351", "EC3501"], maxHoursPerWeek: 20, maxClassesPerDay: 4 },
        { departmentId, staffId: "ECE006", name: "Dr. Ananya", subjects: ["EC3355", "EC3555", "EC3511"], maxHoursPerWeek: 20, maxClassesPerDay: 4 },
      ];
      await Staff.insertMany(sampleStaff);

      const sampleClasses = [
        { departmentId, name: "ECE 3A", semester: 3, subjects: ["MA3351", "EC3351", "EC3352", "EC3353", "EC3354", "EC3355", "EC3361", "EC3311"] },
        { departmentId, name: "ECE 5A", semester: 5, subjects: ["EC3501", "EC3551", "EC3552", "EC3553", "EC3554", "EC3555", "EC3561", "EC3511"] },
      ];
      await Class.insertMany(sampleClasses);

      // Add default rules if they don't exist
      const existingRules = await Rules.findOne({ departmentId });
      if (!existingRules) {
        const defaultRules = new Rules({
          departmentId,
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          periodsPerDay: 7,
          semesterType: "Odd",
          maxSubjectPeriodsPerDay: 2
        });
        await defaultRules.save();
      }

      res.json({ message: "Sample data and rules seeded successfully" });
    } catch (error) {
      res.status(500).json({ error: "Seeding failed" });
    }
  });

  // Forced structural static serving to bypass local Node ESM dev bugs
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
