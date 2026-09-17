import { Subject, Evaluation, Homework, Transaction, Profile } from './types';

export const initialProfile: Profile = {
  fullName: "Amadou Diallo",
  firstName: "Amadou",
  lastName: "Diallo",
  email: "amadou.diallo@email.com",
  phone: "+221 77 000 00 00",
  pinCode: "123456",
  schoolName: "Lycée Lamine Guèye",
  avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
  gradeLevel: "lycee",
  className: "Terminale S2",
  year: "2024",
  targetAverage: 14.0
};

export const initialSubjects: Subject[] = [
  { id: 'maths', name: 'Mathématiques', coeff: 6, color: '#1d4ed8', icon: 'functions', category: 'Matière principale' },
  { id: 'physique', name: 'Physique-Chimie', coeff: 6, color: '#3b82f6', icon: 'science', category: 'Laboratoire & Écrit' },
  { id: 'svt', name: 'SVT', coeff: 5, color: '#10b981', icon: 'biotech', category: 'Sciences de la Vie et Terre' },
  { id: 'philo', name: 'Philosophie', coeff: 3, color: '#f59e0b', icon: 'psychology', category: 'Dissertation & Texte' },
  { id: 'francais', name: 'Français', coeff: 2, color: '#6366f1', icon: 'history_edu', category: 'Épreuves anticipées' },
  { id: 'anglais', name: 'Anglais', coeff: 2, color: '#06b6d4', icon: 'translate', category: 'LV1' },
  { id: 'histoire-geo', name: 'Histoire-Géo', coeff: 2, color: '#8b5cf6', icon: 'public', category: 'Tronc commun' }
];

export const initialEvaluations: Evaluation[] = [
  { id: 'eval-1', subjectId: 'maths', grade: 8.5, type: 'DS', coeff: 7, period: '2ème Trimestre', date: '2025-02-15', comment: 'DS Probabilités difficile' },
  { id: 'eval-2', subjectId: 'histoire-geo', grade: 16.0, type: 'DS', coeff: 4, period: '2ème Trimestre', date: '2025-02-18', comment: 'Dissertation sur la décolonisation' },
  { id: 'eval-3', subjectId: 'francais', grade: 11.5, type: 'CC', coeff: 5, period: '2ème Trimestre', date: '2025-02-20', comment: 'Commentaire de texte littéraire' },
  { id: 'eval-4', subjectId: 'svt', grade: 13.0, type: 'DS', coeff: 6, period: '2ème Trimestre', date: '2025-02-22', comment: 'TP Génétique et mitose' },
  { id: 'eval-5', subjectId: 'anglais', grade: 15.0, type: 'CC', coeff: 3, period: '2ème Trimestre', date: '2025-02-12', comment: 'Expression orale sur l’IA' }
];

export const initialHomeworks: Homework[] = [
  {
    id: 'hw-1',
    title: 'Exposé de SVT : La photosynthèse',
    subjectId: 'svt',
    dueDate: '2025-03-18',
    dueTime: '08:00',
    priority: 'high',
    duration: '1 h 00',
    description: 'À faire en groupe. Préparer un diaporama de 10 diapositives expliquant la phase claire et sombre.',
    completed: false,
    groupMembers: ['Lucas', 'Sarah']
  },
  {
    id: 'hw-2',
    title: 'Devoir Maison de Maths (DM n°4)',
    subjectId: 'maths',
    dueDate: '2025-03-22',
    dueTime: '10:00',
    priority: 'medium',
    duration: '2 h +',
    description: 'DM sur l\'analyse combinatoire et probabilités conditionnelles. Exercices 1, 2 et 3 complets.',
    completed: false,
    progress: 50
  },
  {
    id: 'hw-3',
    title: 'Dissertation de Philosophie',
    subjectId: 'philo',
    dueDate: '2025-03-27',
    dueTime: '08:00',
    priority: 'medium',
    duration: '2 h +',
    description: 'Sujet : "L\'art nous éloigne-t-il de la réalité ?" Rédiger l\'introduction et le plan détaillé.',
    completed: false
  },
  {
    id: 'hw-4',
    title: 'Compte-rendu de laboratoire n°6',
    subjectId: 'physique',
    dueDate: '2025-03-29',
    dueTime: '14:00',
    priority: 'low',
    duration: '30 min',
    description: 'TP Électrostatique : reporter les valeurs mesurées et tracer la courbe de potentiel.',
    completed: false
  },
  {
    id: 'hw-5',
    title: 'Présentation sur les énergies renouvelables',
    subjectId: 'anglais',
    dueDate: '2025-04-02',
    dueTime: '12:00',
    priority: 'medium',
    duration: '30 min',
    description: 'Oral individuel de 5 minutes sur la géothermie ou l\'éolien en Afrique de l\'Ouest.',
    completed: false
  }
];

export const initialTransactions: Transaction[] = [
  {
    id: 't-1',
    type: 'income',
    amount: 25000,
    category: 'Argent de poche',
    date: '2025-02-01',
    paymentMethod: 'Wave',
    isRecurring: true,
    description: 'Aide parentale mensuelle'
  },
  {
    id: 't-2',
    type: 'expense',
    amount: 7500,
    category: 'Transports / Bus',
    date: '2025-02-05',
    paymentMethod: 'Orange Money',
    isRecurring: true,
    description: 'Forfait Internet & Abonnement Bus'
  },
  {
    id: 't-3',
    type: 'expense',
    amount: 3000,
    category: 'Fournitures & Livres',
    date: '2025-02-10',
    paymentMethod: 'Espèces',
    isRecurring: false,
    description: 'Annales de bac de Mathématiques & SVT'
  }
];
