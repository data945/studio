'use client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { use, useEffect, useMemo, useState } from 'react';
import type { TimeBlock } from '@/lib/types';
import { format, subDays } from 'date-fns';


export default function TrendsChart() {
  const { firestore, user } = useFirebase();
  const [chartData, setChartData] = useState<{name: string, value: number}[]>([]);

  const last7Days = useMemo(() => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
        dates.push(subDays(new Date(), i));
    }
    return dates;
  }, []);

  const timeBlocksQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, `users/${user.uid}/timeBlocks`),
      where('startTime', '>=', Timestamp.fromDate(last7Days[0])),
      where('startTime', '<=', Timestamp.fromDate(last7Days[6]))
    );
  }, [firestore, user, last7Days]);

  const { data: timeBlocks, isLoading } = useCollection<TimeBlock>(timeBlocksQuery);

  useEffect(() => {
    if (timeBlocks) {
        const data = last7Days.map(date => {
            const day = format(date, 'E');
            const value = timeBlocks.filter(block => format(block.startTime.toDate(), 'E') === day && block.completed).length;
            return { name: day, value };
        });
        setChartData(data);
    }
  }, [timeBlocks, last7Days]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Trends</CardTitle>
        <CardDescription>A chart showing your progress over the last week.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
