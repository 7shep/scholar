import { Apple } from "lucide-react";

export type TaskItem = {
  title: string;
  course: string;
  due: string;
  level: "Easy" | "Medium" | "Hard";
  completed?: boolean;
};

export const upcomingTasks: TaskItem[] = [
  {
    title: "Read Chapter 4-5",
    course: "Biology 101",
    due: "Tomorrow, 11:59 PM",
    level: "Easy",
    completed: true,
  },
  {
    title: "Problem Set 3",
    course: "Calculus II",
    due: "Friday, 5:00 PM",
    level: "Hard",
  },
  {
    title: "Midterm Essay Draft",
    course: "World History",
    due: "Mon, 9:00 AM",
    level: "Medium",
  },
  {
    title: "Lab Report",
    course: "Biology 101",
    due: "Wed, 11:59 PM",
    level: "Hard",
  },
];

export const gradeStandings = [
  { name: "Biology 101", grade: "94%", barClass: "grade-track__fill--green", width: "94%" },
  { name: "Calculus II", grade: "88%", barClass: "grade-track__fill--lime", width: "88%" },
  { name: "World History", grade: "91%", barClass: "grade-track__fill--blue", width: "91%" },
];

export const featureItems = [
  {
    icon: "refresh",
    title: "Auto-Sync Assignments",
    description:
      "Connect your school portal and watch your syllabi and due dates magically appear. No manual entry required.",
    wide: true,
  },
  {
    icon: "tag",
    title: "Difficulty Tagging",
    description: "Tag assignments by difficulty so you can plan your energy, not just your time.",
  },
  {
    icon: "bar",
    title: "Live Grade Standings",
    description: "Always know exactly where you stand in every class. No more end-of-semester surprises.",
  },
  {
    icon: "calc",
    title: "Grade Calculator",
    description: "What do I need on the final to get an A? Answered instantly with our built-in scenario calculator.",
  },
  {
    icon: "calendar",
    title: "Two-Way Calendar Sync",
    description:
      "Seamlessly syncs with Google Calendar and Apple Calendar. Your school life and personal life, finally in harmony.",
  },
] as const;

export function difficultyClass(level: TaskItem["level"]) {
  if (level === "Easy") return "pill pill--easy";
  if (level === "Medium") return "pill pill--medium";
  return "pill pill--hard";
}

export function Brand({ className = "brand" }: { className?: string }) {
  return (
    <span className={className}>
      <img className="brand__logo" src="/scholar-logo.svg" alt="Scholar logo" />
      <span>Scholar</span>
    </span>
  );
}

export function DownloadButton({ platform }: { platform: "macOS" | "Windows" }) {
  return (
    <a className="download-btn" href="#" aria-label={`Download for ${platform}`}>
      <span className="download-btn__icon" aria-hidden="true">
        {platform === "macOS" ? <Apple size={18} /> : <span className="windows-glyph" />}
      </span>
      <span>
        <small>Download for</small>
        <strong>{platform}</strong>
      </span>
    </a>
  );
}
