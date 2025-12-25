
'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wrench } from "lucide-react";

export default function PlaceholderPage() {
    const pageName = "Nutrition";

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
                        <Wrench className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-headline">
                        {pageName} Module
                    </CardTitle>
                    <CardDescription>
                        This page is under construction. Check back soon for updates!
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        The full implementation for the <span className="font-semibold text-foreground">{pageName}</span> tracking module is being developed.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
