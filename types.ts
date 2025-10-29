export interface Student {
  id: string;
  name: string;
  age: number;
  workshopId: string | null;
  registrationDate: string; // ISO string
}

export interface MusicClass {
  id: string;
  topic: string;
  teacher: string;
  date: string; // ISO string
  studentIds: string[];
}

export interface Workshop {
  id: string;
  name: string;
}

export interface LessonPlan {
  classId: string;
  content: string;
}

export interface StudentNote {
  id: string;
  studentId: string;
  content: string;
  date: string; // ISO string
}
