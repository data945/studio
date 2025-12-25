import type { ScheduleEvent, FitnessLog, SleepLog, Project as ProjectType } from './types';

// Note: This file now contains only static types. 
// The actual data is fetched from Firestore in the respective page components.

export const scheduleEvents: ScheduleEvent[] = [
  { id: '1', title: 'Deep Work: Linear Algebra', startTime: '09:00', endTime: '11:00', domain: 'Deep Work', completed: true },
  { id: '2', title: 'Fitness: Push Day', startTime: '12:00', endTime: '13:00', domain: 'Fitness', completed: true },
  { id: '3', title: 'Vocal Practice', startTime: '14:00', endTime: '14:30', domain: 'Vocal', completed: false },
  { id: '4', title: 'Project: Life Engine', startTime: '15:00', endTime: '17:00', domain: 'Projects', completed: false },
  { id: '5', title: 'Sleep', startTime: '22:00', endTime: '06:00', domain: 'Sleep', completed: false },
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

// This is now considered sample data and is not directly used by the projects page.
export const projects: ProjectType[] = [
    {
        id: '1',
        userId: 'sampleUser',
        name: 'Synergistic Life Engine',
        description: 'The very app you are using now. An AI-powered life optimization system.',
        status: 'On Track',
        progress: 60,
        createdAt: new Date(),
        tasks: [
            { id: 't1-1', title: 'Develop core data models', completed: true, createdAt: new Date() },
            { id: 't1-2', title: 'Implement dashboard UI', completed: true, createdAt: new Date() },
            { id: 't1-3', title: 'Integrate Genkit AI flows', completed: true, createdAt: new Date() },
            { id: 't1-4', title: 'Build out projects module', completed: false, createdAt: new Date() },
            { id: 't1-5', title: 'Flesh out all placeholder pages', completed: false, createdAt: new Date() },
        ]
    },
    {
        id: '2',
        userId: 'sampleUser',
        name: 'Learn Linear Algebra',
        description: 'Deep dive into linear algebra for better understanding of ML.',
        status: 'At Risk',
        progress: 25,
        createdAt: new Date(),
        tasks: [
            { id: 't2-1', title: 'Complete chapter on Vector Spaces', completed: true, createdAt: new Date() },
            { id: 't2-2', title: 'Study Eigenvalues and Eigenvectors', completed: false, createdAt: new Date() },
            { id: 't2-3', title: 'Practice with matrix transformations', completed: false, createdAt: new Date() },
        ]
    }
]
