/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CourseResource {
  id: number;
  title: string;
  type: 'link' | 'pdf' | 'ppt' | 'note' | 'video';
  url: string;
  desc?: string;
  date: string;
}

export interface Course {
  id: number;
  name: string;
  prof?: string;
  emoji: string;
  credits: number;
  goal: number; // study hours goal
  hours: number; // studied hours
  color: string;
  resources: CourseResource[];
  expanded?: boolean;
  grade?: string; // Optional letter grade e.g. 'A', 'B+'
}

export interface Session {
  id: number;
  subj: string;
  emoji: string;
  color: string;
  dur: number; // in minutes
  time: string;
  date: string;
}

export interface ResearchPaper {
  id: number;
  title: string;
  authors?: string;
  type: 'paper' | 'link' | 'pdf' | 'doc' | 'note';
  status: 'unread' | 'reading' | 'done';
  url?: string;
  notes?: string;
  date: string;
}

export interface TodoTask {
  id: number;
  name: string;
  cat: 'personal' | 'work' | 'college' | 'other';
  term: 'shortterm' | 'longterm';
  pri: 'low' | 'med' | 'high';
  due?: string;
  done: boolean;
}

export interface WeeklyInsight {
  id: number;
  title: string;
  subj: string;
  type: 'concept' | 'mistake' | 'tip' | 'resource';
  body: string;
  date: string;
}

export interface ProjectMilestone {
  id: number;
  title: string;
  due?: string;
  done: boolean;
}

export interface ProjectTask {
  id: number;
  title: string;
  done: boolean;
}

export interface Project {
  id: number;
  name: string;
  desc?: string;
  status: 'planning' | 'active' | 'paused' | 'done';
  due?: string;
  milestones: ProjectMilestone[];
  ptasks: ProjectTask[];
  expanded?: boolean;
}

export interface Achievement {
  id: number;
  title: string;
  desc?: string;
  date?: string;
  cat: string;
}

export interface Internship {
  id: number;
  company: string;
  role?: string;
  start?: string;
  end?: string;
  desc?: string;
  status: 'completed' | 'ongoing' | 'upcoming';
}

export interface CVFile {
  id: number;
  name: string;
  url?: string;
  note?: string;
  date: string;
}

export interface CareerGoal {
  id: number;
  title: string;
  date?: string;
  status: 'active' | 'done' | 'deferred';
}

export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  type: 'exam' | 'assignment' | 'event' | 'deadline';
  note?: string;
}

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export interface SleepRecord {
  hrs: number;
  date: string;
}

export interface MoodRecord {
  emoji: string;
  label: string;
  note?: string;
  date: string;
}

export interface FinanceTransaction {
  id: number;
  desc: string;
  amt: number;
  type: 'expense' | 'income';
  cat: string;
  date: string;
}

export interface UserProfile {
  name: string;
  uni?: string;
  degree?: string;
  year?: string;
  goal: number; // daily study goal in hours
}

export interface TimetableEntry {
  id: number;
  courseName: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  time: string;
  location?: string;
}

export interface AppState {
  xp: number;
  streak: number;
  lastDay?: string;
  sessions: Session[];
  courses: Course[];
  papers: ResearchPaper[];
  todos: TodoTask[];
  learned: WeeklyInsight[];
  projects: Project[];
  achievements: Achievement[];
  internships: Internship[];
  cvFiles: CVFile[];
  careerGoals: CareerGoal[];
  events: CalendarEvent[];
  habits: Habit[];
  habitLog: Record<string, string[]>; // date -> list of habit IDs completed
  water: number;
  sleepLog: SleepRecord[];
  moodLog: MoodRecord[];
  transactions: FinanceTransaction[];
  budget: number;
  savings: number;
  profile: UserProfile;
  timetable: TimetableEntry[];
  dark: boolean;
}

