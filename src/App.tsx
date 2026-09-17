import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Bell, 
  Plus, 
  Trash2, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  Calculator,
  RefreshCw,
  HelpCircle, 
  TrendingUp, 
  CheckCircle, 
  Bookmark, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  GraduationCap, 
  User, 
  ChevronRight, 
  Settings, 
  LogOut, 
  Lock, 
  Eye, 
  EyeOff, 
  Info, 
  ShieldCheck, 
  PlusCircle, 
  Trash, 
  Briefcase, 
  PiggyBank, 
  Bus, 
  Coffee, 
  FileText, 
  Wifi, 
  Home, 
  Smartphone, 
  DollarSign, 
  AlertTriangle,
  Flame,
  UserCheck,
  X
} from 'lucide-react';
import { Subject, Evaluation, Homework, Transaction, Profile } from './types';
import { initialProfile, initialSubjects, initialEvaluations, initialHomeworks, initialTransactions } from './data';

export default function App() {
  // Navigation: 'onboarding' | 'dashboard' | 'simulator' | 'homeworks' | 'budget' | 'add-grade' | 'add-homework' | 'add-transaction' | 'manage-subjects'
  const [activeTab, setActiveTab] = useState<'accueil' | 'simulator' | 'homeworks' | 'budget' | 'profile'>('accueil');
  const [currentScreen, setCurrentScreen] = useState<string>(() => {
    const saved = localStorage.getItem('as_onboard_completed');
    return saved === 'true' ? 'main' : 'landing';
  }); 
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [subjectBackScreen, setSubjectBackScreen] = useState<'onboarding' | 'main'>('main');

  // Persistent States
  const [profile, setProfile] = useState<Profile>(() => {
    const saved = localStorage.getItem('as_profile');
    return saved ? JSON.parse(saved) : initialProfile;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('as_subjects');
    return saved ? JSON.parse(saved) : initialSubjects;
  });

  const [evaluations, setEvaluations] = useState<Evaluation[]>(() => {
    const saved = localStorage.getItem('as_evaluations');
    return saved ? JSON.parse(saved) : initialEvaluations;
  });

  const [homeworks, setHomeworks] = useState<Homework[]>(() => {
    const saved = localStorage.getItem('as_homeworks');
    return saved ? JSON.parse(saved) : initialHomeworks;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('as_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  // Local state for forms
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('maths');
  
  // Save states to LocalStorage
  useEffect(() => {
    localStorage.setItem('as_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('as_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('as_evaluations', JSON.stringify(evaluations));
  }, [evaluations]);

  useEffect(() => {
    localStorage.setItem('as_homeworks', JSON.stringify(homeworks));
  }, [homeworks]);

  useEffect(() => {
    localStorage.setItem('as_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // AI Advice dynamic state generator
  const [aiAdvice, setAiAdvice] = useState<string>("");
  const [isGeneratingAdvice, setIsGeneratingAdvice] = useState<boolean>(false);

  // Auto-generate AI advise based on current averages
  useEffect(() => {
    const calculateSubjectAverages = () => {
      const avgs: { [key: string]: { sum: number, count: number } } = {};
      evaluations.forEach(e => {
        if (!avgs[e.subjectId]) avgs[e.subjectId] = { sum: 0, count: 0 };
        avgs[e.subjectId].sum += e.grade;
        avgs[e.subjectId].count += 1;
      });
      return Object.keys(avgs).map(id => ({
        id,
        name: subjects.find(s => s.id === id)?.name || id,
        avg: avgs[id].sum / avgs[id].count
      }));
    };

    const averages = calculateSubjectAverages();
    if (averages.length === 0) {
      setAiAdvice("Ajoute tes premières notes pour obtenir un conseil IA personnalisé de réussite !");
      return;
    }

    const lowSubjects = averages.filter(a => a.avg < 10);
    const strongSubjects = averages.filter(a => a.avg >= 14);

    let advice = "";
    if (lowSubjects.length > 0) {
      advice += `Attention aux ${lowSubjects.map(s => s.name).join(', ')} où la moyenne est en dessous de 10. Quelques révisions ciblées te feront rapidement remonter ! `;
    } else {
      advice += "Excellent travail, toutes tes matières suivies sont au-dessus de la moyenne ! ";
    }

    if (strongSubjects.length > 0) {
      advice += `Tes points forts sont en ${strongSubjects.map(s => s.name).join(', ')}. Continue ainsi pour garantir une mention !`;
    } else {
      advice += "Reste régulier et vise 14/20 pour débloquer la mention Bien.";
    }

    setAiAdvice(advice);
  }, [evaluations, subjects]);

  // Helper Calculations
  const calculateOverallAverage = () => {
    let totalPoints = 0;
    let totalCoeffs = 0;

    const subjectAverages: { [key: string]: number } = {};
    const subjectCounts: { [key: string]: number } = {};

    evaluations.forEach(e => {
      if (!subjectAverages[e.subjectId]) {
        subjectAverages[e.subjectId] = 0;
        subjectCounts[e.subjectId] = 0;
      }
      subjectAverages[e.subjectId] += e.grade;
      subjectCounts[e.subjectId] += 1;
    });

    subjects.forEach(s => {
      const avg = subjectCounts[s.id] > 0 ? (subjectAverages[s.id] / subjectCounts[s.id]) : null;
      if (avg !== null) {
        totalPoints += avg * s.coeff;
        totalCoeffs += s.coeff;
      }
    });

    return totalCoeffs > 0 ? (totalPoints / totalCoeffs) : 12.4; // Default mockup fallback if empty
  };

  const overallAverage = calculateOverallAverage();

  // Budget calculations
  const calculateBudgetSummary = () => {
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const incomes = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const balance = incomes - expenses;
    return { incomes, expenses, balance };
  };

  const budgetSummary = calculateBudgetSummary();

  // Active form inputs
  // Evaluation Form
  const [formGrade, setFormGrade] = useState<number>(16.5);
  const [formSubjectId, setFormSubjectId] = useState<string>('maths');
  const [formEvalType, setFormEvalType] = useState<string>('DS');
  const [formCoeff, setFormCoeff] = useState<number>(2);
  const [formPeriod, setFormPeriod] = useState<string>('2ème Trimestre');
  const [formDate, setFormDate] = useState<string>('2025-02-24');
  const [formComment, setFormComment] = useState<string>('');

  // Homework Form
  const [hwTitle, setHwTitle] = useState<string>('');
  const [hwSubjectId, setHwSubjectId] = useState<string>('maths');
  const [hwDueDate, setHwDueDate] = useState<string>('2025-05-16');
  const [hwDueTime, setHwDueTime] = useState<string>('14:00');
  const [hwPriority, setHwPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [hwDuration, setHwDuration] = useState<string>('1h00');
  const [hwDescription, setHwDescription] = useState<string>('');
  const [hwMembers, setHwMembers] = useState<string>('');

  // Transaction Form
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const [txAmount, setTxAmount] = useState<number>(2500);
  const [txCategory, setTxCategory] = useState<string>('Transports / Bus');
  const [txMethod, setTxMethod] = useState<string>('Espèces');
  const [txIsRecurring, setTxIsRecurring] = useState<boolean>(false);
  const [txDesc, setTxDesc] = useState<string>('');

  // Onboarding Form (Wizard)
  const [onboardLastName, setOnboardLastName] = useState<string>(() => profile.lastName || 'Diallo');
  const [onboardFirstName, setOnboardFirstName] = useState<string>(() => profile.firstName || 'Amadou');
  const [onboardPhone, setOnboardPhone] = useState<string>(() => profile.phone || '+221 77 000 00 00');
  const [onboardPinCode, setOnboardPinCode] = useState<string>(() => profile.pinCode || '123456');
  const [onboardSchool, setOnboardSchool] = useState<string>(() => profile.schoolName || 'Lycée Lamine Guèye');
  const [onboardStep, setOnboardStep] = useState<number>(1);
  const [onboardGradeLevel, setOnboardGradeLevel] = useState<string>('lycee');
  const [onboardClass, setOnboardClass] = useState<string>('Terminale S2');
  const [onboardSubjects, setOnboardSubjects] = useState<Subject[]>(initialSubjects);

  // Subject Manager & Popup state
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState<boolean>(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isEditSubjectOpen, setIsEditSubjectOpen] = useState<boolean>(false);
  const [editSubjName, setEditSubjName] = useState<string>('');
  const [editSubjCoeff, setEditSubjCoeff] = useState<number>(2);
  const [editSubjIcon, setEditSubjIcon] = useState<string>('school');
  const [editSubjCategory, setEditSubjCategory] = useState<string>('Tronc Commun');

  // Subject Manager Form
  const [newSubjName, setNewSubjName] = useState<string>('');
  const [newSubjCoeff, setNewSubjCoeff] = useState<number>(2);
  const [newSubjIcon, setNewSubjIcon] = useState<string>('school');
  const [newSubjCategory, setNewSubjCategory] = useState<string>('Tronc Commun');

  // Profile Edit States
  const [profFirstName, setProfFirstName] = useState<string>(() => profile.firstName || '');
  const [profLastName, setProfLastName] = useState<string>(() => profile.lastName || '');
  const [profPhone, setProfPhone] = useState<string>(() => profile.phone || '');
  const [profPinCode, setProfPinCode] = useState<string>(() => profile.pinCode || '');
  const [profSchool, setProfSchool] = useState<string>(() => profile.schoolName || '');
  const [profGradeLevel, setProfGradeLevel] = useState<string>(() => profile.gradeLevel || 'lycee');
  const [profClass, setProfClass] = useState<string>(() => profile.className || 'Terminale S2');
  const [profAvatarUrl, setProfAvatarUrl] = useState<string>(() => profile.avatarUrl || '');
  const [isPhotoEditOpen, setIsPhotoEditOpen] = useState<boolean>(false);
  const [profileSuccessMessage, setProfileSuccessMessage] = useState<string>('');

  useEffect(() => {
    setProfFirstName(profile.firstName || '');
    setProfLastName(profile.lastName || '');
    setProfPhone(profile.phone || '');
    setProfPinCode(profile.pinCode || '');
    setProfSchool(profile.schoolName || '');
    setProfGradeLevel(profile.gradeLevel || 'lycee');
    setProfClass(profile.className || 'Terminale S2');
    setProfAvatarUrl(profile.avatarUrl || '');
  }, [profile]);

  const startOnboarding = () => {
    setOnboardStep(1);
    setCurrentScreen('onboarding');
  };

  // Handlers
  const handleAddEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    const newEval: Evaluation = {
      id: 'eval-' + Date.now(),
      subjectId: formSubjectId,
      grade: formGrade,
      type: formEvalType,
      coeff: formCoeff,
      period: formPeriod,
      date: formDate,
      comment: formComment || undefined
    };
    setEvaluations([newEval, ...evaluations]);
    setCurrentScreen('main');
    setActiveTab('accueil');
    
    // Reset
    setFormComment('');
    setFormGrade(12.0);
  };

  const handleAddHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwTitle.trim()) return;
    const newHw: Homework = {
      id: 'hw-' + Date.now(),
      title: hwTitle,
      subjectId: hwSubjectId,
      dueDate: hwDueDate,
      dueTime: hwDueTime,
      priority: hwPriority,
      duration: hwDuration,
      description: hwDescription || undefined,
      completed: false,
      groupMembers: hwMembers ? hwMembers.split(',').map(m => m.trim()) : undefined
    };
    setHomeworks([newHw, ...homeworks]);
    setCurrentScreen('main');
    setActiveTab('homeworks');
    
    // Reset
    setHwTitle('');
    setHwDescription('');
    setHwMembers('');
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (txAmount <= 0) return;
    const newTx: Transaction = {
      id: 'tx-' + Date.now(),
      type: txType,
      amount: txAmount,
      category: txCategory,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: txMethod,
      isRecurring: txIsRecurring,
      description: txDesc || undefined
    };
    setTransactions([newTx, ...transactions]);
    setCurrentScreen('main');
    setActiveTab('budget');

    // Reset
    setTxAmount(2500);
    setTxDesc('');
  };

  const deleteEvaluation = (id: string) => {
    setEvaluations(evaluations.filter(e => e.id !== id));
  };

  const toggleHomeworkCompleted = (id: string) => {
    setHomeworks(homeworks.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
  };

  const deleteHomework = (id: string) => {
    setHomeworks(homeworks.filter(h => h.id !== id));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // Onboarding submit
  const submitOnboarding = () => {
    const updatedProfile: Profile = {
      ...profile,
      fullName: `${onboardFirstName} ${onboardLastName}`.trim(),
      firstName: onboardFirstName,
      lastName: onboardLastName,
      phone: onboardPhone,
      pinCode: onboardPinCode,
      schoolName: onboardSchool,
      gradeLevel: onboardGradeLevel,
      className: onboardClass,
    };
    setProfile(updatedProfile);
    setSubjects(onboardSubjects);
    localStorage.setItem('as_onboard_completed', 'true');
    setCurrentScreen('main');
    setActiveTab('accueil');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: Profile = {
      ...profile,
      fullName: `${profFirstName} ${profLastName}`.trim(),
      firstName: profFirstName,
      lastName: profLastName,
      phone: profPhone,
      pinCode: profPinCode,
      schoolName: profSchool,
      gradeLevel: profGradeLevel,
      className: profClass,
      avatarUrl: profAvatarUrl
    };
    setProfile(updatedProfile);
    setProfileSuccessMessage('Votre profil a été enregistré avec succès !');
    setTimeout(() => {
      setProfileSuccessMessage('');
    }, 4000);
  };

  const startEditingSubject = (subj: Subject) => {
    setEditingSubject(subj);
    setEditSubjName(subj.name);
    setEditSubjCoeff(subj.coeff);
    setEditSubjIcon(subj.icon || 'school');
    setEditSubjCategory(subj.category);
    setIsEditSubjectOpen(true);
  };

  const handleSaveEditSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;

    const categoryColors: Record<string, string> = {
      'Matière principale': '#1d4ed8',
      'Laboratoire & Écrit': '#3b82f6',
      'Sciences de la Vie et Terre': '#10b981',
      'Dissertation & Texte': '#f59e0b',
      'Épreuves anticipées': '#6366f1',
      'LV1': '#06b6d4',
      'Tronc commun': '#8b5cf6',
    };
    const color = categoryColors[editSubjCategory] || '#2563eb';

    const updatedSubj: Subject = {
      ...editingSubject,
      name: editSubjName.trim(),
      coeff: editSubjCoeff,
      icon: editSubjIcon,
      category: editSubjCategory,
      color,
    };

    setSubjects(subjects.map(s => s.id === editingSubject.id ? updatedSubj : s));
    setOnboardSubjects(onboardSubjects.map(s => s.id === editingSubject.id ? updatedSubj : s));
    
    setIsEditSubjectOpen(false);
    setEditingSubject(null);
  };

  // Change onboarding subject coefficient
  const adjustCoeff = (subjectId: string, increment: boolean) => {
    setOnboardSubjects(onboardSubjects.map(s => {
      if (s.id === subjectId) {
        const newCoeff = increment ? Math.min(10, s.coeff + 1) : Math.max(1, s.coeff - 1);
        return { ...s, coeff: newCoeff };
      }
      return s;
    }));
  };

  // Subject management actions
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName.trim()) return;
    const newSubjId = 'subj-' + Date.now();
    const categoryColors: Record<string, string> = {
      'Matière principale': '#1d4ed8',
      'Laboratoire & Écrit': '#3b82f6',
      'Sciences de la Vie et Terre': '#10b981',
      'Dissertation & Texte': '#f59e0b',
      'Épreuves anticipées': '#6366f1',
      'LV1': '#06b6d4',
      'Tronc commun': '#8b5cf6',
    };
    const color = categoryColors[newSubjCategory] || '#2563eb';
    const newSubj: Subject = {
      id: newSubjId,
      name: newSubjName.trim(),
      coeff: newSubjCoeff,
      color,
      icon: newSubjIcon,
      category: newSubjCategory
    };
    
    // Add to both lists to keep them aligned
    setSubjects([...subjects, newSubj]);
    setOnboardSubjects([...onboardSubjects, newSubj]);
    
    // Reset form
    setNewSubjName('');
    setNewSubjCoeff(2);
    setNewSubjIcon('school');
    setIsAddSubjectOpen(false);
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
    setOnboardSubjects(onboardSubjects.filter(s => s.id !== id));
    
    // Also cleanup linked evaluations and homeworks to prevent runtime crashes
    setEvaluations(evaluations.filter(e => e.subjectId !== id));
    setHomeworks(homeworks.filter(h => h.subjectId !== id));
  };

  // Quick helper for categories icon mapping
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Transports / Bus': return <Bus className="w-5 h-5" />;
      case 'Nourriture / Cantine': return <Coffee className="w-5 h-5" />;
      case 'Fournitures & Livres': return <BookOpen className="w-5 h-5" />;
      case 'Forfait Data': return <Wifi className="w-5 h-5" />;
      case 'Logement': return <Home className="w-5 h-5" />;
      default: return <PiggyBank className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 flex justify-center antialiased select-none font-sans">
      {/* Container simulating a standard West-African student mobile layout (480px width) */}
      <div className="w-full max-w-[480px] min-h-screen flex flex-col bg-white shadow-xl relative overflow-x-hidden">
        
        {/* ==================== SCREEN: LANDING PAGE ==================== */}
        {currentScreen === 'landing' && (
          <div className="relative min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-4 pb-8 overflow-y-auto animate-fade-in">
            {/* Ambient Light Atmospheric Refraction */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
              <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[420px] h-[360px] bg-blue-500/10 rounded-full blur-[110px]"></div>
              <div className="absolute top-[480px] -right-24 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px]"></div>
              <div className="absolute bottom-10 -left-20 w-[260px] h-[260px] bg-slate-200/40 rounded-full blur-[90px]"></div>
            </div>

            <div className="relative z-10 space-y-6 flex-1 flex flex-col justify-between">
              {/* Top Bar Navigation */}
              <header className="flex justify-between items-center w-full py-2">
                <div className="flex items-center gap-2">
                  <img 
                    alt="NoteUp Logo" 
                    className="w-8 h-8 rounded-lg object-contain shadow-sm border border-slate-200" 
                    src="https://lh3.googleusercontent.com/aida/AEtjO1WZfJC-_i586RLrCbYfjdVJLr3MZIGJwofcoo0hHfJ7n4JbDVoFvsI0CReeLXqTURzoY9gcYXDlq01WIZpmN3X3C-1x7DOeJIpHz5ewkEfQnct_ZwBpkeHR8JXWIFQNx1yrNkpP_ZOa1wUBsoMFH66SOIFurf2otnVpWjdafoFYo3W8IUk2piaUkdSHPG3VKHPnZWhM8BFwP7dmy2CGfp0LupDu5H_XoW8qEBGk8ITfmEfrPLAcIHWKSA"
                  />
                  <span className="text-xl font-black text-slate-900 tracking-tight">NoteUp</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-blue-600 tracking-wider font-mono">No Excuses</span>
                </div>
              </header>

              {/* Central Hero & Academic ID Card */}
              <section className="space-y-6">
                {/* Academic ID Badge Card */}
                <div className="relative w-full rounded-2xl bg-white border border-slate-200 p-5 shadow-md border-t-4 border-t-blue-600">
                  {/* Badge Top Header Bar */}
                  <div className="flex justify-between items-start pb-3.5 border-b border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 font-mono">PROTOCOLE ACADÉMIQUE</span>
                      <span className="text-sm font-bold text-slate-900">Licence Exécutive</span>
                    </div>
                    <div className="px-2 py-0.5 rounded bg-blue-50 border border-blue-100 text-blue-600 text-[9px] font-extrabold tracking-wider">
                      STATUS: ACTIF
                    </div>
                  </div>

                  {/* Academic Core Metric Grid */}
                  <div className="py-4 grid grid-cols-2 gap-4 items-center">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Moyenne Générale</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-4xl font-black text-slate-900 tracking-tight">16.8</span>
                        <span className="text-[11px] text-slate-400 font-bold font-mono">/20</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Position Promotion</span>
                      <div className="inline-flex items-center gap-1 mt-1 bg-emerald-50 border border-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[10px] font-black font-mono">Top 3%</span>
                      </div>
                      <span className="text-[10px] text-blue-600 font-extrabold tracking-wide mt-1">Pas d'excuses</span>
                    </div>
                  </div>

                  {/* Academic Velocity Progression Bar */}
                  <div className="space-y-1.5 pt-3.5 border-t border-slate-100">
                    <div className="flex justify-between text-[9px] font-extrabold text-slate-400 font-mono">
                      <span>RYTHME RATTRAPAGES</span>
                      <span className="text-emerald-600 font-black">94.2% OBJECTIF</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 p-0.5 relative overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600" style={{ width: '84%' }}></div>
                      <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-emerald-500 shadow-[0_0_6px_#10b981]"></div>
                    </div>
                  </div>
                </div>

                {/* Provocative Sharp Hook & Narrative Content */}
                <div className="space-y-3">
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    L'incertitude a son charme, mais <span className="text-blue-600 underline decoration-blue-300 underline-offset-4">pas sur votre bulletin</span> trimestriel.
                  </h1>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Suivez vos notes en temps réel, prévoyez vos rattrapages et humiliez poliment vos camarades aux quiz.
                  </p>
                </div>

                {/* Feature Bullets */}
                <div className="flex flex-col gap-2.5">
                  {/* Bullet 1 */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">Calcul de moyenne prédictif au centième près</span>
                  </div>
                  {/* Bullet 2 */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">Générateur de quiz IA depuis tes fiches froissées</span>
                  </div>
                  {/* Bullet 3 */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600 shrink-0 border border-cyan-100">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">Devoirs synchronisés avec ta classe</span>
                  </div>
                </div>
              </section>

              {/* Execution CTA Module & Drama-Free Authentication Link */}
              <footer className="pt-4 flex flex-col items-center gap-3">
                <button 
                  onClick={() => setCurrentScreen('onboarding')}
                  className="w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(37,99,235,0.3)] active:scale-[0.98] transition-all duration-150 group cursor-pointer"
                  type="button"
                >
                  <span>Prendre le contrôle (Commencer)</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => {
                    localStorage.setItem('as_onboard_completed', 'true');
                    setCurrentScreen('main');
                  }}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors py-1 flex items-center gap-1 cursor-pointer bg-transparent border-none"
                  type="button"
                >
                  <span>Déjà inscrit ?</span>
                  <span className="text-slate-900 font-extrabold underline decoration-slate-300">Connexion sans drama</span>
                </button>
              </footer>
            </div>
          </div>
        )}

        {/* ==================== ONBOARDING / CONFIG WIZARD SCREEN ==================== */}
        {currentScreen === 'onboarding' && (
          <div className="flex flex-col flex-1 pb-32 animate-fade-in bg-slate-50">
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 pt-4 pb-3 border-b border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                {/* Back button only if we can go back */}
                {onboardStep > 1 ? (
                  <button 
                    onClick={() => setOnboardStep(onboardStep - 1)} 
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-700 active:scale-95 transition-all"
                    type="button"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                ) : localStorage.getItem('as_onboard_completed') === 'true' ? (
                  <button 
                    onClick={() => setCurrentScreen('main')} 
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-700 active:scale-95 transition-all"
                    type="button"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="w-9 h-9" />
                )}

                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-semibold text-xs">
                  Étape {onboardStep} sur 3
                </span>

                {localStorage.getItem('as_onboard_completed') === 'true' ? (
                  <button 
                    onClick={() => setCurrentScreen('main')}
                    className="text-slate-500 font-medium text-sm hover:text-slate-800 cursor-pointer"
                    type="button"
                  >
                    Annuler
                  </button>
                ) : (
                  <div className="w-[50px]" />
                )}
              </div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Inscription de votre profil</span>
                  <span className="text-blue-600 font-bold">{Math.round((onboardStep / 3) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${(onboardStep / 3) * 100}%` }}></div>
                </div>
              </div>
            </header>

            <main className="px-4 pt-4 space-y-6 flex-1">
              
              {/* STEP 1: Personal Info */}
              {onboardStep === 1 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex gap-3 text-slate-800">
                    <span className="material-symbols-outlined text-blue-600 text-xl shrink-0 mt-0.5 animate-bounce">person</span>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-800 block">Création de Profil</span>
                      <h1 className="text-lg font-bold text-slate-900 mt-0.5">Identité de l'élève</h1>
                      <p className="text-xs text-slate-600 mt-1 font-medium">Saisissez vos informations personnelles pour configurer votre année d'études.</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">Prénom <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={onboardFirstName}
                          onChange={(e) => setOnboardFirstName(e.target.value)}
                          placeholder="ex. Amadou"
                          className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:border-blue-600 focus:outline-none bg-slate-50 text-slate-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">Nom <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={onboardLastName}
                          onChange={(e) => setOnboardLastName(e.target.value)}
                          placeholder="ex. Diallo"
                          className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:border-blue-600 focus:outline-none bg-slate-50 text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Numéro de téléphone <span className="text-red-500">*</span></label>
                      <input
                        type="tel"
                        required
                        value={onboardPhone}
                        onChange={(e) => setOnboardPhone(e.target.value)}
                        placeholder="ex. +221 77 000 00 00"
                        className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:border-blue-600 focus:outline-none bg-slate-50 text-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Code PIN de sécurité (6 chiffres) <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        pattern="[0-9]*"
                        maxLength={6}
                        required
                        value={onboardPinCode}
                        onChange={(e) => setOnboardPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="ex. 123456"
                        className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-sm font-bold tracking-widest text-center focus:border-blue-600 focus:outline-none bg-slate-50 text-slate-800"
                      />
                      <span className="text-[10px] text-slate-400 font-semibold block text-center mt-1">Sert à sécuriser votre accès et vos dépenses.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Level & Class */}
              {onboardStep === 2 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex gap-3 text-slate-800">
                    <GraduationCap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block">Scolarité</span>
                      <h1 className="text-lg font-bold text-slate-900 mt-0.5">Votre établissement &amp; classe</h1>
                      <p className="text-xs text-slate-600 mt-1 font-medium">Renseignez votre école, puis sélectionnez votre niveau et votre classe par simple clic.</p>
                    </div>
                  </div>

                  {/* School Input */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
                    <label className="text-xs font-bold text-slate-700 block">Nom de votre École / Établissement <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={onboardSchool}
                      onChange={(e) => setOnboardSchool(e.target.value)}
                      placeholder="ex. Lycée Lamine Guèye ou Collège Sacré-Cœur"
                      className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:border-blue-600 focus:outline-none bg-slate-50 text-slate-800"
                    />
                  </div>

                  {/* Segmented level buttons */}
                  <div className="flex p-1 bg-slate-100 rounded-xl gap-1 border border-slate-200">
                    {['college', 'lycee', 'superieur'].map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => {
                          setOnboardGradeLevel(lvl);
                          if (lvl === 'college') setOnboardClass('3ème');
                          if (lvl === 'lycee') setOnboardClass('Terminale S2');
                          if (lvl === 'superieur') setOnboardClass('Licence 1');
                        }}
                        className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          onboardGradeLevel === lvl 
                            ? 'bg-white text-blue-600 shadow-xs border border-slate-150' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                        type="button"
                      >
                        {lvl === 'college' ? 'Collège' : lvl === 'lycee' ? 'Lycée' : 'Université'}
                      </button>
                    ))}
                  </div>

                  {/* Grid class buttons choice */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {onboardGradeLevel === 'college' && [
                      { name: '6ème', desc: 'Classe de 6e' },
                      { name: '5ème', desc: 'Classe de 5e' },
                      { name: '4ème', desc: 'Classe de 4e' },
                      { name: '3ème', desc: 'Brevet (BFEM/DEF)' }
                    ].map(item => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setOnboardClass(item.name)}
                        className={`p-3.5 rounded-xl border flex flex-col items-start text-left cursor-pointer transition-all ${
                          onboardClass === item.name
                            ? 'border-2 border-blue-600 bg-blue-50/30 text-blue-900 shadow-sm scale-98'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-sm font-bold block">{item.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium mt-1">{item.desc}</span>
                      </button>
                    ))}

                    {onboardGradeLevel === 'lycee' && [
                      { name: 'Seconde', desc: 'Lycée - 2nde' },
                      { name: 'Première', desc: 'Lycée - 1ère' },
                      { name: 'Terminale S2', desc: 'Sciences Physiques' },
                      { name: 'Terminale S1', desc: 'Mathématiques' },
                      { name: 'Terminale L', desc: 'Lettres & Langues' }
                    ].map(item => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setOnboardClass(item.name)}
                        className={`p-3.5 rounded-xl border flex flex-col items-start text-left cursor-pointer transition-all ${
                          onboardClass === item.name
                            ? 'border-2 border-blue-600 bg-blue-50/30 text-blue-900 shadow-sm scale-98'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-sm font-bold block">{item.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium mt-1">{item.desc}</span>
                      </button>
                    ))}

                    {onboardGradeLevel === 'superieur' && [
                      { name: 'Licence 1', desc: 'Université - L1' },
                      { name: 'Licence 2', desc: 'Université - L2' },
                      { name: 'Licence 3', desc: 'Licence Pro' },
                      { name: 'Master 1', desc: 'Master - M1' },
                      { name: 'Master 2', desc: 'Master - M2' }
                    ].map(item => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setOnboardClass(item.name)}
                        className={`p-3.5 rounded-xl border flex flex-col items-start text-left cursor-pointer transition-all ${
                          onboardClass === item.name
                            ? 'border-2 border-blue-600 bg-blue-50/30 text-blue-900 shadow-sm scale-98'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-sm font-bold block">{item.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium mt-1">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: Subjects Selection & Addition */}
              {onboardStep === 3 && (
                <div className="space-y-5 animate-fade-in">
                  
                  {/* Notice block at the top as requested */}
                  <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 flex gap-2.5 text-indigo-950">
                    <span className="material-symbols-outlined text-indigo-700 shrink-0 mt-0.5">info</span>
                    <p className="text-xs font-bold leading-relaxed">
                      Vous pouvez modifier les matières ainsi que les coefficients plus tard.
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sélectionnez vos matières</h2>
                    <span className="text-[10px] font-bold bg-slate-150 text-slate-600 px-2.5 py-0.5 rounded-full">{onboardSubjects.length} matières</span>
                  </div>

                  {/* List of configured subjects */}
                  <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                    {onboardSubjects.map(subj => (
                      <div 
                        key={subj.id} 
                        onClick={() => startEditingSubject(subj)}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs hover:border-blue-300 cursor-pointer transition-all active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-blue-600 bg-blue-50 p-2 rounded-xl text-lg">
                            {subj.icon || 'school'}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">{subj.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">Coeff {subj.coeff} • {subj.category}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-slate-300 hover:text-blue-600 p-1 text-sm">edit</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOnboardSubjects(onboardSubjects.filter(s => s.id !== subj.id));
                            }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {onboardSubjects.length === 0 && (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        Aucune matière sélectionnée. Ajoutez-en une pour démarrer !
                      </div>
                    )}
                  </div>

                  {/* Button to add unlisted subject in a popup */}
                  <button
                    type="button"
                    onClick={() => {
                      setSubjectBackScreen('onboarding');
                      setIsAddSubjectOpen(true);
                    }}
                    className="w-full py-3.5 bg-blue-50 hover:bg-blue-100 border border-dashed border-blue-300 text-blue-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    <span>Ajouter une matière manquante</span>
                  </button>
                </div>
              )}
            </main>

            <footer className="fixed bottom-0 left-0 right-0 w-full max-w-[480px] mx-auto bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 border-t border-slate-100 shadow-[0_-8px_20px_rgba(15,23,42,0.05)] z-40">
              <div className="flex justify-between items-center mb-3 px-1 text-xs text-slate-500">
                <span>{onboardStep === 3 ? 'Total des coefficients' : 'Progression'}</span>
                <span className="font-bold text-slate-900 text-sm">
                  {onboardStep === 3 
                    ? onboardSubjects.reduce((sum, s) => sum + s.coeff, 0)
                    : `${onboardStep} / 3`
                  }
                </span>
              </div>
              
              {onboardStep === 1 && (
                <button
                  onClick={() => {
                    if (!onboardFirstName.trim() || !onboardLastName.trim() || !onboardPhone.trim() || onboardPinCode.length !== 6) {
                      alert("Veuillez remplir correctement tous les champs obligatoires (*) et saisir un code PIN de 6 chiffres.");
                      return;
                    }
                    setOnboardStep(2);
                  }}
                  className="w-full h-12 bg-blue-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md hover:bg-blue-700 transition-all active:scale-[0.98] cursor-pointer"
                  type="button"
                >
                  <span>Continuer</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {onboardStep === 2 && (
                <button
                  onClick={() => {
                    if (!onboardSchool.trim()) {
                      alert("Veuillez saisir le nom de votre École / Établissement.");
                      return;
                    }
                    setOnboardStep(3);
                  }}
                  className="w-full h-12 bg-blue-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md hover:bg-blue-700 transition-all active:scale-[0.98] cursor-pointer"
                  type="button"
                >
                  <span>Continuer</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {onboardStep === 3 && (
                <button
                  onClick={submitOnboarding}
                  className="w-full h-12 bg-emerald-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md hover:bg-emerald-700 transition-all active:scale-[0.98] cursor-pointer"
                  type="button"
                >
                  <span>Valider et terminer l'inscription</span>
                  <CheckCircle className="w-5 h-5" />
                </button>
              )}
            </footer>
          </div>
        )}

        {/* ==================== SCREEN: MANAGE SUBJECTS ==================== */}
        {currentScreen === 'manage-subjects' && (
          <div className="flex flex-col flex-1 pb-24 animate-fade-in bg-slate-50">
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    if (subjectBackScreen === 'onboarding') {
                      setCurrentScreen('onboarding');
                    } else {
                      setCurrentScreen('main');
                    }
                  }} 
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-700 active:scale-95 transition-all"
                  type="button"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-base font-bold text-slate-900">Gérer mes matières</h1>
                  <p className="text-[11px] text-slate-400 font-medium">Cliquez sur une matière pour la modifier</p>
                </div>
              </div>
            </header>

            <main className="px-4 py-4 space-y-5 flex-1">
              {/* CURRENT SUBJECTS SECTION */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Matières actuelles ({(subjectBackScreen === 'onboarding' ? onboardSubjects : subjects).length})</h2>
                  <button
                    type="button"
                    onClick={() => setIsAddSubjectOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all active:scale-95 cursor-pointer shadow-xs"
                  >
                    <span className="material-symbols-outlined text-xs">add</span>
                    <span>Ajouter</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {(subjectBackScreen === 'onboarding' ? onboardSubjects : subjects).map(subj => (
                    <div 
                      key={subj.id} 
                      onClick={() => startEditingSubject(subj)}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs hover:border-blue-300 cursor-pointer transition-all active:scale-[0.99] group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-blue-600 bg-blue-50 p-2 rounded-xl text-lg group-hover:bg-blue-100 transition-colors">
                          {subj.icon || 'school'}
                        </span>
                        <div>
                          <span className="text-sm font-bold text-slate-800 block">{subj.name}</span>
                          <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">{subj.category} • Coeff {subj.coeff}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-300 hover:text-blue-600 text-sm">edit</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSubject(subj.id);
                          }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 active:scale-95 transition-all"
                          title="Supprimer la matière"
                          type="button"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(subjectBackScreen === 'onboarding' ? onboardSubjects : subjects).length === 0 && (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      Aucune matière configurée. Cliquez sur le bouton "Ajouter" pour commencer !
                    </div>
                  )}
                </div>
              </div>

              {/* Helpful educational advice */}
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100/50 text-blue-950 text-xs leading-relaxed font-medium">
                💡 <b className="font-bold">Astuce:</b> Toutes les moyennes de classe de votre relevé s'adapteront automatiquement au changement des coefficients et de barèmes.
              </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 w-full max-w-[480px] mx-auto bg-white border-t border-slate-100 p-4 flex justify-end z-40">
              <button
                type="button"
                onClick={() => {
                  if (subjectBackScreen === 'onboarding') {
                    setCurrentScreen('onboarding');
                  } else {
                    setCurrentScreen('main');
                  }
                }}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                Terminer les réglages
              </button>
            </footer>
          </div>
        )}

        {/* ==================== SCREEN: ADD GRADE / EVALUATION ==================== */}
        {currentScreen === 'add-grade' && (
          <div className="flex flex-col flex-1 pb-32 animate-fade-in">
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setCurrentScreen('main')} 
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-700 active:scale-95 transition-all"
                  type="button"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-base font-bold text-slate-900">Nouvelle Évaluation</h1>
                  <p className="text-[11px] text-slate-400 font-medium">Simulation de moyenne en temps réel</p>
                </div>
              </div>
              <HelpCircle className="w-5 h-5 text-slate-400" />
            </header>

            <main className="px-4 pt-4 space-y-6 flex-1">
              {/* Dynamic Simulated Impact Banner */}
              <div className="bg-gradient-to-r from-blue-50 to-amber-50 border border-blue-100 rounded-xl p-4 flex justify-between items-center shadow-sm">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SIMULATION DE MOYENNE</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-slate-900">
                      {Math.max(0, Math.min(20, overallAverage + (formGrade - overallAverage) * 0.08)).toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">/ 20</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200/50">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {formGrade >= overallAverage ? '+' : ''}
                    {((formGrade - overallAverage) * 0.08).toFixed(2)} pt sur la moyenne
                  </span>
                </div>
              </div>

              <form onSubmit={handleAddEvaluation} className="space-y-5">
                {/* Subject picker carousel */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Sélectionne la matière</label>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 pt-1">
                    {subjects.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setFormSubjectId(s.id)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full border text-xs font-bold transition-all flex items-center gap-1.5 ${
                          formSubjectId === s.id
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">{s.icon}</span>
                        <span>{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Grade Input Area */}
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center space-y-4 shadow-inner">
                  <div className="text-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Note sur 20</span>
                    <div className="flex items-baseline justify-center gap-1 mt-1">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.25"
                        value={formGrade}
                        onChange={(e) => setFormGrade(Math.min(20, Math.max(0, parseFloat(e.target.value) || 0)))}
                        className="w-24 text-center text-4xl font-extrabold text-slate-900 border-b-2 border-blue-600 bg-transparent focus:outline-none focus:ring-0 p-0"
                      />
                      <span className="text-xl font-bold text-slate-400">/ 20</span>
                    </div>
                  </div>

                  {/* Range Slider for rapid selection */}
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="0.25"
                    value={formGrade}
                    onChange={(e) => setFormGrade(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />

                  {/* Helper Quick buttons */}
                  <div className="flex justify-center gap-2">
                    {[-1, -0.25, 0.25, 1].map((delta, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormGrade(Math.min(20, Math.max(0, formGrade + delta)))}
                        className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-lg active:scale-95 transition-all shadow-sm"
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Eval Type grid */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Type d'évaluation</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['DS', 'Contrôle Continu', 'IE', 'Examen Blanc'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormEvalType(type)}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
                          formEvalType === type
                            ? 'border-blue-600 bg-blue-50/20 text-blue-700 shadow-sm'
                            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <span>{type}</span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          formEvalType === type ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {formEvalType === type && <Check className="w-2.5 h-2.5" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Coefficient and Period Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Coefficient de l'évaluation</label>
                    <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
                      {[1, 2, 3, 4].map(coeff => (
                        <button
                          key={coeff}
                          type="button"
                          onClick={() => setFormCoeff(coeff)}
                          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
                            formCoeff === coeff
                              ? 'bg-white text-blue-600 shadow-sm'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {coeff}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Période scolaire</label>
                    <select
                      value={formPeriod}
                      onChange={(e) => setFormPeriod(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                    >
                      <option>1er Trimestre</option>
                      <option>2ème Trimestre</option>
                      <option>3ème Trimestre</option>
                    </select>
                  </div>
                </div>

                {/* Date and Comment */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Date de l'épreuve</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Observation ou remarque <span className="text-slate-400 font-normal">(Facultatif)</span></label>
                  <textarea
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="ex. Analyse de fonction exponentielle, à retravailler..."
                    rows={2}
                    className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full h-12 bg-blue-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md hover:bg-blue-700 transition-all active:scale-[0.98] pt-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Enregistrer la note</span>
                </button>
              </form>
            </main>
          </div>
        )}

        {/* ==================== SCREEN: ADD HOMEWORK ==================== */}
        {currentScreen === 'add-homework' && (
          <div className="flex flex-col flex-1 pb-32 animate-fade-in">
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setCurrentScreen('main')} 
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-700 active:scale-95 transition-all"
                  type="button"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block leading-none">Agenda</span>
                  <h1 className="text-base font-bold text-slate-900 mt-0.5">Nouveau Devoir</h1>
                </div>
              </div>
              <button className="text-blue-600 font-bold text-xs" type="button">Brouillon</button>
            </header>

            <main className="px-4 pt-4 space-y-6 flex-1">
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/50 via-white to-amber-50/50 border border-slate-100 flex items-start gap-3 shadow-sm">
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-slate-800 leading-none block">Optimisation intelligente</span>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">Planifie ton temps de travail estimé pour recevoir des alertes de révision progressives.</p>
                </div>
              </div>

              <form onSubmit={handleAddHomework} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Intitulé du devoir ou projet <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={hwTitle}
                    onChange={(e) => setHwTitle(e.target.value)}
                    placeholder="ex. DM n°4 : Probabilités et suites"
                    className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none"
                  />
                </div>

                {/* Subject radio chips */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Matière concernée</label>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {subjects.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setHwSubjectId(s.id)}
                        className={`flex-shrink-0 px-4 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                          hwSubjectId === s.id
                            ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">{s.icon}</span>
                        <span>{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date & Time Row */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">À rendre pour quand ?</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={hwDueDate}
                      onChange={(e) => setHwDueDate(e.target.value)}
                      className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                    />
                    <input
                      type="time"
                      value={hwDueTime}
                      onChange={(e) => setHwDueTime(e.target.value)}
                      className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                    />
                  </div>
                </div>

                {/* Urgency selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Niveau d'urgence</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as const).map(prio => (
                      <button
                        key={prio}
                        type="button"
                        onClick={() => setHwPriority(prio)}
                        className={`py-2.5 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition-all ${
                          hwPriority === prio
                            ? prio === 'high' 
                              ? 'border-red-600 bg-red-50 text-red-900' 
                              : prio === 'medium' 
                                ? 'border-blue-600 bg-blue-50 text-blue-950'
                                : 'border-slate-600 bg-slate-50 text-slate-900'
                            : 'border-slate-200 bg-white text-slate-500'
                        }`}
                      >
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          prio === 'high' ? 'bg-red-500' : prio === 'medium' ? 'bg-blue-600' : 'bg-slate-400'
                        }`} />
                        <span className="text-[11px] font-bold capitalize">
                          {prio === 'high' ? 'Urgente' : prio === 'medium' ? 'Moyenne' : 'Basse'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estimated Duration */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Temps de travail estimé</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['15 min', '30 min', '1h00', '2h+'].map(dur => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setHwDuration(dur)}
                        className={`py-2 rounded-xl border text-xs font-bold text-center transition-all ${
                          hwDuration === dur
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Consignes / Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Instructions &amp; Détails</label>
                  <textarea
                    value={hwDescription}
                    onChange={(e) => setHwDescription(e.target.value)}
                    placeholder="ex. Exercice 1 complet, à rédiger proprement sur copie double..."
                    rows={3}
                    className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none resize-none"
                  />
                </div>

                {/* Group members */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Partenaires de groupe <span className="text-slate-400 font-normal">(Séparés par des virgules)</span></label>
                  <input
                    type="text"
                    value={hwMembers}
                    onChange={(e) => setHwMembers(e.target.value)}
                    placeholder="ex. Lucas, Sarah"
                    className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full h-12 bg-blue-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md hover:bg-blue-700 transition-all active:scale-[0.98] pt-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Enregistrer le devoir</span>
                </button>
              </form>
            </main>
          </div>
        )}

        {/* ==================== SCREEN: ADD TRANSACTION ==================== */}
        {currentScreen === 'add-transaction' && (
          <div className="flex flex-col flex-1 pb-32 animate-fade-in">
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-100 shadow-sm">
              <button 
                onClick={() => setCurrentScreen('main')} 
                className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-700 active:scale-95 transition-all"
                type="button"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-base font-bold text-slate-900">Nouvelle Transaction</h1>
              <HelpCircle className="w-5 h-5 text-slate-400" />
            </header>

            <main className="px-4 pt-4 space-y-6 flex-1">
              {/* Income vs Expense Segmented */}
              <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setTxType('expense')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    txType === 'expense'
                      ? 'bg-white text-red-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
                  <span>Dépense</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('income')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    txType === 'income'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span>Entrée d'argent</span>
                </button>
              </div>

              {/* Amount block */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center shadow-inner">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Montant à comptabiliser</span>
                <div className="flex items-baseline justify-center gap-1 mt-1">
                  <input
                    type="number"
                    value={txAmount}
                    onChange={(e) => setTxAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-32 text-center text-3xl font-extrabold text-slate-900 border-none bg-transparent focus:ring-0 focus:outline-none p-0"
                  />
                  <span className="text-lg font-bold text-amber-600">FCFA</span>
                </div>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-5">
                {/* Categories */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Catégorie</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {['Transports / Bus', 'Nourriture / Cantine', 'Fournitures & Livres', 'Forfait Data', 'Logement', 'Argent de poche'].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setTxCategory(cat)}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
                          txCategory === cat
                            ? 'border-2 border-blue-600 bg-blue-50/20 text-blue-900 shadow-sm'
                            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <div className={`p-1.5 rounded-full ${
                          txCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {getCategoryIcon(cat)}
                        </div>
                        <span className="text-[10px] font-bold leading-tight">{cat}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recurrence toggle */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-slate-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 leading-none block">Transaction récurrente</span>
                      <p className="text-[10px] text-slate-400 mt-1">S'applique automatiquement chaque mois</p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={txIsRecurring} 
                      onChange={(e) => setTxIsRecurring(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Optional description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Description / Note <span className="text-slate-400 font-normal">(Facultatif)</span></label>
                  <input
                    type="text"
                    value={txDesc}
                    onChange={(e) => setTxDesc(e.target.value)}
                    placeholder="ex. Photocopies cours de physique"
                    className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none"
                  />
                </div>

                {/* Payment Methods */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Moyen de paiement</label>
                  <div className="flex flex-wrap gap-2">
                    {['Espèces', 'Wave', 'Orange Money', 'MTN Mobile Money', 'Moov'].map(method => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setTxMethod(method)}
                        className={`px-3.5 py-2 rounded-full border text-xs font-bold transition-all ${
                          txMethod === method
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full h-12 bg-blue-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md hover:bg-blue-700 transition-all active:scale-[0.98] pt-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Enregistrer la transaction</span>
                </button>
              </form>
            </main>
          </div>
        )}

        {/* ==================== SCREEN: MAIN CONTAINER WITH NAVIGATION ==================== */}
        {currentScreen === 'main' && (
          <div className="flex flex-col flex-1 pb-24">
            
            {/* -------------------- MAIN DASHBOARD PAGE (ACCUEIL) -------------------- */}
            {activeTab === 'accueil' && (
              <div className="flex flex-col flex-1 animate-fade-in">
                {/* Header */}
                <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      onClick={() => setActiveTab('profile')} 
                      className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-sm border-2 border-blue-50 cursor-pointer shadow-sm relative shrink-0 overflow-hidden"
                    >
                      {profile.avatarUrl ? (
                        <img 
                          src={profile.avatarUrl} 
                          alt={profile.fullName} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        profile.fullName.split(' ').map(n => n[0]).join('')
                      )}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white"></span>
                    </div>
                    <div>
                      <h1 className="text-base font-bold text-slate-900 leading-tight tracking-tight">{profile.fullName}</h1>
                      <span className="text-[10px] text-slate-500 font-medium">{profile.className} • {profile.year}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 active:scale-95 transition-all relative">
                      <Bell className="w-4 h-4" />
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
                    </button>
                  </div>
                </header>

                <main className="px-4 pt-4 space-y-6 flex-1">
                  {/* Hero card: Current average */}
                  <section className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-amber-500"></div>
                    
                    <div className="flex justify-between items-start pt-1.5">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mb-1">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          <span>Trimestre en cours</span>
                        </div>
                        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Moyenne Générale</h2>
                      </div>

                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-bold text-blue-700 shadow-xs">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>+0.8 pt</span>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-1 mt-4">
                      <span className="text-5xl font-extrabold text-slate-900 tracking-tighter">
                        {overallAverage.toFixed(2)}
                      </span>
                      <span className="text-xl font-bold text-slate-400">/ 20</span>
                    </div>

                    {/* Progress tracking bar */}
                    <div className="mt-5 pt-3 border-t border-slate-100">
                      <div className="flex justify-between items-center text-xs text-slate-500 mb-1.5">
                        <span>Objectif Mention Bien ({profile.targetAverage.toFixed(1)})</span>
                        <span className="font-extrabold text-amber-700">
                          {(profile.targetAverage - overallAverage) > 0 
                            ? `-${(profile.targetAverage - overallAverage).toFixed(2)} pt` 
                            : 'Objectif Atteint !'}
                        </span>
                      </div>
                      
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                        <div className="bg-blue-600 h-full rounded-l-full" style={{ width: `${(overallAverage / 20) * 100}%` }}></div>
                        {(profile.targetAverage - overallAverage) > 0 && (
                          <div className="bg-amber-400 h-full" style={{ width: `${((profile.targetAverage - overallAverage) / 20) * 100}%` }}></div>
                        )}
                      </div>

                      <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        <span>0</span>
                        <span>Seuil admis: 10</span>
                        <span>20</span>
                      </div>
                    </div>
                  </section>

                  {/* IA Advice Custom Block */}
                  <section className="bg-gradient-to-br from-white via-white to-amber-50/40 rounded-2xl p-4 border-2 border-amber-300 shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
                        <Sparkles className="w-4 h-4 fill-amber-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-slate-900">Conseil IA personnalisé</h3>
                          <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">ACTIF</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 mt-2.5 leading-relaxed font-medium">
                      {aiAdvice}
                    </p>

                    <div className="mt-3 pt-2.5 flex items-center justify-between border-t border-slate-100">
                      <button 
                        onClick={() => setActiveTab('simulator')}
                        className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800"
                        type="button"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Lancer une simulation</span>
                      </button>
                      
                      <button 
                        onClick={() => setActiveTab('simulator')}
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                        type="button"
                      >
                        <span>Voir l'analyse</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </section>

                  {/* Devoirs à faire micro widgets */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-slate-700" />
                        <h3 className="text-sm font-bold text-slate-900">Devoirs prioritaires</h3>
                      </div>
                      <button 
                        onClick={() => setActiveTab('homeworks')} 
                        className="text-xs font-bold text-blue-600 hover:underline"
                        type="button"
                      >
                        Voir tout
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {homeworks.filter(h => !h.completed).slice(0, 2).map(hw => {
                        const subject = subjects.find(s => s.id === hw.subjectId);
                        return (
                          <div 
                            key={hw.id}
                            className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-start justify-between gap-3 active:scale-[0.99] transition-transform"
                          >
                            <div className="flex items-start gap-3 flex-1">
                              <input
                                type="checkbox"
                                checked={hw.completed}
                                onChange={() => toggleHomeworkCompleted(hw.id)}
                                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-0 mt-0.5 cursor-pointer"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="text-xs font-extrabold text-slate-900 truncate leading-tight">{hw.title}</h4>
                                  {hw.priority === 'high' && (
                                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[9px] uppercase tracking-wider">
                                      Urgent
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                                  <span className="font-semibold text-slate-700">{subject?.name || 'Matière'}</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1 text-red-600 font-bold">
                                    <Calendar className="w-3 h-3" />
                                    <span>{hw.dueDate}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => deleteHomework(hw.id)}
                              className="text-slate-400 hover:text-red-500 p-1 rounded-lg"
                              type="button"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Matières & Notes récentes scroll lists */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-slate-700" />
                        <h3 className="text-sm font-bold text-slate-900">Matières &amp; Notes récentes</h3>
                      </div>
                      <button 
                        onClick={() => setCurrentScreen('add-grade')}
                        className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"
                        type="button"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Ajouter une note</span>
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {evaluations.slice(0, 4).map(e => {
                        const subject = subjects.find(s => s.id === e.subjectId);
                        return (
                          <div 
                            key={e.id}
                            className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform"
                          >
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-blue-600 bg-blue-50 p-2 rounded-xl text-xl">
                                {subject?.icon || 'functions'}
                              </span>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h4 className="text-xs font-bold text-slate-950">{subject?.name || 'Matière'}</h4>
                                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-semibold">{e.type}</span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-0.5">{e.comment || 'Évaluation trimestrielle'}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <span className={`text-sm font-black ${
                                  e.grade >= 14 ? 'text-emerald-600' : e.grade < 10 ? 'text-red-600' : 'text-slate-800'
                                }`}>
                                  {e.grade.toFixed(1)}
                                </span>
                                <span className="text-[11px] text-slate-400 font-semibold">/20</span>
                              </div>

                              <button
                                onClick={() => deleteEvaluation(e.id)}
                                className="text-slate-300 hover:text-red-500 p-1"
                                type="button"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </main>

                {/* Floating Add grade button */}
                <div className="fixed bottom-20 right-4 z-40 max-w-[480px]">
                  <button 
                    onClick={() => setCurrentScreen('add-grade')}
                    className="flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-4 py-3 rounded-full shadow-xl active:scale-[0.96] transition-all duration-150 border border-slate-800"
                    type="button"
                  >
                    <Plus className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-bold pr-1">Ajouter une note</span>
                  </button>
                </div>
              </div>
            )}

            {/* -------------------- SIMULATOR PAGE -------------------- */}
            {activeTab === 'simulator' && (
              <div className="flex flex-col flex-1 animate-fade-in">
                <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div 
                      onClick={() => setIsSidebarOpen(true)}
                      className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-sm border-2 border-blue-50 cursor-pointer shadow-sm relative shrink-0 animate-fade-in"
                    >
                      {profile.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1">
                        <h1 className="text-base font-bold text-slate-900">Simulateur d'Objectifs</h1>
                        <span className="bg-amber-100 text-amber-800 font-bold text-[9px] px-1.5 py-0.5 rounded-full">IA</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">Calcule tes chances et gagne des points</p>
                    </div>
                  </div>
                  <HelpCircle className="w-5 h-5 text-slate-400" />
                </header>

                <main className="px-4 pt-4 space-y-6 flex-1">
                  {/* Target grade config */}
                  <section className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-100/40 rounded-full blur-xl pointer-events-none"></div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Objectif Trimestre 2</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-100">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Plan intelligent</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 items-end">
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">Moyenne Actuelle</span>
                        <div className="flex items-baseline space-x-0.5">
                          <span className="text-2xl font-black text-slate-900">{overallAverage.toFixed(2)}</span>
                          <span className="text-xs font-bold text-slate-400">/20</span>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50/20 border border-blue-100 rounded-xl relative">
                        <span className="text-[10px] font-bold text-blue-600 block mb-1">Objectif Ciblé</span>
                        <div className="flex items-baseline space-x-0.5">
                          <span className="text-2xl font-extrabold text-blue-700">{profile.targetAverage.toFixed(1)}</span>
                          <span className="text-xs font-bold text-blue-500">/20</span>
                        </div>
                        <span className="absolute top-2 right-2 text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                          +{(profile.targetAverage - overallAverage).toFixed(1)} pt
                        </span>
                      </div>
                    </div>

                    {/* Adjustable target slide */}
                    <div className="mt-5 space-y-2">
                      <div className="flex justify-between items-center text-[11px] text-slate-400">
                        <span>Seuil actuel ({overallAverage.toFixed(1)})</span>
                        <span>Objectif max (18.0)</span>
                      </div>
                      <input
                        type="range"
                        min="12.0"
                        max="18.0"
                        step="0.1"
                        value={profile.targetAverage}
                        onChange={(e) => setProfile({ ...profile, targetAverage: parseFloat(e.target.value) })}
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between items-center pt-1 text-xs text-slate-500">
                        <span>Effort requis estimé :</span>
                        <span className="font-bold text-slate-900">~3h30 / semaine ciblée</span>
                      </div>
                    </div>
                  </section>

                  {/* Recommendations */}
                  <section className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-900">Recommandations IA prioritaires</h3>
                    
                    <div className="space-y-3">
                      {/* Math recommendation */}
                      <article className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-amber-500 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                            Mathématiques (DS 3)
                          </span>
                          <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                            Priorité Absolue
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-800 leading-relaxed">
                          Actuellement <strong className="text-red-500">8.5/20</strong> ➔ Remonte à <strong className="text-blue-600">12/20</strong> au prochain DS pour faire grimper ta moyenne générale de <strong className="text-emerald-600 bg-emerald-50 px-1 rounded">+0.45 pt</strong>.
                        </p>
                      </article>

                      {/* General recommendation */}
                      <article className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-blue-600 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                            Physique-Chimie
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            Régularité
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-800 leading-relaxed">
                          Sécurise un <strong className="text-blue-600">14/20</strong> au TP de laboratoire de la semaine prochaine pour stabiliser tes coefficients scientifiques.
                        </p>
                      </article>
                    </div>
                  </section>

                  {/* Quick sand-box calculator */}
                  <section className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-blue-600" />
                      <h3 className="text-sm font-bold text-slate-900">Simulateur instantané "Et si..."</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Matière</label>
                        <select 
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-bold text-slate-700"
                          value={formSubjectId}
                          onChange={(e) => setFormSubjectId(e.target.value)}
                        >
                          {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Note Envisagée</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.5"
                            value={formGrade}
                            onChange={(e) => setFormGrade(parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-extrabold text-slate-800 pr-8"
                          />
                          <span className="absolute right-2.5 top-2.5 text-xs font-bold text-slate-400">/20</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3 flex justify-between items-center border border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
                          <Sparkles className="w-4 h-4 fill-amber-600" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold block leading-none">Nouvelle moyenne simulée</span>
                          <span className="text-xs font-bold text-slate-900">
                            {Math.max(0, Math.min(20, overallAverage + (formGrade - overallAverage) * 0.08)).toFixed(2)} / 20
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                        +0.35 pt
                      </span>
                    </div>
                  </section>
                </main>
              </div>
            )}

            {/* -------------------- DEVOIRS / AGENDA PAGE (HOMEWORKS) -------------------- */}
            {activeTab === 'homeworks' && (
              <div className="flex flex-col flex-1 animate-fade-in">
                <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div 
                      onClick={() => setIsSidebarOpen(true)}
                      className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-sm border-2 border-blue-50 cursor-pointer shadow-sm relative shrink-0 animate-fade-in"
                    >
                      {profile.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h1 className="text-base font-bold text-slate-900">Travail &amp; Devoirs</h1>
                      <p className="text-[11px] text-slate-500 font-medium">{profile.className} • Agenda</p>
                    </div>
                  </div>
                  <button className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all">
                    <Bell className="w-4 h-4" />
                  </button>
                </header>

                <main className="px-4 pt-4 space-y-6 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-red-600 font-bold">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Urgences &amp; Devoirs à rendre</span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{homeworks.filter(h => !h.completed).length} en cours</span>
                  </div>

                  <div className="space-y-3.5">
                    {homeworks.map(hw => {
                      const subject = subjects.find(s => s.id === hw.subjectId);
                      return (
                        <div 
                          key={hw.id}
                          className={`bg-white border rounded-xl p-4 shadow-sm flex flex-col gap-3 transition-all ${
                            hw.completed ? 'opacity-60 border-slate-100 bg-slate-50/50' : 'border-slate-200 hover:border-blue-500'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                              <input
                                type="checkbox"
                                checked={hw.completed}
                                onChange={() => toggleHomeworkCompleted(hw.id)}
                                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-0 mt-0.5 cursor-pointer"
                              />
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="bg-slate-100 text-slate-700 font-extrabold text-[10px] px-2 py-0.5 rounded">
                                    {subject?.name || 'Matière'}
                                  </span>
                                  {hw.priority === 'high' && (
                                    <span className="bg-amber-100 text-amber-800 font-bold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                      <Flame className="w-2.5 h-2.5 fill-amber-600" />
                                      Prioritaire
                                    </span>
                                  )}
                                </div>
                                <h4 className={`text-sm font-extrabold text-slate-900 mt-1.5 leading-tight ${hw.completed ? 'line-through' : ''}`}>
                                  {hw.title}
                                </h4>
                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  <span>À rendre le {hw.dueDate} à {hw.dueTime}</span>
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => deleteHomework(hw.id)}
                              className="text-slate-300 hover:text-red-500 p-1"
                              type="button"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>

                          {hw.description && (
                            <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2.5">
                              {hw.description}
                            </p>
                          )}

                          {/* Progress bar mock */}
                          {hw.progress && (
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                                <span>Avancement</span>
                                <span>{hw.progress}%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${hw.progress}%` }}></div>
                              </div>
                            </div>
                          )}

                          {hw.groupMembers && hw.groupMembers.length > 0 && (
                            <div className="flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-50 pt-2 font-medium">
                              <span className="flex items-center gap-1 text-blue-600 font-bold">
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Avec {hw.groupMembers.join(' & ')}</span>
                              </span>
                              <span className="text-blue-600 font-bold hover:underline cursor-pointer">Consignes</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </main>

                {/* Floating Add homework button */}
                <div className="fixed bottom-20 right-4 z-40 max-w-[480px]">
                  <button 
                    onClick={() => setCurrentScreen('add-homework')}
                    className="flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-4 py-3 rounded-full shadow-xl active:scale-[0.96] transition-all duration-150 border border-slate-800"
                    type="button"
                  >
                    <Plus className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-bold pr-1">Créer un devoir</span>
                  </button>
                </div>
              </div>
            )}

            {/* -------------------- BUDGET MANAGEMENT PAGE (BUDGET) -------------------- */}
            {activeTab === 'budget' && (
              <div className="flex flex-col flex-1 animate-fade-in">
                <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div 
                      onClick={() => setIsSidebarOpen(true)}
                      className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-sm border-2 border-blue-50 cursor-pointer shadow-sm relative shrink-0 animate-fade-in"
                    >
                      {profile.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold block">Gestion Financière</span>
                      <h1 className="text-base font-bold text-slate-900 leading-tight">Mon Budget Étudiant</h1>
                    </div>
                  </div>
                  <button className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all">
                    <Bell className="w-4 h-4" />
                  </button>
                </header>

                <main className="px-4 pt-4 space-y-6 flex-1">
                  {/* Ledger Available balance */}
                  <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                        <Bus className="w-4 h-4 text-blue-600" />
                        <span>Solde disponible</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-50 font-bold text-xs text-slate-700">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        <span>Octobre 2024</span>
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        {budgetSummary.balance.toLocaleString()} <span className="text-lg font-bold text-blue-600">FCFA</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Mis à jour aujourd'hui à 08:30</p>
                    </div>

                    {/* Metrics grid */}
                    <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                      <div className="bg-slate-50 rounded-xl p-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Entrées du mois</span>
                        <div className="text-sm font-extrabold text-slate-900 mt-1">
                          +{budgetSummary.incomes.toLocaleString()} FCFA
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dépenses du mois</span>
                        <div className="text-sm font-extrabold text-red-600 mt-1">
                          -{budgetSummary.expenses.toLocaleString()} FCFA
                        </div>
                      </div>
                    </div>

                    <div className="mt-3.5 bg-amber-50/40 rounded-xl border border-amber-200/40 px-3 py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                          <TrendingUp className="w-3.5 h-3.5 text-amber-800" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold leading-none">Prévision fin de mois</span>
                          <span className="text-xs font-bold text-slate-900">+{Math.max(0, budgetSummary.balance).toLocaleString()} FCFA</span>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-100 text-[10px] font-bold text-amber-800">
                        Sécurisé
                      </span>
                    </div>
                  </section>

                  {/* Add Transaction triggering */}
                  <button
                    onClick={() => setCurrentScreen('add-transaction')}
                    className="w-full h-12 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-[0.98] shadow-sm pt-2"
                    type="button"
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span>Nouvelle transaction</span>
                  </button>

                  {/* Transactions listings */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">Transactions récentes</h3>
                      <button className="text-xs font-bold text-blue-600 hover:underline" type="button">Tout voir</button>
                    </div>

                    <div className="space-y-2.5">
                      {transactions.map(t => (
                        <div 
                          key={t.id}
                          className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between transition-all hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                              {getCategoryIcon(t.category)}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-900 block leading-tight">{t.category}</span>
                              <span className="text-[10px] text-slate-400 mt-0.5 block">{t.description || 'Achat / Dépense'}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className={`text-xs font-black block ${t.type === 'expense' ? 'text-red-600' : 'text-emerald-600'}`}>
                                {t.type === 'expense' ? '-' : '+'}{t.amount.toLocaleString()} FCFA
                              </span>
                              <span className="text-[9px] text-slate-400 font-semibold">{t.date}</span>
                            </div>

                            <button
                              onClick={() => deleteTransaction(t.id)}
                              className="text-slate-300 hover:text-red-500 p-1"
                              type="button"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </main>
              </div>
            )}

            {/* ==================== SCREEN: PROFILE ==================== */}
            {activeTab === 'profile' && (
              <div className="flex flex-col flex-1 pb-32 animate-fade-in bg-slate-50">
                <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-100 shadow-sm shrink-0">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <div>
                      <h1 className="text-base font-bold text-slate-900">Mon Profil</h1>
                      <p className="text-[10px] text-slate-400 font-medium">Gérez votre identité et vos choix scolaires</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-bold">ACTIF</span>
                </header>

                <main className="px-4 py-4 space-y-5 flex-1">
                  {/* SUCCESS BANNER */}
                  {profileSuccessMessage && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold animate-bounce flex items-center gap-2 shadow-xs">
                      <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                      <span>{profileSuccessMessage}</span>
                    </div>
                  )}

                  {/* PROFILE EDIT FORM */}
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    {/* AVATAR SELECTOR */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
                      <label className="block text-xs font-bold text-slate-700">Photo de profil</label>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full ring-4 ring-blue-50 bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                          {profAvatarUrl ? (
                            <img src={profAvatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <User className="w-8 h-8 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <button
                            type="button"
                            onClick={() => setIsPhotoEditOpen(!isPhotoEditOpen)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all active:scale-95 border border-slate-200 flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                            <span>{isPhotoEditOpen ? 'Fermer la sélection' : 'Changer la photo'}</span>
                          </button>
                          <p className="text-[10px] text-slate-400 font-medium">Sélectionnez l'une de nos illustrations ou collez un lien dynamique.</p>
                        </div>
                      </div>

                      {/* Photo choices overlay drawer or block */}
                      {isPhotoEditOpen && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-fade-in">
                          <span className="text-[10px] text-slate-500 font-bold block">🎨 Cliquez pour choisir un avatar étudiant :</span>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { id: 'girl1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' },
                              { id: 'boy1', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200' },
                              { id: 'boy2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
                              { id: 'girl2', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
                              { id: 'girl3', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200' },
                              { id: 'boy3', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' },
                              { id: 'emoji1', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=school' },
                              { id: 'emoji2', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=genius' }
                            ].map(img => (
                              <button
                                key={img.id}
                                type="button"
                                onClick={() => {
                                  setProfAvatarUrl(img.url);
                                }}
                                className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all active:scale-90 cursor-pointer ${
                                  profAvatarUrl === img.url ? 'border-blue-600 ring-2 ring-blue-100 scale-105 shadow-sm' : 'border-slate-200 hover:border-slate-400'
                                }`}
                              >
                                <img src={img.url} alt="Option Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </button>
                            ))}
                          </div>

                          <div className="space-y-1 pt-1 border-t border-slate-200/50">
                            <span className="text-[9px] text-slate-400 font-bold block">Ou collez un lien d'image personnalisé :</span>
                            <input
                              type="url"
                              placeholder="https://mon-site.com/photo.png"
                              value={profAvatarUrl}
                              onChange={(e) => setProfAvatarUrl(e.target.value)}
                              className="w-full px-2 py-1.5 text-[10px] font-semibold border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-blue-600 text-slate-800"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* PERSONAL INFORMATION */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3.5">
                      <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
                        <span className="material-symbols-outlined text-blue-600 text-base">person</span>
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Identité personnelle</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Prénom</label>
                          <input
                            type="text"
                            required
                            value={profFirstName}
                            onChange={(e) => setProfFirstName(e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:border-blue-600 focus:outline-none bg-slate-50/50 text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Nom de famille</label>
                          <input
                            type="text"
                            required
                            value={profLastName}
                            onChange={(e) => setProfLastName(e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:border-blue-600 focus:outline-none bg-slate-50/50 text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Téléphone</label>
                          <input
                            type="tel"
                            required
                            value={profPhone}
                            onChange={(e) => setProfPhone(e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:border-blue-600 focus:outline-none bg-slate-50/50 text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Code PIN (6 chiffres)</label>
                          <input
                            type="password"
                            maxLength={6}
                            required
                            value={profPinCode}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, '');
                              if (v.length <= 6) setProfPinCode(v);
                            }}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold tracking-widest focus:border-blue-600 focus:outline-none bg-slate-50/50 text-slate-800"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SCHOOL STATUS */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3.5">
                      <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
                        <span className="material-symbols-outlined text-blue-600 text-base">school</span>
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Scolarité &amp; Établissement</h3>
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Mon École / Établissement</label>
                        <input
                          type="text"
                          required
                          value={profSchool}
                          onChange={(e) => setProfSchool(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:border-blue-600 focus:outline-none bg-slate-50/50 text-slate-800"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Niveau d'études</label>
                          <select
                            value={profGradeLevel}
                            onChange={(e) => {
                              const nextLevel = e.target.value;
                              setProfGradeLevel(nextLevel);
                              // Auto-select first matching class of new level
                              if (nextLevel === 'college') setProfClass('3ème');
                              else if (nextLevel === 'lycee') setProfClass('Terminale S2');
                              else setProfClass('Licence 1');
                            }}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:border-blue-600 focus:outline-none bg-slate-50/50 text-slate-800 cursor-pointer"
                          >
                            <option value="college">Collège</option>
                            <option value="lycee">Lycée</option>
                            <option value="superieur">Supérieur</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Classe</label>
                          <select
                            value={profClass}
                            onChange={(e) => setProfClass(e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:border-blue-600 focus:outline-none bg-slate-50/50 text-slate-800 cursor-pointer"
                          >
                            {profGradeLevel === 'college' && (
                              <>
                                <option value="6ème">6ème</option>
                                <option value="5ème">5ème</option>
                                <option value="4ème">4ème</option>
                                <option value="3ème">3ème</option>
                              </>
                            )}
                            {profGradeLevel === 'lycee' && (
                              <>
                                <option value="Seconde L">Seconde L</option>
                                <option value="Seconde S">Seconde S</option>
                                <option value="Première L">Première L</option>
                                <option value="Première S">Première S</option>
                                <option value="Terminale L">Terminale L</option>
                                <option value="Terminale S1">Terminale S1</option>
                                <option value="Terminale S2">Terminale S2</option>
                              </>
                            )}
                            {profGradeLevel === 'superieur' && (
                              <>
                                <option value="Licence 1">Licence 1</option>
                                <option value="Licence 2">Licence 2</option>
                                <option value="Licence 3">Licence 3</option>
                                <option value="Master 1">Master 1</option>
                                <option value="Master 2">Master 2</option>
                                <option value="Doctorat">Doctorat</option>
                              </>
                            )}
                          </select>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">save</span>
                      <span>Sauvegarder mon profil</span>
                    </button>
                  </form>

                  {/* ADDITIONAL QUICK UTILITIES */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
                    <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <span className="material-symbols-outlined text-amber-500 text-base">settings</span>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Réglages académiques</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={() => {
                          setSubjectBackScreen('main');
                          setCurrentScreen('manage-subjects');
                        }}
                        className="p-3 bg-blue-50/40 hover:bg-blue-50 text-blue-900 border border-blue-100 rounded-xl flex items-center justify-between text-xs font-bold transition-all active:scale-[0.99] cursor-pointer group text-left"
                        type="button"
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-blue-600 text-lg">book</span>
                          <span>Configurer &amp; ajouter mes matières ({subjects.length})</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform animate-pulse" />
                      </button>

                      <button
                        onClick={() => {
                          localStorage.clear();
                          window.location.reload();
                        }}
                        className="p-3 bg-red-50/40 hover:bg-red-50 text-red-900 border border-red-100 rounded-xl flex items-center justify-between text-xs font-bold transition-all active:scale-[0.99] cursor-pointer text-left"
                        type="button"
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-red-600 text-lg">restart_alt</span>
                          <span>Réinitialiser l'application (Effacer mes données)</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  <div className="py-6 text-center text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
                    <span>Mon Relevé Étudiant • Fait pour l'Afrique de l'Ouest 🌍</span>
                  </div>
                </main>
              </div>
            )}

            {/* Elegant sliding Profile sidebar drawer overlay */}
            {isSidebarOpen && (
              <div 
                onClick={() => setIsSidebarOpen(false)}
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs z-50 transition-all duration-300 animate-fade-in"
              />
            )}

            {/* Elegant sliding Profile sidebar drawer body */}
            <div className={`absolute top-0 bottom-0 left-0 w-[85%] max-w-[340px] bg-slate-50 z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out border-r border-slate-200 ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
              <header className="bg-white border-b border-slate-100 px-4 py-3 flex justify-between items-center shrink-0 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 font-bold">account_circle</span>
                  <h2 className="text-base font-bold text-slate-900">Mon Profil Étudiant</h2>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
                  type="button"
                >
                  <X className="w-5 h-5" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* West-African Student Identity card */}
                <section className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 w-20 h-20 bg-blue-50 rounded-full blur-xl pointer-events-none"></div>
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <img 
                        alt="Photo de profil étudiant" 
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-100 shadow-xs"
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300"
                      />
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h2 className="text-sm font-bold text-slate-900 leading-none truncate">{profile.fullName}</h2>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          {profile.className}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium truncate">{profile.email}</p>

                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
                        <div>
                          <span className="text-[9px] text-slate-400 font-semibold block leading-none">Moyenne</span>
                          <p className="text-xs font-black text-blue-600 mt-1">{overallAverage.toFixed(2)} <span className="text-[9px] text-slate-400 font-normal">/20</span></p>
                        </div>
                        
                        <div>
                          <span className="text-[9px] text-slate-400 font-semibold block leading-none">Objectif</span>
                          <p className="text-xs font-black text-slate-800 mt-1">{profile.targetAverage.toFixed(1)} <span className="text-[9px] text-slate-400 font-normal">/20</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* PREMIUM OFFER - 500 FCFA/mois */}
                <section className="bg-gradient-to-br from-slate-950 to-slate-850 rounded-xl p-4 text-white shadow-md relative overflow-hidden border border-slate-800">
                  <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>
                  
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-amber-400 text-[9px] font-bold border border-white/10">
                      Version Gratuite
                    </span>
                    <span className="text-[8px] bg-white/10 text-slate-300 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">PRO</span>
                  </div>

                  <div className="mt-2.5">
                    <h3 className="text-xs font-bold text-white">Débloquez l'IA de Révision</h3>
                    <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
                      Profitez de fiches de révisions illimitées et de prédictions de notes.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-2">
                    <button className="w-full py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-[10px] rounded-lg shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer" type="button">
                      <Sparkles className="w-3 h-3 fill-slate-950 shrink-0" />
                      <span>Devenir Pro (500 FCFA/mois)</span>
                    </button>

                    <div className="flex items-center justify-center gap-1.5 text-[8px] text-slate-400 font-semibold uppercase tracking-wider">
                      <span>Paiements : Orange, Wave, Moov</span>
                    </div>
                  </div>
                </section>

                {/* Scolarité & Études details */}
                <section className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-500">Scolarité &amp; Études</h3>

                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="py-2 flex justify-between items-center">
                      <span className="text-slate-500">Niveau de Classe</span>
                      <span className="font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">{profile.className}</span>
                    </div>

                    <div className="py-2 flex justify-between items-center">
                      <span className="text-slate-500">Matières suivies</span>
                      <span className="font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">{subjects.length} actives</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button 
                      onClick={() => {
                        setIsSidebarOpen(false);
                        setCurrentScreen('onboarding');
                      }}
                      className="py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px] rounded-lg flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-xs">edit</span>
                      <span>Modifier classe</span>
                    </button>

                    <button 
                      onClick={() => {
                        setIsSidebarOpen(false);
                        setSubjectBackScreen('main');
                        setCurrentScreen('manage-subjects');
                      }}
                      className="py-2 bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-700 font-bold text-[10px] rounded-lg flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-xs">settings_applications</span>
                      <span>Matières</span>
                    </button>
                  </div>
                </section>

                {/* Security options */}
                <section className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Compte &amp; Paramètres</h3>
                  
                  <div className="space-y-1.5">
                    <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-all border border-slate-100 cursor-pointer" type="button">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-bold text-slate-800">Changer de code PIN</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    <button 
                      onClick={() => {
                        setIsSidebarOpen(false);
                        localStorage.clear();
                        window.location.reload();
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-lg bg-red-50 hover:bg-red-100/50 transition-all border border-red-100/50 text-red-700 cursor-pointer" 
                      type="button"
                    >
                      <div className="flex items-center gap-2">
                        <LogOut className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">Réinitialiser l'appli</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </section>
              </div>

              <div className="p-3 bg-white border-t border-slate-100 text-center text-[9px] text-slate-400 shrink-0">
                <p>Version 2.5.0 • Fait pour l'Afrique de l'Ouest 🌍</p>
              </div>
            </div>

            {/* Persistent elegant student bottom navigation bar */}
            <nav className="fixed bottom-0 left-0 right-0 w-full max-w-[480px] mx-auto z-50 flex justify-around items-center px-4 pt-2.5 pb-6 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-8px_20px_rgba(15,23,42,0.04)]">
              {/* Slot 1: Accueil */}
              <button 
                onClick={() => { setActiveTab('accueil'); }} 
                className={`flex flex-col items-center justify-center py-1 transition-all ${
                  activeTab === 'accueil' ? 'text-blue-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'
                }`}
                type="button"
              >
                <Home className="w-5 h-5" />
                <span className="text-[10px] mt-1 font-bold">Accueil</span>
                {activeTab === 'accueil' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-0.5"></span>}
              </button>

              {/* Slot 2: Simulateur */}
              <button 
                onClick={() => { setActiveTab('simulator'); }} 
                className={`flex flex-col items-center justify-center py-1 transition-all ${
                  activeTab === 'simulator' ? 'text-blue-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'
                }`}
                type="button"
              >
                <Sparkles className="w-5 h-5" />
                <span className="text-[10px] mt-1 font-bold">Simulateur</span>
                {activeTab === 'simulator' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-0.5"></span>}
              </button>

              {/* Slot 3: Devoirs & IA */}
              <button 
                onClick={() => { setActiveTab('homeworks'); }} 
                className={`flex flex-col items-center justify-center py-1 transition-all ${
                  activeTab === 'homeworks' ? 'text-blue-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'
                }`}
                type="button"
              >
                <GraduationCap className="w-5 h-5" />
                <span className="text-[10px] mt-1 font-bold">Travail</span>
                {activeTab === 'homeworks' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-0.5"></span>}
              </button>

              {/* Slot 4: Budget */}
              <button 
                onClick={() => { setActiveTab('budget'); }} 
                className={`flex flex-col items-center justify-center py-1 transition-all ${
                  activeTab === 'budget' ? 'text-blue-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'
                }`}
                type="button"
              >
                <Bus className="w-5 h-5" />
                <span className="text-[10px] mt-1 font-bold">Budget</span>
                {activeTab === 'budget' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-0.5"></span>}
              </button>

              {/* Slot 5: Profil */}
              <button 
                onClick={() => { setActiveTab('profile'); }} 
                className={`flex flex-col items-center justify-center py-1 transition-all ${
                  activeTab === 'profile' ? 'text-blue-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'
                }`}
                type="button"
              >
                <User className="w-5 h-5" />
                <span className="text-[10px] mt-1 font-bold">Profil</span>
                {activeTab === 'profile' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-0.5"></span>}
              </button>
            </nav>

          </div>
        )}

      </div>
    </div>
  );
}
