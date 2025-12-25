'use client'
import { Activity, Dumbbell, Timer, BrainCircuit, CheckCircle, XCircle, Mic, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CrossDomainInsights from '@/components/dashboard/cross-domain-insights';
import { useState, useEffect } from 'react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import type { TimeBlock, DeepWorkSession, SleepLog } from '@/lib/types';
import { format } from 'date-fns';

const domainIcons: { [key: string]: React.ReactNode } = {
  'Deep Work': <BrainCircuit className="h-4 w-4 text-muted-foreground" />,
  'Fitness': <Dumbbell className="h-4 w-4 text-muted-foreground" />,
  'Vocal': <Mic className="h-4 w-4 text-muted-foreground" />,
  'Projects': <Activity className="h-4 w-4 text-muted-foreground" />,
  'Sleep': <Timer className="h-4 w-4 text-muted-foreground" />,
}

export default function DashboardPage() {
  const [greeting, setGreeting] = useState('');
  const { firestore, user, isUserLoading } = useFirebase();

  useEffect(() => {
    const today = new Date();
    const currentHour = today.getHours();
    if (currentHour < 12) {
      setGreeting('Good morning');
    } else if (currentHour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const timeBlocksQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, `users/${user.uid}/timeBlocks`),
      where('startTime', '>=', Timestamp.fromDate(todayStart)),
      where('startTime', '<=', Timestamp.fromDate(todayEnd))
    );
  }, [firestore, user, todayStart, todayEnd]);

  const deepWorkQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `users/${user.uid}/deepWorkSessions`);
  }, [firestore, user]);

  const sleepQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, `users/${user.uid}/sleepOptimizations`));
  }, [firestore, user]);
  
  const { data: timeBlocks, isLoading: timeBlocksLoading } = useCollection<TimeBlock>(timeBlocksQuery);
  const { data: deepWorkSessions, isLoading: deepWorkLoading } = useCollection<DeepWorkSession>(deepWorkQuery);
  const { data: sleepLogs, isLoading: sleepLoading } = useCollection<SleepLog>(sleepQuery);

  const isLoading = isUserLoading || timeBlocksLoading || deepWorkLoading || sleepLoading;

  const blocksCompleted = timeBlocks?.filter(b => b.completed).length || 0;
  const totalBlocks = timeBlocks?.length || 0;

  const avgFocusScore = deepWorkSessions && deepWorkSessions.length > 0 
    ? (deepWorkSessions.reduce((acc, s) => acc + s.confidenceScore, 0) / deepWorkSessions.length).toFixed(1)
    : 'N/A';

  const lastSleepQuality = sleepLogs && sleepLogs.length > 0
    ? sleepLogs.sort((a,b) => b.createdAt.toMillis() - a.createdAt.toMillis())[0].quality
    : 'N/A';
  
  const activeStreak = user?.metadata.creationTime 
    ? Math.floor((new Date().getTime() - new Date(user.metadata.creationTime).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">{greeting}, {user?.displayName || 'User'}.</h1>
        <p className="text-muted-foreground">Here's your synergistic overview for today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Blocks Completed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
              <>
                <div className="text-2xl font-bold">{blocksCompleted} / {totalBlocks}</div>
                <p className="text-xs text-muted-foreground">
                  Today's progress
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Focus Score
            </CardTitle>
            <BrainCircuit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
              <>
                <div className="text-2xl font-bold">{avgFocusScore} / 10</div>
                <p className="text-xs text-muted-foreground">
                  Avg. from deep work sessions
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sleep Quality
            </CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                <>
                  <div className="text-2xl font-bold">{lastSleepQuality} / 10</div>
                  <p className="text-xs text-muted-foreground">
                    Last night's rating
                  </p>
                </>
              )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Streak
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                <>
                  <div className="text-2xl font-bold">+{activeStreak}</div>
                  <p className="text-xs text-muted-foreground">
                    days since you joined
                  </p>
                </>
              )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>A summary of your time-blocked activities for today.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && <Loader2 className="h-8 w-8 animate-spin mx-auto my-8"/>}
            {!isLoading && (!timeBlocks || timeBlocks.length === 0) && (
              <div className="text-center py-12 text-muted-foreground">No time blocks scheduled for today.</div>
            )}
            {!isLoading && timeBlocks && timeBlocks.length > 0 && (
              <div className="space-y-4">
                {timeBlocks.sort((a,b) => a.startTime.toMillis() - b.startTime.toMillis()).map((event) => (
                  <div key={event.id} className="flex items-center p-2 rounded-lg hover:bg-muted/50">
                    {event.completed ? <CheckCircle className="h-5 w-5 text-green-500 mr-4 shrink-0" /> : <XCircle className="h-5 w-5 text-red-500 mr-4 shrink-0" />}
                    <div className="flex-grow">
                      <p className="font-medium">{event.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(event.startTime.toDate(), 'HH:mm')} - {format(event.endTime.toDate(), 'HH:mm')}
                      </p>
                    </div>
                    <div className="ml-4 shrink-0">
                      {domainIcons[event.domain] || <Activity className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle>Cross-Domain Insights</CardTitle>
            <CardDescription>AI-powered analysis of your life domains.</CardDescription>
          </CardHeader>
          <CardContent>
            <CrossDomainInsights />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
