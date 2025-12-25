
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, PlusCircle, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { addDays, startOfWeek, format, eachDayOfInterval, getDay, getHours, getMinutes, differenceInMinutes, isSameDay } from 'date-fns';
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, Timestamp } from 'firebase/firestore';
import type { TimeBlock } from "@/lib/types";
import { NewTimeBlockDialog } from "@/components/schedule/new-time-block-dialog";

const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

const domainColors: { [key: string]: string } = {
  'Deep Work': 'bg-blue-500/80 border-blue-400 text-white',
  'Fitness': 'bg-red-500/80 border-red-400 text-white',
  'Vocal': 'bg-purple-500/80 border-purple-400 text-white',
  'Projects': 'bg-yellow-500/80 border-yellow-400 text-black',
  'Sleep': 'bg-indigo-500/80 border-indigo-400 text-white',
  'Nutrition': 'bg-green-500/80 border-green-400 text-white',
  'Photography': 'bg-gray-500/80 border-gray-400 text-white',
  'YouTube': 'bg-pink-500/80 border-pink-400 text-white',
  'Expenses': 'bg-teal-500/80 border-teal-400 text-white',
  'Default': 'bg-gray-300/80 border-gray-200 text-black'
};

function TimeBlockEvent({ event }: { event: TimeBlock }) {
    const start = event.startTime.toDate();
    const end = event.endTime.toDate();

    const startHour = getHours(start);
    const startMinutes = getMinutes(start);
    const durationMinutes = differenceInMinutes(end, start);

    // Grid row starts at 1 for the first hour. Each hour is 56px tall.
    // The grid-rows are defined as `repeat(24, 56px)`.
    const top = (startHour + startMinutes / 60) * 56 + 40; // +40 for header height
    const height = (durationMinutes / 60) * 56;
    
    // getDay() is 0 for Sunday, 6 for Saturday. We want Monday (1) to be column 1.
    const dayIndex = getDay(start);
    const gridColumn = dayIndex === 0 ? 7 : dayIndex;

    const colorClasses = domainColors[event.domain] || domainColors['Default'];

    return (
        <div 
            className="absolute w-full pr-1"
            style={{ 
                gridColumn: `${gridColumn} / span 1`, 
                top: `${top}px`, 
                height: `${height}px`,
                // Left offset to position within the correct day column
                left: `${((gridColumn - 1) / 7) * 100}%`,
                width: `${100/7}%`,
             }}
        >
            <div className={`h-full p-2 rounded-lg shadow-md overflow-hidden ${colorClasses}`}>
                <p className="font-bold text-sm truncate">{event.description}</p>
                <p className="text-xs opacity-80">{event.domain}</p>
            </div>
        </div>
    );
}


export default function SchedulePage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isDialogOpen, setDialogOpen] = useState(false);
    const { firestore, user, isUserLoading } = useFirebase();

    const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
    const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);
    const weekDays = useMemo(() => eachDayOfInterval({ start: weekStart, end: weekEnd }), [weekStart, weekEnd]);

    const timeBlocksQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(
          collection(firestore, `users/${user.uid}/timeBlocks`),
          where('startTime', '>=', Timestamp.fromDate(weekStart)),
          where('startTime', '<=', Timestamp.fromDate(new Date(weekEnd.getTime() + 86400000))) // Add a day to include all of the last day
        );
    }, [firestore, user, weekStart, weekEnd]);

    const { data: timeBlocks, isLoading: timeBlocksLoading } = useCollection<TimeBlock>(timeBlocksQuery);
    
    const handleNextWeek = () => setCurrentDate(addDays(currentDate, 7));
    const handlePrevWeek = () => setCurrentDate(addDays(currentDate, -7));
    const handleThisWeek = () => setCurrentDate(new Date());

    const isLoading = isUserLoading || timeBlocksLoading;

    return (
        <div className="flex flex-col gap-8 h-[calc(100vh-8rem)]">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Scheduler</h1>
                    <p className="text-muted-foreground">Visual timeline of your time blocks from Firestore.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={handlePrevWeek}><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" onClick={handleThisWeek}>This Week</Button>
                    <Button variant="outline" size="icon" onClick={handleNextWeek}><ChevronRight className="h-4 w-4" /></Button>
                    <Button onClick={() => setDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        New Block
                    </Button>
                </div>
            </div>

            <NewTimeBlockDialog open={isDialogOpen} onOpenChange={setDialogOpen} />

            <Card className="flex-grow overflow-hidden">
                <CardContent className="p-0 h-full overflow-auto relative">
                    <div className="grid grid-cols-[auto_repeat(7,minmax(120px,1fr))] h-full">
                        {/* Time Gutter */}
                        <div className="sticky left-0 bg-background z-20 border-r">
                          <div className="h-10"></div>
                          {hours.map(hour => (
                            <div key={hour} className="h-14 text-right text-xs text-muted-foreground pr-2 -mt-2">{hour}</div>
                          ))}
                        </div>

                        {/* Day headers */}
                        {weekDays.map(day => (
                            <div key={day.toString()} className={`p-2 text-center font-medium border-b h-10 sticky top-0 bg-background z-10 ${isSameDay(day, new Date()) ? 'text-primary' : ''}`}>
                                <span>{format(day, 'EEE')}</span>
                                <p className="text-lg font-bold">{format(day, 'd')}</p>
                            </div>
                        ))}
                        
                        <div className="col-start-2 col-span-7 row-start-1 row-span-full relative">
                            {/* Grid lines */}
                            <div className="absolute inset-0 grid grid-cols-7 grid-rows-[repeat(24,56px)] -z-10 mt-10">
                                {Array.from({length: 24 * 7}).map((_, i) => (
                                    <div key={i} className="border-b border-r"></div>
                                ))}
                            </div>
                            
                            {isLoading && <Loader2 className="absolute top-1/2 left-1/2 h-8 w-8 animate-spin" />}

                            {/* Events */}
                            {!isLoading && timeBlocks?.map(event => (
                                <TimeBlockEvent key={event.id} event={event} />
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
