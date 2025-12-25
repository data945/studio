'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, CheckCircle2, Circle } from "lucide-react";
import { projects } from "@/lib/data";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const statusColors = {
    'On Track': 'bg-green-500',
    'At Risk': 'bg-yellow-500',
    'Completed': 'bg-blue-500',
}

export default function ProjectsPage() {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Projects</h1>
                    <p className="text-muted-foreground">Track your personal and professional projects.</p>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Project
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {projects.map((project) => (
                    <Card key={project.id}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>{project.name}</CardTitle>
                                <Badge variant={project.status === 'Completed' ? 'default' : 'outline'}>
                                    <span className={`mr-2 h-2 w-2 rounded-full ${statusColors[project.status]}`}></span>
                                    {project.status}
                                </Badge>
                            </div>
                            <CardDescription>{project.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium">Progress</span>
                                    <span className="text-sm text-muted-foreground">{project.progress}%</span>
                                </div>
                                <Progress value={project.progress} className="h-2"/>
                            </div>
                            
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="tasks">
                                    <AccordionTrigger className="text-sm font-medium">
                                        Tasks ({project.tasks.filter(t => t.completed).length}/{project.tasks.length})
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-2 pt-2">
                                            {project.tasks.map(task => (
                                                <div key={task.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
                                                    {task.completed ? <CheckCircle2 className="h-5 w-5 text-primary shrink-0" /> : <Circle className="h-5 w-5 text-muted-foreground shrink-0" />}
                                                    <span className={`flex-grow text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
