'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles } from 'lucide-react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { DeepWorkSession, FitnessSession, VocalPracticeSession, PhotographySession } from '@/lib/types';
import { adaptiveProgression, type AdaptiveProgressionOutput } from '@/ai/flows/adaptive-progression';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

type Domain = 'deep-work' | 'fitness' | 'vocal-practice' | 'photography';

const domainConfig = {
    'deep-work': { label: 'Deep Work', collection: 'deepWorkSessions' },
    'fitness': { label: 'Fitness', collection: 'fitness-sessions' },
    'vocal-practice': { label: 'Vocal Practice', collection: 'vocalPracticeSessions' },
    'photography': { label: 'Photography', collection: 'photographySessions' },
};

export default function ProgressionPage() {
    const { firestore, user, isUserLoading } = useFirebase();
    const { toast } = useToast();
    const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
    const [suggestion, setSuggestion] = useState<AdaptiveProgressionOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const latestDataQuery = useMemoFirebase(() => {
        if (!firestore || !user || !selectedDomain) return null;
        const collName = domainConfig[selectedDomain].collection;
        return query(collection(firestore, `users/${user.uid}/${collName}`), orderBy('createdAt', 'desc'), limit(1));
    }, [firestore, user, selectedDomain]);

    // We use `any` here because the type changes based on the selected domain.
    const { data: latestEntry, isLoading: isDataLoading } = useCollection<any>(latestDataQuery);

    const formatPerformanceData = (domain: Domain, data: any): { summary: string, level: string } => {
        if (!data) return { summary: 'No data available', level: 'Beginner' };
        switch (domain) {
            case 'deep-work':
                const session = data as DeepWorkSession;
                return {
                    summary: `Topic: ${session.topic}, Confidence: ${session.confidence}/10, Blockages: ${session.blockages}`,
                    level: `Session on ${session.createdAt ? format(session.createdAt.toDate(), 'yyyy-MM-dd') : 'recent'}`
                };
            case 'fitness':
                 const fitness = data as FitnessSession;
                 return {
                     summary: fitness.logs.map(l => `${l.exercise}: ${l.sets}x${l.reps} @ ${l.weight}kg (RPE ${l.rpe})`).join('; '),
                     level: `${fitness.name} on ${fitness.createdAt ? format(fitness.createdAt.toDate(), 'yyyy-MM-dd') : 'Recent'}`
                 };
            case 'vocal-practice':
                const vocal = data as VocalPracticeSession;
                return {
                    summary: `Curriculum: ${vocal.curriculum}, Exercise: ${vocal.exercise}, Score: ${vocal.performanceScore}/10, Struggles: ${vocal.strugglePointTag}`,
                    level: `Practice on ${vocal.createdAt ? format(vocal.createdAt.toDate(), 'yyyy-MM-dd') : 'recent'}`
                }
            case 'photography':
                const photo = data as PhotographySession;
                return {
                    summary: `Shots: ${photo.shotCounter}, Quality: ${photo.qualityAssessment}/5, Pipeline: ${photo.editingPipeline}, Gaps: ${photo.skillGapAnalysis}`,
                    level: `Session on ${photo.createdAt ? format(photo.createdAt.toDate(), 'yyyy-MM-dd') : 'recent'}`
                }
            default:
                return { summary: 'Unknown domain', level: 'N/A' };
        }
    };

    const handleSuggestion = async () => {
        if (!selectedDomain || !latestEntry || latestEntry.length === 0) {
            toast({ variant: 'destructive', title: 'No data available', description: `Please log a session for ${selectedDomain ? domainConfig[selectedDomain].label : ''} first.` });
            return;
        }

        setIsLoading(true);
        setSuggestion(null);

        const performance = formatPerformanceData(selectedDomain, latestEntry[0]);
        
        try {
            const result = await adaptiveProgression({
                domain: domainConfig[selectedDomain].label,
                performanceData: performance.summary,
                currentLevel: performance.level,
            });
            setSuggestion(result);
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error getting suggestion',
                description: 'An unexpected error occurred. Please try again.',
            });
        }
        setIsLoading(false);
    };


    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Adaptive Progression</h1>
                <p className="text-muted-foreground">Let AI analyze your performance and suggest the next challenge.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Select Domain</CardTitle>
                        <CardDescription>Choose a life domain to get a progression suggestion for.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Select onValueChange={(value: Domain) => setSelectedDomain(value)} disabled={isLoading || isUserLoading}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a domain..." />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(domainConfig).map(([key, { label }]) => (
                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button 
                            onClick={handleSuggestion} 
                            disabled={!selectedDomain || isLoading || isDataLoading} 
                            className="w-full"
                        >
                            {isLoading || isDataLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Suggest Next Challenge
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>AI Suggestion</CardTitle>
                        <CardDescription>Your AI-powered next step.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading && <Loader2 className="h-8 w-8 animate-spin mx-auto my-8" />}
                        {!isLoading && !suggestion && (
                            <div className="text-center text-muted-foreground py-8">
                                <Sparkles className="h-8 w-8 mx-auto mb-2" />
                                <p>Your suggestion will appear here.</p>
                            </div>
                        )}
                        {suggestion && (
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg text-primary">{suggestion.suggestedLevel}</h3>
                                <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
            
            {selectedDomain && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Latest Performance Data</CardTitle>
                        <CardDescription>This data will be used to generate the suggestion.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isDataLoading && <Loader2 className="h-6 w-6 animate-spin" />}
                        {!isDataLoading && (!latestEntry || latestEntry.length === 0) && <p className="text-muted-foreground">No data found for this domain. Please log an entry first.</p>}
                        {latestEntry && latestEntry.length > 0 && (
                            <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-md">
                               <pre className="whitespace-pre-wrap font-mono text-xs">{JSON.stringify(latestEntry[0], null, 2)}</pre>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

        </div>
    );
}