export const INITIAL_STATE: AppState = {
  xp: 120,
  streak: 3,
  lastDay: new Date().toDateString(),
  sessions: [
    {
      id: 1,
      subj: "Algorithms",
      emoji: "💻",
      color: "#8b1a6b",
      dur: 25,
      time: "10:30 AM",
      date: new Date().toDateString(),
    },
    {
      id: 2,
      subj: "Data Science",
      emoji: "🔬",
      color: "#2a8a7a",
      dur: 50,
      time: "02:15 PM",
      date: new Date().toDateString(),
    }
  ],
  courses: [
    {
      id: 101,
      name: "Algorithms & Complexity",
      prof: "Dr. Alan Turing",
      emoji: "💻",
      credits: 4,
      goal: 30,
      hours: 12.5,
      color: "#8b1a6b",
      resources: [
        {
          id: 1001,
          title: "Introduction to Cormen, Leiserson",
          type: "link",
          url: "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/",
          desc: "Main textbook website and resources",
          date: "2026-06-20",
        },
        {
          id: 1002,
          title: "Dynamic Programming Lecture Slides",
          type: "pdf",
          url: "https://web.stanford.edu/class/cs97si/09-dynamic-programming.pdf",
          desc: "Comprehensive overview of DP optimization",
          date: "2026-06-22",
        },
      ],
      expanded: true,
    },
    {
      id: 102,
      name: "Computational Chemistry",
      prof: "Dr. Rosalind Franklin",
      emoji: "🧪",
      credits: 3,
      goal: 20,
      hours: 8,
      color: "#6b4f9e",
      resources: [],
      expanded: false,
    },
  ],
  papers: [
    {
      id: 201,
      title: "Attention Is All You Need",
      authors: "Vaswani et al.",
      type: "paper",
      status: "reading",
      url: "https://arxiv.org/abs/1706.03762",
      notes: "Understanding the Transformer architecture and self-attention mechanisms.",
      date: "2026-06-24",
    },
    {
      id: 202,
      title: "Deep Residual Learning for Image Recognition",
      authors: "He et al.",
      type: "pdf",
      status: "done",
      url: "https://arxiv.org/abs/1512.03385",
      notes: "ResNet introductory paper introducing skip connections.",
      date: "2026-06-23",
    }
  ],
  todos: [
    {
      id: 301,
      name: "Complete assignment 3 dynamic programming",
      cat: "college",
      term: "shortterm",
      pri: "high",
      due: new Date().toISOString().split('T')[0],
      done: false,
    },
    {
      id: 302,
      name: "Revise system design architectures",
      cat: "work",
      term: "shortterm",
      pri: "med",
      due: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      done: false,
    },
    {
      id: 303,
      name: "Prepare portfolio website resume",
      cat: "personal",
      term: "longterm",
      pri: "low",
      due: "2026-07-15",
      done: false,
    }
  ],
  learned: [
    {
      id: 401,
      title: "Difference between memoization and tabulations",
      subj: "Algorithms & Complexity",
      type: "concept",
      body: "Memoization is top-down (uses recursion and caching). Tabulation is bottom-up (uses nested loops to fill an array or matrix sequentially).",
      date: "2026-06-24",
    }
  ],
  projects: [
    {
      id: 501,
      name: "Astra AI Web Search Engine",
      desc: "An intelligent query understanding search engine utilizing embedding models.",
      status: "active",
      due: "2026-08-01",
      milestones: [
        { id: 5001, title: "Design database schemas and indexes", done: true, due: "2026-07-01" },
        { id: 5002, title: "Implement semantic vector search API", done: false, due: "2026-07-15" }
      ],
      ptasks: [
        { id: 5011, title: "Set up fastify server skeleton", done: true },
        { id: 5012, title: "Integrate vector database client", done: false }
      ],
      expanded: true,
    }
  ],
  achievements: [
    {
      id: 601,
      title: "First Place at Campus Innovation Hackathon",
      desc: "Developed a distributed carbon footprint tracker for urban smart spaces.",
      date: "2026-05-12",
      cat: "🏆 Award",
    }
  ],
  internships: [
    {
      id: 701,
      company: "Google DeepMind",
      role: "Research Intern",
      start: "2026-06",
      end: "2026-09",
      desc: "Working on state-space models and multi-modal attention efficiency optimizations.",
      status: "ongoing",
    }
  ],
  cvFiles: [
    {
      id: 801,
      name: "Academic_CV_Standard_v2.pdf",
      url: "https://drive.google.com",
      note: "Standard 2-page academic and software engineering resume.",
      date: "2026-06-15",
    }
  ],
  careerGoals: [
    {
      id: 901,
      title: "Publish first paper at NeurIPS or ICML by 2027",
      date: "2027-01-01",
      status: "active",
    }
  ],
  events: [
    {
      id: 10001,
      title: "Midterm Algorithms Exam",
      date: new Date().toISOString().split('T')[0],
      type: "exam",
      note: "Topics: Divide & conquer, Greedy approach, DP.",
    },
    {
      id: 10002,
      title: "Deep Learning Project Proposal Submission",
      date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      type: "deadline",
      note: "Needs abstract, dataset link, and baseline descriptions.",
    }
  ],
  habits: [
    { id: "h1", name: "Read Research Paper", emoji: "📖", color: "#8b1a6b" },
    { id: "h2", name: "Hydrate (8 glasses)", emoji: "🧘", color: "#2a8a7a" },
    { id: "h3", name: "30-min coding workout", emoji: "💻", color: "#6b4f9e" }
  ],
  habitLog: {},
  water: 4,
  sleepLog: [
    { hrs: 7.5, date: "2026-06-23" },
    { hrs: 8.0, date: "2026-06-22" },
  ],
  moodLog: [
    { emoji: "😄", label: "Amazing", note: "Excited about setting up the new Eternity workspace!", date: "2026-06-24" }
  ],
  transactions: [
    { id: 1101, desc: "Computational Complexity Textbook", amt: 1200, type: "expense", cat: "Books", date: new Date().toISOString() },
    { id: 1102, desc: "Scholarship Stipend", amt: 12000, type: "income", cat: "Allowance", date: new Date().toISOString() }
  ],
  budget: 15000,
  savings: 34000,
  profile: {
    name: "Eleanor Vance",
    uni: "Stanford University",
    degree: "B.S. Computer Science",
    year: "Year 3",
    goal: 5,
  },
  timetable: [
    { id: 1, courseName: "Algorithms & Complexity", day: "Monday", time: "10:00 AM", location: "Turing Hall" },
    { id: 2, courseName: "Computational Chemistry", day: "Tuesday", time: "01:30 PM", location: "Rosalind Lab 3" },
    { id: 3, courseName: "Algorithms & Complexity", day: "Wednesday", time: "10:00 AM", location: "Turing Hall" },
    { id: 4, courseName: "Computational Chemistry", day: "Thursday", time: "01:30 PM", location: "Rosalind Lab 3" },
  ],
  dark: false,
};
