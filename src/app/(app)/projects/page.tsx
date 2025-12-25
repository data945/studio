'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Project, Task } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

const statusColors: Record<Project['status'], string> = {
    'On Track': 'bg-green-500',
    'At Risk': 'bg-yellow-500',
    'Completed': 'bg-blue-500',
}

function ProjectCard({ project }: { project: Project }) {
    const { firestore, user } = useFirebase();
    const { toast } = useToast();

    const tasksQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, `users/${user.uid}/projects/${project.id}/tasks`);
    }, [firestore, user, project.id]);

    const { data: tasks, isLoading: tasksLoading } = useCollection<Task>(tasksQuery);

    const completedTasks = tasks?.filter(t => t.completed).length || 0;
    const totalTasks = tasks?.length || 0;

    const handleToggleTask = (task: Task) => {
        if (!firestore || !user) return;
        const taskRef = collection(firestore, `users/${user.uid}/projects/${project.id}/tasks`);
        const docRef = taskRef.doc(task.id);
        
        updateDocumentNonBlocking(docRef, { completed: !task.completed });
    };

    const handleAddTask = () => {
        if (!firestore || !user) return;
        
        const newTask: Omit<Task, 'id'> = {
            title: 'New Task',
            completed: false,
            createdAt: new Date(),
        };

        const tasksCollectionRef = collection(firestore, `users/${user.uid}/projects/${project.id}/tasks`);

        addDocumentNonBlocking(tasksCollectionRef, newTask)
            .then(() => {
                toast({ title: "Task added!" });
            });
    }

    return (
        <Card>
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
                            Tasks ({completedTasks}/{totalTasks})
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2 pt-2">
                                {tasksLoading && <Loader2 className="h-5 w-5 animate-spin mx-auto" />}
                                {tasks?.sort((a,b) => a.createdAt.toMillis() - b.createdAt.toMillis()).map(task => (
                                    <div key={task.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer" onClick={() => handleToggleTask(task)}>
                                        {task.completed ? <CheckCircle2 className="h-5 w-5 text-primary shrink-0" /> : <Circle className="h-5 w-5 text-muted-foreground shrink-0" />}
                                        <span className={`flex-grow text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.title}</span>
                                    </div>
                                ))}
                                 <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleAddTask}>
                                    <PlusCircle className="h-4 w-4" /> Add Task
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

            </CardContent>
        </Card>
    );
}


export default function ProjectsPage() {
    const { firestore, user, isUserLoading } = useFirebase();
    const { toast } = useToast();

    const projectsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, `users/${user.uid}/projects`);
    }, [firestore, user]);

    const { data: projects, isLoading: projectsLoading, error } = useCollection<Project>(projectsQuery);

    const handleNewProject = () => {
        if (!firestore || !user) return;
        
        const newProject: Omit<Project, 'id'> = {
            userId: user.uid,
            name: 'New Project',
            description: 'A new awesome project.',
            status: 'On Track',
            progress: 0,
            createdAt: new Date(),
        };

        const projectsCollectionRef = collection(firestore, `users/${user.uid}/projects`);

        addDocumentNonBlocking(projectsCollectionRef, newProject)
            .then(() => {
                toast({ title: "Project created!" });
            })
    }

    if (error) {
        return <div>Error: {error.message}</div>
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Projects</h1>
                    <p className="text-muted-foreground">Track your personal and professional projects from Firestore.</p>
                </div>
                <Button onClick={handleNewProject} disabled={isUserLoading || projectsLoading}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Project
                </Button>
            </div>

            {(isUserLoading || projectsLoading) && (
                 <div className="grid gap-6 lg:grid-cols-2">
                    <Card><CardHeader><CardTitle>Loading...</CardTitle></CardHeader><CardContent><Loader2 className="h-8 w-8 animate-spin" /></CardContent></Card>
                    <Card><CardHeader><CardTitle>Loading...</CardTitle></CardHeader><CardContent><Loader2 className="h-8 w-8 animate-spin" /></CardContent></Card>
                 </div>
            )}

            {!isUserLoading && !projectsLoading && projects && (
                 <div className="grid gap-6 lg:grid-cols-2">
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            )}

            {!isUserLoading && !projectsLoading && (!projects || projects.length === 0) && (
                <Card className="flex flex-col items-center justify-center p-8 gap-4 text-center">
                    <CardTitle>No projects yet!</CardTitle>
                    <CardDescription>Click "New Project" to get started.</CardDescription>
                </Card>
            )}
        </div>
    );
}
