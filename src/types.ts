export interface Subject {
  id: string;
  name: string;
  coeff: number;
  color: string;
  icon: string;
  category: string;
}

export interface Evaluation {
  id: string;
  subjectId: string;
  grade: number;
  type: string; // 'DS', 'CC', 'IE', 'Examen Blanc'
  coeff: number;
  period: string;
  date: string;
  comment?: string;
}

export interface Homework {
  id: string;
  title: string;
  subjectId: string;
  dueDate: string;
  dueTime: string;
  priority: 'low' | 'medium' | 'high';
  duration: string; // '15 min', '30 min', '1h00', '2h+'
  description?: string;
  completed: boolean;
  groupMembers?: string[];
  progress?: number; // 0 to 100
}

export interface Transaction {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  category: string;
  date: string;
  paymentMethod: string;
  isRecurring: boolean;
  description?: string;
}

export interface Profile {
  fullName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  pinCode?: string;
  schoolName?: string;
  avatarUrl: string;
  gradeLevel: string; // 'college' | 'lycee' | 'superieur'
  className: string; // e.g. "Terminale S2"
  year: string;
  targetAverage: number;
}
