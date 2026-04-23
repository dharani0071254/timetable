var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
var __filename = "";
var __dirname = "";
try {
    __filename = import.meta.url.startsWith('file://') ? fileURLToPath(import.meta.url) : import.meta.url;
    __dirname = path.dirname(__filename);
}
catch (e) {
    __filename = import.meta.url;
    __dirname = path.dirname(__filename);
}
dotenv.config();
// --- Models ---
var departmentSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: String,
    createdAt: { type: Date, default: Date.now },
});
var staffSchema = new mongoose.Schema({
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    staffId: { type: String, required: true },
    name: { type: String, required: true },
    subjects: [String], // Subject codes
    maxHoursPerWeek: { type: Number, default: 20 },
    maxClassesPerDay: { type: Number, default: 4 },
});
staffSchema.index({ staffId: 1, departmentId: 1 }, { unique: true });
var subjectSchema = new mongoose.Schema({
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    code: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["Theory", "Lab"], required: true },
    hoursPerWeek: { type: Number, required: true },
    semester: { type: Number, required: true },
});
subjectSchema.index({ code: 1, departmentId: 1 }, { unique: true });
var classSchema = new mongoose.Schema({
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
var rulesSchema = new mongoose.Schema({
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true, unique: true },
    periodsPerDay: { type: Number, default: 7 },
    days: [String], // ["Monday", "Tuesday", ...]
    semesterType: { type: String, enum: ["Odd", "Even"], default: "Odd" },
    maxSubjectPeriodsPerDay: { type: Number, default: 2 },
});
var timetableSchema = new mongoose.Schema({
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    classId: String,
    data: mongoose.Schema.Types.Mixed, // { "Monday": [ { subjectCode, staffId }, ... ], ... }
    generatedAt: { type: Date, default: Date.now },
});
var Department = mongoose.model("Department", departmentSchema);
var Staff = mongoose.model("Staff", staffSchema);
var Subject = mongoose.model("Subject", subjectSchema);
var Class = mongoose.model("Class", classSchema);
var Rules = mongoose.model("Rules", rulesSchema);
var Timetable = mongoose.model("Timetable", timetableSchema);
// --- Server Setup ---
function startServer() {
    return __awaiter(this, void 0, void 0, function () {
        var app, PORT, MONGODB_URI;
        var _this = this;
        return __generator(this, function (_a) {
            app = express();
            PORT = 3000;
            app.use(cors());
            app.use(express.json());
            MONGODB_URI = process.env.MONGODB_URI;
            if (MONGODB_URI) {
                mongoose.connect(MONGODB_URI, {
                    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
                })
                    .then(function () { return console.log("Successfully connected to MongoDB Atlas"); })
                    .catch(function (err) {
                    console.error("MongoDB connection error:", err.message);
                    console.error("Troubleshooting: Check your password, IP whitelist, and Secret key name.");
                });
            }
            else {
                console.warn("WARNING: MONGODB_URI is not defined. Database features will be unavailable.");
                console.warn("Please add MONGODB_URI to your Secrets panel in AI Studio.");
            }
            // --- API Routes ---
            // Departments
            app.get("/api/departments", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var departments, err_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, Department.find()];
                        case 1:
                            departments = _a.sent();
                            res.json(departments);
                            return [3 /*break*/, 3];
                        case 2:
                            err_1 = _a.sent();
                            console.error('GET /api/departments error:', err_1.message);
                            res.status(500).json({ error: "Failed to fetch departments: " + err_1.message });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.post("/api/departments", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var dept, err_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            dept = new Department(req.body);
                            return [4 /*yield*/, dept.save()];
                        case 1:
                            _a.sent();
                            res.json(dept);
                            return [3 /*break*/, 3];
                        case 2:
                            err_2 = _a.sent();
                            if (err_2.code === 11000) {
                                return [2 /*return*/, res.status(400).json({ error: "A department with this name already exists." })];
                            }
                            res.status(400).json({ error: err_2.message });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.delete("/api/departments/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var deptId, err_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            deptId = req.params.id;
                            return [4 /*yield*/, Promise.all([
                                    Department.findByIdAndDelete(deptId),
                                    Staff.deleteMany({ departmentId: deptId }),
                                    Subject.deleteMany({ departmentId: deptId }),
                                    Class.deleteMany({ departmentId: deptId }),
                                    Rules.deleteMany({ departmentId: deptId }),
                                    Timetable.deleteMany({ departmentId: deptId }),
                                ])];
                        case 1:
                            _a.sent();
                            res.json({ message: "Department and all associated data deleted" });
                            return [3 /*break*/, 3];
                        case 2:
                            err_3 = _a.sent();
                            res.status(500).json({ error: err_3.message });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Staff
            app.get("/api/staff", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var departmentId, staff, err_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            departmentId = req.query.departmentId;
                            if (!departmentId)
                                return [2 /*return*/, res.status(400).json({ error: "departmentId required" })];
                            return [4 /*yield*/, Staff.find({ departmentId: departmentId })];
                        case 1:
                            staff = _a.sent();
                            res.json(staff);
                            return [3 /*break*/, 3];
                        case 2:
                            err_4 = _a.sent();
                            res.status(500).json({ error: err_4.message });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.post("/api/staff", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var staff, err_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            staff = new Staff(req.body);
                            return [4 /*yield*/, staff.save()];
                        case 1:
                            _a.sent();
                            res.json(staff);
                            return [3 /*break*/, 3];
                        case 2:
                            err_5 = _a.sent();
                            res.status(400).json({ error: err_5.message });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.put("/api/staff/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var staff, err_6;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, Staff.findByIdAndUpdate(req.params.id, req.body, { new: true })];
                        case 1:
                            staff = _a.sent();
                            res.json(staff);
                            return [3 /*break*/, 3];
                        case 2:
                            err_6 = _a.sent();
                            res.status(400).json({ error: err_6.message });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.delete("/api/staff/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var err_7;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, Staff.findByIdAndDelete(req.params.id)];
                        case 1:
                            _a.sent();
                            res.json({ message: "Deleted" });
                            return [3 /*break*/, 3];
                        case 2:
                            err_7 = _a.sent();
                            res.status(500).json({ error: err_7.message });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Subjects
            app.get("/api/subjects", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var departmentId, subjects, err_8;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            departmentId = req.query.departmentId;
                            if (!departmentId)
                                return [2 /*return*/, res.status(400).json({ error: "departmentId required" })];
                            return [4 /*yield*/, Subject.find({ departmentId: departmentId })];
                        case 1:
                            subjects = _a.sent();
                            res.json(subjects);
                            return [3 /*break*/, 3];
                        case 2:
                            err_8 = _a.sent();
                            res.status(500).json({ error: err_8.message });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.post("/api/subjects", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var subject, err_9;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            subject = new Subject(req.body);
                            return [4 /*yield*/, subject.save()];
                        case 1:
                            _a.sent();
                            res.json(subject);
                            return [3 /*break*/, 3];
                        case 2:
                            err_9 = _a.sent();
                            res.status(400).json({ error: err_9.message });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.put("/api/subjects/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var subject, err_10;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, Subject.findByIdAndUpdate(req.params.id, req.body, { new: true })];
                        case 1:
                            subject = _a.sent();
                            res.json(subject);
                            return [3 /*break*/, 3];
                        case 2:
                            err_10 = _a.sent();
                            res.status(400).json({ error: err_10.message });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.delete("/api/subjects/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var err_11;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, Subject.findByIdAndDelete(req.params.id)];
                        case 1:
                            _a.sent();
                            res.json({ message: "Deleted" });
                            return [3 /*break*/, 3];
                        case 2:
                            err_11 = _a.sent();
                            res.status(500).json({ error: err_11.message });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Classes
            app.get("/api/classes", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var departmentId, classes, err_12;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            departmentId = req.query.departmentId;
                            if (!departmentId)
                                return [2 /*return*/, res.status(400).json({ error: "departmentId required" })];
                            return [4 /*yield*/, Class.find({ departmentId: departmentId })];
                        case 1:
                            classes = _a.sent();
                            res.json(classes);
                            return [3 /*break*/, 3];
                        case 2:
                            err_12 = _a.sent();
                            res.status(500).json({ error: err_12.message });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.post("/api/classes", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var cls, err_13;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            cls = new Class(req.body);
                            return [4 /*yield*/, cls.save()];
                        case 1:
                            _a.sent();
                            res.json(cls);
                            return [3 /*break*/, 3];
                        case 2:
                            err_13 = _a.sent();
                            res.status(400).json({ error: err_13.message });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.put("/api/classes/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var cls, err_14;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, Class.findByIdAndUpdate(req.params.id, req.body, { new: true })];
                        case 1:
                            cls = _a.sent();
                            res.json(cls);
                            return [3 /*break*/, 3];
                        case 2:
                            err_14 = _a.sent();
                            res.status(400).json({ error: err_14.message });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.delete("/api/classes/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var err_15;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, Class.findByIdAndDelete(req.params.id)];
                        case 1:
                            _a.sent();
                            res.json({ message: "Deleted" });
                            return [3 /*break*/, 3];
                        case 2:
                            err_15 = _a.sent();
                            res.status(500).json({ error: err_15.message });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Rules
            app.get("/api/rules", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var departmentId, rules, err_16;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 4, , 5]);
                            departmentId = req.query.departmentId;
                            if (!departmentId)
                                return [2 /*return*/, res.status(400).json({ error: "departmentId required" })];
                            return [4 /*yield*/, Rules.findOne({ departmentId: departmentId })];
                        case 1:
                            rules = _a.sent();
                            if (!!rules) return [3 /*break*/, 3];
                            rules = new Rules({
                                departmentId: departmentId,
                                periodsPerDay: 7,
                                days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                                semesterType: "Odd",
                                maxSubjectPeriodsPerDay: 2
                            });
                            return [4 /*yield*/, rules.save()];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            res.json(rules);
                            return [3 /*break*/, 5];
                        case 4:
                            err_16 = _a.sent();
                            res.status(500).json({ error: err_16.message });
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            app.post("/api/rules", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var departmentId, rules, err_17;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 6, , 7]);
                            departmentId = req.body.departmentId;
                            if (!departmentId)
                                return [2 /*return*/, res.status(400).json({ error: "departmentId required" })];
                            return [4 /*yield*/, Rules.findOne({ departmentId: departmentId })];
                        case 1:
                            rules = _a.sent();
                            if (!rules) return [3 /*break*/, 3];
                            Object.assign(rules, req.body);
                            return [4 /*yield*/, rules.save()];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 5];
                        case 3:
                            rules = new Rules(req.body);
                            return [4 /*yield*/, rules.save()];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5:
                            res.json(rules);
                            return [3 /*break*/, 7];
                        case 6:
                            err_17 = _a.sent();
                            res.status(500).json({ error: err_17.message });
                            return [3 /*break*/, 7];
                        case 7: return [2 /*return*/];
                    }
                });
            }); });
            // Timetable Generation Logic
            app.post("/api/generate-timetable", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var departmentId, staff_1, subjects_1, classes, rules_1, classGrids_1, staffBusy_1, allocationTasks_1, _loop_1, _i, classes_1, cls, isValid_1, placeTask_1, removeTask_1, maxIndexReached_1, solve_1, success, generatedTimetables, _a, classes_2, cls, newTimetable, error_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 10, , 11]);
                            departmentId = req.body.departmentId;
                            if (!departmentId)
                                return [2 /*return*/, res.status(400).json({ error: "departmentId required" })];
                            return [4 /*yield*/, Staff.find({ departmentId: departmentId })];
                        case 1:
                            staff_1 = _b.sent();
                            return [4 /*yield*/, Subject.find({ departmentId: departmentId })];
                        case 2:
                            subjects_1 = _b.sent();
                            return [4 /*yield*/, Class.find({ departmentId: departmentId })];
                        case 3:
                            classes = _b.sent();
                            return [4 /*yield*/, Rules.findOne({ departmentId: departmentId })];
                        case 4:
                            rules_1 = _b.sent();
                            if (!rules_1)
                                return [2 /*return*/, res.status(400).json({ error: "Rules not configured" })];
                            // Clear old timetables for this department
                            return [4 /*yield*/, Timetable.deleteMany({ departmentId: departmentId })];
                        case 5:
                            // Clear old timetables for this department
                            _b.sent();
                            classGrids_1 = {};
                            classes.forEach(function (cls) {
                                classGrids_1[cls.name] = {};
                                rules_1.days.forEach(function (day) {
                                    classGrids_1[cls.name][day] = new Array(rules_1.periodsPerDay).fill(null);
                                });
                            });
                            staffBusy_1 = {};
                            staff_1.forEach(function (s) {
                                staffBusy_1[s.staffId] = {};
                                rules_1.days.forEach(function (day) {
                                    staffBusy_1[s.staffId][day] = new Array(rules_1.periodsPerDay).fill(false);
                                });
                            });
                            // 1. Pre-fill Fixed Timings for all classes
                            classes.forEach(function (cls) {
                                if (cls.fixedTimings && Array.isArray(cls.fixedTimings)) {
                                    cls.fixedTimings.forEach(function (ft) {
                                        var subStaff = staff_1.find(function (s) { return s.subjects.includes(ft.subjectCode); });
                                        var sub = subjects_1.find(function (s) { return s.code === ft.subjectCode; });
                                        if (subStaff && sub && classGrids_1[cls.name][ft.day]) {
                                            for (var p = 0; p < ft.hours; p++) {
                                                var periodIndex = ft.startPeriod - 1 + p; // Fixed API uses 1-indexed startPeriod
                                                if (periodIndex >= 0 && periodIndex < rules_1.periodsPerDay) {
                                                    classGrids_1[cls.name][ft.day][periodIndex] = {
                                                        subjectCode: sub.code,
                                                        subjectName: sub.name,
                                                        staffName: subStaff.name,
                                                        staffId: subStaff.staffId
                                                    };
                                                    staffBusy_1[subStaff.staffId][ft.day][periodIndex] = true;
                                                }
                                            }
                                        }
                                    });
                                }
                            });
                            allocationTasks_1 = [];
                            _loop_1 = function (cls) {
                                var classSubjects = subjects_1.filter(function (s) { return cls.subjects.includes(s.code); });
                                var _loop_2 = function (sub) {
                                    var subStaff = staff_1.find(function (s) { return s.subjects.includes(sub.code); });
                                    if (!subStaff)
                                        return "continue";
                                    var hoursNeeded = sub.hoursPerWeek;
                                    if (cls.fixedTimings && Array.isArray(cls.fixedTimings)) {
                                        var fixedForSub = cls.fixedTimings.filter(function (ft) { return ft.subjectCode === sub.code; });
                                        fixedForSub.forEach(function (ft) {
                                            hoursNeeded -= ft.hours;
                                        });
                                    }
                                    if (hoursNeeded <= 0)
                                        return "continue";
                                    if (sub.type === "Lab") {
                                        var remaining = hoursNeeded;
                                        while (remaining >= 2) {
                                            allocationTasks_1.push({
                                                cls: cls,
                                                subject: sub, staff: subStaff, type: "Lab", hours: 2
                                            });
                                            remaining -= 2;
                                        }
                                        if (remaining > 0) {
                                            allocationTasks_1.push({
                                                cls: cls,
                                                subject: sub, staff: subStaff, type: "Lab", hours: remaining
                                            });
                                        }
                                    }
                                    else {
                                        for (var i = 0; i < hoursNeeded; i++) {
                                            allocationTasks_1.push({
                                                cls: cls,
                                                subject: sub, staff: subStaff, type: "Theory", hours: 1
                                            });
                                        }
                                    }
                                };
                                for (var _c = 0, classSubjects_1 = classSubjects; _c < classSubjects_1.length; _c++) {
                                    var sub = classSubjects_1[_c];
                                    _loop_2(sub);
                                }
                            };
                            for (_i = 0, classes_1 = classes; _i < classes_1.length; _i++) {
                                cls = classes_1[_i];
                                _loop_1(cls);
                            }
                            allocationTasks_1.sort(function (a, b) {
                                if (a.type === "Lab" && b.type !== "Lab")
                                    return -1;
                                if (a.type !== "Lab" && b.type === "Lab")
                                    return 1;
                                return b.hours - a.hours;
                            });
                            isValid_1 = function (task, day, startPeriod) {
                                var _a;
                                if (startPeriod + task.hours > rules_1.periodsPerDay)
                                    return false;
                                // Prevent block from crossing the lunch break (between P4 and P5, indices 3 and 4)
                                if (startPeriod < 4 && startPeriod + task.hours > 4)
                                    return false;
                                // Prevent multiple labs in the same half-day (Morning: P1-P4, Afternoon: P5-P7)
                                if (task.type === "Lab") {
                                    var isMorning = startPeriod < 4;
                                    var _loop_3 = function (p) {
                                        if (classGrids_1[task.cls.name][day][p] !== null) {
                                            var existingSubCode_1 = classGrids_1[task.cls.name][day][p].subjectCode;
                                            var existingSub = subjects_1.find(function (s) { return s.code === existingSubCode_1; });
                                            if (existingSub && existingSub.type === "Lab") {
                                                var existingIsMorning = p < 4;
                                                if (isMorning === existingIsMorning) {
                                                    return { value: false };
                                                }
                                            }
                                        }
                                    };
                                    for (var p = 0; p < rules_1.periodsPerDay; p++) {
                                        var state_1 = _loop_3(p);
                                        if (typeof state_1 === "object")
                                            return state_1.value;
                                    }
                                }
                                for (var p = 0; p < task.hours; p++) {
                                    var period = startPeriod + p;
                                    if (classGrids_1[task.cls.name][day][period] !== null)
                                        return false;
                                    if (task.subjectCode !== "NM" && staffBusy_1[task.staff.staffId][day][period])
                                        return false;
                                }
                                if (task.type === "Theory") {
                                    var countInDay = 0;
                                    for (var p = 0; p < rules_1.periodsPerDay; p++) {
                                        if (((_a = classGrids_1[task.cls.name][day][p]) === null || _a === void 0 ? void 0 : _a.subjectCode) === task.subject.code) {
                                            countInDay++;
                                        }
                                    }
                                    var allowMax = rules_1.maxSubjectPeriodsPerDay || 2;
                                    if (countInDay + task.hours > allowMax)
                                        return false;
                                }
                                var staffHoursInDay = 0;
                                for (var p = 0; p < rules_1.periodsPerDay; p++) {
                                    if (staffBusy_1[task.staff.staffId][day][p]) {
                                        staffHoursInDay++;
                                    }
                                }
                                var maxStaffClasses = task.staff.maxClassesPerDay || 4;
                                if (staffHoursInDay + task.hours > maxStaffClasses)
                                    return false;
                                return true;
                            };
                            placeTask_1 = function (task, day, startPeriod) {
                                for (var p = 0; p < task.hours; p++) {
                                    var period = startPeriod + p;
                                    classGrids_1[task.cls.name][day][period] = {
                                        subjectCode: task.subject.code,
                                        subjectName: task.subject.name,
                                        staffName: task.staff.name,
                                        staffId: task.staff.staffId
                                    };
                                    staffBusy_1[task.staff.staffId][day][period] = true;
                                }
                            };
                            removeTask_1 = function (task, day, startPeriod) {
                                for (var p = 0; p < task.hours; p++) {
                                    var period = startPeriod + p;
                                    classGrids_1[task.cls.name][day][period] = null;
                                    staffBusy_1[task.staff.staffId][day][period] = false;
                                }
                            };
                            maxIndexReached_1 = 0;
                            solve_1 = function (index) {
                                if (index > maxIndexReached_1) {
                                    maxIndexReached_1 = index;
                                }
                                if (index === allocationTasks_1.length)
                                    return true;
                                var task = allocationTasks_1[index];
                                var shuffledDays = __spreadArray([], rules_1.days, true).sort(function () { return Math.random() - 0.5; });
                                for (var _i = 0, shuffledDays_1 = shuffledDays; _i < shuffledDays_1.length; _i++) {
                                    var day = shuffledDays_1[_i];
                                    for (var period = 0; period <= rules_1.periodsPerDay - task.hours; period++) {
                                        if (isValid_1(task, day, period)) {
                                            placeTask_1(task, day, period);
                                            if (solve_1(index + 1))
                                                return true;
                                            removeTask_1(task, day, period);
                                        }
                                    }
                                }
                                return false;
                            };
                            success = solve_1(0);
                            generatedTimetables = [];
                            _a = 0, classes_2 = classes;
                            _b.label = 6;
                        case 6:
                            if (!(_a < classes_2.length)) return [3 /*break*/, 9];
                            cls = classes_2[_a];
                            newTimetable = new Timetable({
                                departmentId: departmentId,
                                classId: cls.name,
                                data: classGrids_1[cls.name]
                            });
                            return [4 /*yield*/, newTimetable.save()];
                        case 7:
                            _b.sent();
                            generatedTimetables.push(newTimetable);
                            _b.label = 8;
                        case 8:
                            _a++;
                            return [3 /*break*/, 6];
                        case 9:
                            if (!success) {
                                return [2 /*return*/, res.status(200).json({
                                        message: "Timetable generated with remaining conflicts (partial success). Only placed ".concat(maxIndexReached_1, "/").concat(allocationTasks_1.length, " subjects. Please check staff constraints or increase periods."),
                                        count: generatedTimetables.length,
                                        partial: true,
                                        placedCount: maxIndexReached_1,
                                        totalCount: allocationTasks_1.length
                                    })];
                            }
                            res.json({ message: "Optimal Timetable generated successfully", count: generatedTimetables.length, partial: false });
                            return [3 /*break*/, 11];
                        case 10:
                            error_1 = _b.sent();
                            console.error(error_1);
                            res.status(500).json({ error: "Generation failed" });
                            return [3 /*break*/, 11];
                        case 11: return [2 /*return*/];
                    }
                });
            }); });
            app.get("/api/timetable", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var departmentId, timetables, err_18;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            departmentId = req.query.departmentId;
                            if (!departmentId)
                                return [2 /*return*/, res.status(400).json({ error: "departmentId required" })];
                            return [4 /*yield*/, Timetable.find({ departmentId: departmentId })];
                        case 1:
                            timetables = _a.sent();
                            res.json(timetables);
                            return [3 /*break*/, 3];
                        case 2:
                            err_18 = _a.sent();
                            res.status(500).json({ error: err_18.message });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.put("/api/timetable/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var timetable, err_19;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, Timetable.findByIdAndUpdate(req.params.id, { data: req.body.data }, { new: true })];
                        case 1:
                            timetable = _a.sent();
                            res.json(timetable);
                            return [3 /*break*/, 3];
                        case 2:
                            err_19 = _a.sent();
                            res.status(400).json({ error: err_19.message });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.post("/api/seed", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var departmentId, sampleSubjects, sampleStaff, sampleClasses, existingRules, defaultRules, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 11, , 12]);
                            departmentId = req.body.departmentId;
                            if (!departmentId)
                                return [2 /*return*/, res.status(400).json({ error: "departmentId required" })];
                            return [4 /*yield*/, Staff.deleteMany({ departmentId: departmentId })];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, Subject.deleteMany({ departmentId: departmentId })];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, Class.deleteMany({ departmentId: departmentId })];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, Timetable.deleteMany({ departmentId: departmentId })];
                        case 4:
                            _a.sent();
                            sampleSubjects = [
                                // ECE 3A subjects (34 hours)
                                { departmentId: departmentId, code: "MA3351", name: "Transforms and Partial Differential Equations", type: "Theory", hoursPerWeek: 5, semester: 3 },
                                { departmentId: departmentId, code: "EC3351", name: "Control Systems", type: "Theory", hoursPerWeek: 4, semester: 3 },
                                { departmentId: departmentId, code: "EC3352", name: "Digital Systems Design", type: "Theory", hoursPerWeek: 5, semester: 3 },
                                { departmentId: departmentId, code: "EC3353", name: "Electronic Devices and Circuits", type: "Theory", hoursPerWeek: 5, semester: 3 },
                                { departmentId: departmentId, code: "EC3354", name: "Signals and Systems", type: "Theory", hoursPerWeek: 5, semester: 3 },
                                { departmentId: departmentId, code: "EC3355", name: "Electromagnetics", type: "Theory", hoursPerWeek: 4, semester: 3 },
                                { departmentId: departmentId, code: "EC3361", name: "DSD Lab", type: "Lab", hoursPerWeek: 3, semester: 3 },
                                { departmentId: departmentId, code: "EC3311", name: "EDC Lab", type: "Lab", hoursPerWeek: 3, semester: 3 },
                                // ECE 5A subjects (34 hours)
                                { departmentId: departmentId, code: "EC3501", name: "Wireless Communication", type: "Theory", hoursPerWeek: 4, semester: 5 },
                                { departmentId: departmentId, code: "EC3551", name: "Transmission Lines and RF Systems", type: "Theory", hoursPerWeek: 5, semester: 5 },
                                { departmentId: departmentId, code: "EC3552", name: "VLSI and Chip Design", type: "Theory", hoursPerWeek: 5, semester: 5 },
                                { departmentId: departmentId, code: "EC3553", name: "Digital Signal Processing", type: "Theory", hoursPerWeek: 5, semester: 5 },
                                { departmentId: departmentId, code: "EC3554", name: "Communication Systems", type: "Theory", hoursPerWeek: 5, semester: 5 },
                                { departmentId: departmentId, code: "EC3555", name: "Optical Communication Networks", type: "Theory", hoursPerWeek: 4, semester: 5 },
                                { departmentId: departmentId, code: "EC3561", name: "VLSI Lab", type: "Lab", hoursPerWeek: 3, semester: 5 },
                                { departmentId: departmentId, code: "EC3511", name: "DSP Lab", type: "Lab", hoursPerWeek: 3, semester: 5 },
                            ];
                            return [4 /*yield*/, Subject.insertMany(sampleSubjects)];
                        case 5:
                            _a.sent();
                            sampleStaff = [
                                { departmentId: departmentId, staffId: "ECE001", name: "Dr. Sathish Kumar", subjects: ["MA3351", "EC3552", "EC3561"], maxHoursPerWeek: 20, maxClassesPerDay: 4 },
                                { departmentId: departmentId, staffId: "ECE002", name: "Mrs. Meena", subjects: ["EC3353", "EC3553", "EC3311"], maxHoursPerWeek: 20, maxClassesPerDay: 4 },
                                { departmentId: departmentId, staffId: "ECE003", name: "Mr. Rajesh", subjects: ["EC3354", "EC3554"], maxHoursPerWeek: 20, maxClassesPerDay: 4 },
                                { departmentId: departmentId, staffId: "ECE004", name: "Dr. Lakshmi", subjects: ["EC3352", "EC3551", "EC3361"], maxHoursPerWeek: 20, maxClassesPerDay: 4 },
                                { departmentId: departmentId, staffId: "ECE005", name: "Prof. Vijay", subjects: ["EC3351", "EC3501"], maxHoursPerWeek: 20, maxClassesPerDay: 4 },
                                { departmentId: departmentId, staffId: "ECE006", name: "Dr. Ananya", subjects: ["EC3355", "EC3555", "EC3511"], maxHoursPerWeek: 20, maxClassesPerDay: 4 },
                            ];
                            return [4 /*yield*/, Staff.insertMany(sampleStaff)];
                        case 6:
                            _a.sent();
                            sampleClasses = [
                                { departmentId: departmentId, name: "ECE 3A", semester: 3, subjects: ["MA3351", "EC3351", "EC3352", "EC3353", "EC3354", "EC3355", "EC3361", "EC3311"] },
                                { departmentId: departmentId, name: "ECE 5A", semester: 5, subjects: ["EC3501", "EC3551", "EC3552", "EC3553", "EC3554", "EC3555", "EC3561", "EC3511"] },
                            ];
                            return [4 /*yield*/, Class.insertMany(sampleClasses)];
                        case 7:
                            _a.sent();
                            return [4 /*yield*/, Rules.findOne({ departmentId: departmentId })];
                        case 8:
                            existingRules = _a.sent();
                            if (!!existingRules) return [3 /*break*/, 10];
                            defaultRules = new Rules({
                                departmentId: departmentId,
                                days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                                periodsPerDay: 7,
                                semesterType: "Odd",
                                maxSubjectPeriodsPerDay: 2
                            });
                            return [4 /*yield*/, defaultRules.save()];
                        case 9:
                            _a.sent();
                            _a.label = 10;
                        case 10:
                            res.json({ message: "Sample data and rules seeded successfully" });
                            return [3 /*break*/, 12];
                        case 11:
                            error_2 = _a.sent();
                            res.status(500).json({ error: "Seeding failed" });
                            return [3 /*break*/, 12];
                        case 12: return [2 /*return*/];
                    }
                });
            }); });
            // Forced structural static serving to bypass local Node ESM dev bugs
            app.use(express.static(path.join(__dirname, "dist")));
            app.get("*", function (req, res) {
                res.sendFile(path.join(__dirname, "dist", "index.html"));
            });
            app.listen(PORT, "0.0.0.0", function () {
                console.log("Server running on http://localhost:".concat(PORT));
            });
            return [2 /*return*/];
        });
    });
}
startServer();
