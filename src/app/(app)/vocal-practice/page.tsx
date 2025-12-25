'use client';

import { Mic } from 'lucide-react';
import type { VocalPracticeSession } from '@/lib/types';
import { DataPageLayout } from '@/components/data/data-page-layout';
import type { ColumnDef } from '@/components/data/data-table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { NewVocalPracticeSessionDialog } from '@/components/vocal-practice/new-vocal-practice-session-dialog';

const columns: ColumnDef<VocalPracticeSession>[] = [
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => {
      const date = row.original.createdAt?.toDate();
      return date ? format(date, 'yyyy-MM-dd') : 'N/A';
    },
  },
  {
    accessorKey: 'curriculum',
    header: 'Curriculum',
    cell: ({ row }) => <span className="font-medium">{row.original.curriculum} - {row.original.subCurriculum}</span>,
  },
  {
    accessorKey: 'exercise',
    header: 'Exercise',
  },
  {
    accessorKey: 'performanceScore',
    header: 'Score',
    cell: ({ row }) => {
      const score = row.original.performanceScore;
      return (
        <Badge
          variant={score > 7 ? 'default' : score > 4 ? 'secondary' : 'destructive'}
          className="bg-primary/20 text-primary hover:bg-primary/30"
        >
          {score}/10
        </Badge>
      );
    },
  },
  {
    accessorKey: 'strugglePointTag',
    header: 'Struggle Point',
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.strugglePointTag || 'None'}</span>,
  },
];

export default function VocalPracticePage() {
  return (
    <DataPageLayout
      title="Vocal Practice"
      description="Track your singing sessions and performance scores from Firestore."
      collectionName="vocalPracticeSessions"
      columns={columns}
      NewItemDialog={NewVocalPracticeSessionDialog}
      emptyState={{
        icon: Mic,
        title: 'No vocal sessions logged yet.',
        description: 'Click "Log Session" to get started.',
      }}
    />
  );
}
