'use client';

import { useState } from 'react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { PlusCircle, type LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DataTable, type ColumnDef } from './data-table';

interface DataPageLayoutProps<T> {
  title: string;
  description: string;
  collectionName: string;
  columns: ColumnDef<T>[];
  NewItemDialog?: React.ComponentType<{ open: boolean; onOpenChange: (open: boolean) => void; }>;
  emptyState: {
    icon: LucideIcon;
    title: string;
    description: string;
  };
  initialSort?: {
    id: keyof T;
    desc: boolean;
  };
}

export function DataPageLayout<T extends { id: string; userId: string; createdAt: any }>({
  title,
  description,
  collectionName,
  columns,
  NewItemDialog,
  emptyState,
  initialSort = { id: 'createdAt', desc: true },
}: DataPageLayoutProps<T>) {
  const { firestore, user, isUserLoading } = useFirebase();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const dataQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
        collection(firestore, `users/${user.uid}/${collectionName}`), 
        orderBy(initialSort.id as string, initialSort.desc ? 'desc' : 'asc')
    );
  }, [firestore, user, collectionName, initialSort.id, initialSort.desc]);

  const { data, isLoading: dataLoading, error } = useCollection<T>(dataQuery);

  const isLoading = isUserLoading || dataLoading;

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const EmptyStateIcon = emptyState.icon;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {NewItemDialog && (
            <Button onClick={() => setIsDialogOpen(true)} disabled={isLoading} className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                Log {title.slice(0, -1)}
            </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{title} History</CardTitle>
          <CardDescription>Your recent {title.toLowerCase()} logs.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={data}
            isLoading={isLoading}
            emptyState={
              <div className="text-center py-12">
                <EmptyStateIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="font-semibold">{emptyState.title}</p>
                <p className="text-muted-foreground">{emptyState.description}</p>
              </div>
            }
          />
        </CardContent>
      </Card>

      {NewItemDialog && <NewItemDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />}
    </div>
  );
}
