'use client';

import { BrainCircuit } from 'lucide-react';
import type { DeepWorkSession } from '@/lib/types';
import { DataPageLayout } from '@/components/data/data-page-layout';
import type { ColumnDef } from '@/components/data/data-table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const columns: ColumnDef<DeepWorkSession>[] = [
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => {
      const date = row.original.createdAt?.toDate();
      return date ? format(date, 'yyyy-MM-dd') : 'N/A';
    },
  },
  {
    accessorKey: 'subject',
    header: 'Subject',
    cell: ({ row }) => <span className="font-medium">{row.original.subject}</span>,
  },
  {
    accessorKey: 'topic',
    header: 'Topic',
  },
  {
    accessorKey: 'concept',
    header: 'Concept',
  },
  {
    accessorKey: 'confidenceScore',
    header: 'Confidence',
    cell: ({ row }) => {
      const score = row.original.confidenceScore;
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
    accessorKey: 'blockageNotes',
    header: 'Blockages',
    cell: ({ row }) => <span className="text-muted-foreground max-w-xs truncate">{row.original.blockageNotes || 'None'}</span>,
  },
];

const newSession: Omit<DeepWorkSession, 'id' | 'createdAt' | 'userId' | 'timeBlockId'> = {
  subject: 'Linear Algebra',
  topic: 'Eigenvalues',
  subtopic: 'Characteristic Polynomial',
  concept: 'Finding Eigenvectors',
  confidenceScore: 7,
  blockageNotes: 'Struggled with the null space calculation.',
};

export default function DeepWorkPage() {
  return (
    <DataPageLayout
      title="Deep Work"
      description="Track study sessions, confidence, and blockages from Firestore."
      collectionName="deepWorkSessions"
      columns={columns}
      newItem={{...newSession, timeBlockId: 'temp-id'}}
      emptyState={{
        icon: BrainCircuit,
        title: 'No deep work sessions logged yet.',
        description: 'Click "Log Session" to get started.',
      }}
    />
  );
}
