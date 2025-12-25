import type { ScheduleEvent, DeepWorkSession, FitnessLog, SleepLog } from './types';

export const scheduleEvents: ScheduleEvent[] = [
  { id: '1', title: 'Deep Work: Linear Algebra', startTime: '09:00', endTime: '11:00', domain: 'Deep Work', completed: true },
  { id: '2', title: 'Fitness: Push Day', startTime: '12:00', endTime: '13:00', domain: 'Fitness', completed: true },
  { id: '3', title: 'Vocal Practice', startTime: '14:00', endTime: '14:30', domain: 'Vocal', completed: false },
  { id: '4', title: 'Project: Life Engine', startTime: '15:00', endTime: '17:00', domain: 'Projects', completed: false },
  { id: '5', title: 'Sleep', startTime: '22:00', endTime: '06:00', domain: 'Sleep', completed: false },
];

export const deepWorkSessions: DeepWorkSession[] = [
  { id: '1', date: '2024-07-21', topic: 'Eigenvalues', duration: 120, confidence: 7, blockages: 'Struggled with complex number applications.' },
  { id: '2', date: '2024-07-20', topic: 'Vector Spaces', duration: 90, confidence: 9, blockages: '' },
  { id: '3', date: '2024-07-19', topic: 'Matrix Transformations', duration: 110, confidence: 8, blockages: 'Visualizing shears was tricky.' },
];

export const fitnessLogs: FitnessLog[] = [
    { id: '1', date: '2024-07-21', exercise: 'Bench Press', sets: 3, reps: 8, weight: 80, rpe: 8 },
    { id: '2', date: '2024-07-21', exercise: 'Overhead Press', sets: 3, reps: 10, weight: 50, rpe: 7 },
    { id: '3', date: '2024-07-19', exercise: 'Squat', sets: 4, reps: 5, weight: 120, rpe: 9 },
];

export const sleepLogs: SleepLog[] = [
    { id: '1', date: '2024-07-20', plannedBedtime: '22:00', actualBedtime: '22:45', quality: 6, obstacles: ['Stress', 'Caffeine'] },
    { id: '2', date: '2024-07-19', plannedBedtime: '22:00', actualBedtime: '22:10', quality: 8, obstacles: [] },
];
