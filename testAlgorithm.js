import fs from 'fs';

const rules = {
  periodsPerDay: 7,
  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  naanMudhalvanSlot: { day: "Friday", period: 6 },
};

const classes = [ { name: "CSE 3A", subjects: ["CS301", "CS302", "CS303"] } ];

const subjects = [
  { code: "CS301", name: "DBMS", type: "Theory", hoursPerWeek: 4 },
  { code: "CS302", name: "DBMS Lab", type: "Lab", hoursPerWeek: 3 }, // Lab: 3 continuous hours
  { code: "CS303", name: "Operating Systems", type: "Theory", hoursPerWeek: 4 },
];

const staff = [
  { staffId: "S1", name: "Dr Ravi", subjects: ["CS301", "CS302"] },
  { staffId: "S2", name: "Prof Kumar", subjects: ["CS303"] }
];

// Re-implemented Backtracking Solver locally for CLI output
const classGrids = {};
classes.forEach(cls => {
  classGrids[cls.name] = {};
  rules.days.forEach(day => {
    classGrids[cls.name][day] = new Array(rules.periodsPerDay).fill(null);
  });
});

const staffBusy = {};
staff.forEach(s => {
  staffBusy[s.staffId] = {};
  rules.days.forEach(day => {
    staffBusy[s.staffId][day] = new Array(rules.periodsPerDay).fill(false);
  });
});

// 1. Fill Naan Mudhalvan
classes.forEach(cls => {
  const { day, period } = rules.naanMudhalvanSlot;
  classGrids[cls.name][day][period - 1] = { subjectCode: "NM", staffName: "Special" };
});

const allocationTasks = [];
for (const cls of classes) {
  const classSubjects = subjects.filter(s => cls.subjects.includes(s.code));
  for (const sub of classSubjects) {
    const subStaff = staff.find(s => s.subjects.includes(sub.code));
    if (sub.type === "Lab") {
      let remaining = sub.hoursPerWeek;
      while (remaining >= 2) {
        allocationTasks.push({ cls, subject: sub, staff: subStaff, type: "Lab", hours: 2 });
        remaining -= 2;
      }
      if (remaining > 0) {
        allocationTasks.push({ cls, subject: sub, staff: subStaff, type: "Lab", hours: remaining });
      }
    } else {
      for (let i = 0; i < sub.hoursPerWeek; i++) {
        allocationTasks.push({ cls, subject: sub, staff: subStaff, type: "Theory", hours: 1 });
      }
    }
  }
}

// Ensure Labs are placed first
allocationTasks.sort((a, b) => b.hours - a.hours);

const isValid = (task, day, startPeriod) => {
  if (startPeriod + task.hours > rules.periodsPerDay) return false;
  
  if (startPeriod < 4 && startPeriod + task.hours > 4) return false;
  for (let p = 0; p < task.hours; p++) {
    const period = startPeriod + p;
    if (classGrids[task.cls.name][day][period] !== null) return false;
    if (staffBusy[task.staff.staffId][day][period]) return false;
  }

  if (task.type === "Theory") {
    let countInDay = 0;
    for (let p = 0; p < rules.periodsPerDay; p++) {
      if (classGrids[task.cls.name][day][p]?.subjectCode === task.subject.code) {
        countInDay++;
      }
    }
    if (countInDay + task.hours > 2) return false;
  }

  let staffHoursInDay = 0;
  for (let p = 0; p < rules.periodsPerDay; p++) {
    if (staffBusy[task.staff.staffId][day][p]) {
      staffHoursInDay++;
    }
  }
  if (staffHoursInDay + task.hours > 4) return false;

  return true;
};

const placeTask = (task, day, startPeriod) => {
  for (let p = 0; p < task.hours; p++) {
    const period = startPeriod + p;
    classGrids[task.cls.name][day][period] = { subjectCode: task.subject.code, staffName: task.staff.name };
    staffBusy[task.staff.staffId][day][period] = true;
  }
};

const removeTask = (task, day, startPeriod) => {
  for (let p = 0; p < task.hours; p++) {
    const period = startPeriod + p;
    classGrids[task.cls.name][day][period] = null;
    staffBusy[task.staff.staffId][day][period] = false;
  }
};

let solveCount = 0;
const solve = (index) => {
  solveCount++;
  if (index === allocationTasks.length) return true;
  const task = allocationTasks[index];
  for (const day of rules.days) {
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

console.log("Starting algorithm generation...");
const success = solve(0);

if (success) {
  console.log("SUCCESS! Timetable perfectly generated with constraints:");
  console.log("Total Backtracking steps:", solveCount);
  fs.writeFileSync('testOutput.json', JSON.stringify(classGrids["CSE 3A"], null, 2));
} else {
  console.log("FAILED to find valid timetable.");
}
