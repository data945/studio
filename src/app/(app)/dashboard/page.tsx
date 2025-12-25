'use client'
import { Activity, Dumbbell, Timer, BrainCircuit, CheckCircle, XCircle, Mic } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { scheduleEvents } from '@/lib/data';
import CrossDomainInsights from '@/components/dashboard/cross-domain-insights';
import { useState, useEffect } from 'react';

const domainIcons: { [key: string]: React.ReactNode } = {
  'Deep Work': <BrainCircuit className="h-4 w-4 text-muted-foreground" />,
  'Fitness': <Dumbbell className="h-4 w-4 text-muted-foreground" />,
  'Vocal': <Mic className="h-4 w-4 text-muted-foreground" />,
  'Projects': <Activity className="h-4 w-4 text-muted-foreground" />,
  'Sleep': <Timer className="h-4 w-4 text-muted-foreground" />,
}

export default function DashboardPage() {
  const [greeting, setGreeting] = useState('');

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
  
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">{greeting}, User.</h1>
        <p className="text-muted-foreground">Here's your synergistic overview for today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Blocks Completed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 / 5</div>
            <p className="text-xs text-muted-foreground">
              +20% from yesterday
            </p>
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
            <div className="text-2xl font-bold">8.5 / 10</div>
            <p className="text-xs text-muted-foreground">
              Avg. from deep work sessions
            </p>
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
            <div className="text-2xl font-bold">7 / 10</div>
            <p className="text-xs text-muted-foreground">
              Last night's rating
            </p>
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
            <div className="text-2xl font-bold">+23</div>
            <p className="text-xs text-muted-foreground">
              days of consistent tracking
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>A summary of your time-blocked activities for today.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scheduleEvents.map((event) => (
                <div key={event.id} className="flex items-center p-2 rounded-lg hover:bg-muted/50">
                  {event.completed ? <CheckCircle className="h-5 w-5 text-green-500 mr-4 shrink-0" /> : <XCircle className="h-5 w-5 text-red-500 mr-4 shrink-0" />}
                  <div className="flex-grow">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.startTime} - {event.endTime}</p>
                  </div>
                  <div className="ml-4 shrink-0">
                    {domainIcons[event.domain]}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
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
