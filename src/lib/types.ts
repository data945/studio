import type { Timestamp } from 'firebase/firestore';

export type ScheduleEvent = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  domain: string;
  completed: boolean;
};

export type DeepWorkSession = {
  id:string;
  userId: string;
  topic: string;
  duration: number; // in minutes
  confidence: number; // 1-10
  blockages: string;
  createdAt: Timestamp;
};

export type FitnessLog = {
    id: string;
    exercise: string;
    sets: number;
    reps: number;
    weight: number;
    rpe: number;
}

export type FitnessSession = {
    id: string;
    userId: string;
    name: string;
    logs: FitnessLog[];
    createdAt: Timestamp;
}

export type SleepLog = {
    id: string;
    userId: string;
    plannedBedtime: string;
    actualBedtime: string;
    quality: number; // 1-10
    obstacles: string[];
    createdAt: Timestamp;
}

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Timestamp;
};

export type Project = {
  id: string;
  userId: string;
  name: string;
  description: string;
  status: 'On Track' | 'At Risk' | 'Completed';
  progress: number; // percentage
  tasks?: Task[]; // This will be a subcollection, so it's optional on the main project object
  createdAt: Timestamp;
};

export type VocalPracticeSession = {
  id: string;
  userId: string;
  curriculum: string;
  subCurriculum: string;
  exercise: string;
  performanceScore: number;
  strugglePointTag: string;
  createdAt: Timestamp;
};

export type PhotographySession = {
  id: string;
  userId: string;
  shotCounter: number;
  qualityAssessment: number; // 1-5
  editingPipeline: 'Raw' | 'Basic Edit' | 'Advanced' | 'Published';
  skillGapAnalysis: string;
  createdAt: Timestamp;
};

export type YoutubeLectureProduction = {
  id: string;
  userId: string;
  timeBlockId: string;
  workflowStage: 'Learning' | 'Scripting' | 'Recording' | 'Audio Enhancement' | 'Visual Enhancement' | 'Publishing' | 'Analytics Review';
  syllabusAlignment: string;
  qualityFeedbackLoop: string;
  createdAt: Timestamp;
}
