import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

export default function SchedulePage() {
  return (
    <div className="flex flex-col gap-8 h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Scheduler</h1>
          <p className="text-muted-foreground">Visual timeline of your time blocks.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline">This Week</Button>
            <Button variant="outline" size="icon"><ChevronRight className="h-4 w-4" /></Button>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4"/>
                New Block
            </Button>
        </div>
      </div>

      <Card className="flex-grow">
        <CardContent className="p-2 h-full overflow-auto">
            <div className="grid grid-cols-[auto_repeat(7,minmax(120px,1fr))]">
                {/* Time Gutter */}
                <div className="sticky left-0 bg-background z-20">
                  <div className="h-10"></div>
                  {hours.map(hour => (
                    <div key={hour} className="h-14 text-right text-xs text-muted-foreground pr-2 -mt-2">{hour}</div>
                  ))}
                </div>

                {/* Main grid */}
                <div className="col-start-2 col-span-7 grid grid-cols-7 grid-rows-[auto_repeat(24,56px)] relative">
                  {/* Day headers */}
                  {days.map(day => (
                      <div key={day} className="p-2 text-center font-medium border-b h-10 sticky top-0 bg-background z-10">{day}</div>
                  ))}
                  
                  {/* Grid lines */}
                  {Array.from({length: 24 * 7}).map((_, i) => (
                    <div key={i} className="border-b border-r"></div>
                  ))}

                  {/* Example Events */}
                  <div className="absolute col-start-1 row-start-[10] row-span-2 w-full pr-1">
                    <div className="bg-primary/80 border-l-4 border-primary h-full p-2 rounded-r-lg shadow-md text-primary-foreground">
                        <p className="font-bold text-sm">Deep Work</p>
                        <p className="text-xs opacity-80">Linear Algebra</p>
                    </div>
                  </div>
                  <div className="absolute col-start-1 row-start-[13] row-span-1 w-full pr-1">
                    <div className="bg-accent/80 border-l-4 border-accent h-full p-2 rounded-r-lg shadow-md text-accent-foreground">
                        <p className="font-bold text-sm">Fitness</p>
                        <p className="text-xs opacity-80">Push Day</p>
                    </div>
                  </div>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
