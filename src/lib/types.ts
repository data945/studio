export type ScheduleEvent = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  domain: string;
  completed: boolean;
};

export type DeepWorkSession = {
  id: string;
  date: string;
  topic: string;
  duration: number; // in minutes
  confidence: number; // 1-10
  blockages: string;
};

export type FitnessLog = {
    id: string;
    date: string;
    exercise: string;
    sets: number;
    reps: number;
    weight: number;
    rpe: number;
}

export type SleepLog = {
    id: string;
    date: string;
    plannedBedtime: string;
    actualBedtime: string;
    quality: number; // 1-10
    obstacles: string[];
}
