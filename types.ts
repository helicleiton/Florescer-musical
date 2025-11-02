export interface Student {
  id: string;
  name: string;
  age: number;
  workshopName: string | null;
  registrationDate: string; // ISO string
}

export interface Workshop {
  id: string;
  name: string;
}

export interface LessonPlan {
  classId: string;
  content: string;
}

// FIX: Added missing MusicClass interface.
export interface MusicClass {
  id: string;
  topic: string;
  teacher: string;
  date: string; // ISO string
  studentIds: string[];
}

export interface StudentNote {
  id: string;
  studentId: string;
  content: string;
  date: string; // ISO string
}

export type AttendanceStatus = 'present' | 'absent' | 'justified';

export interface Attendance {
  classId: string;
  records: {
    [studentId: string]: AttendanceStatus;
  };
}

export interface WorkshopLessonPlan {
  id: string; // composite key: workshopId-lessonNumber
  workshopId: string;
  lessonNumber: number;
  content: string;
}

export interface WeeklyClass {
  day: number;
  time: string;
  name: string;
  teacher: string;
}

export interface FullClassInfo extends WeeklyClass {
    id: string;
    date: Date;
    aulaNumber: number;
}

declare global {
  interface Window {
    jspdf: any;
  }
}
