'use client';

import { Camera } from 'lucide-react';
import type { PhotographySession } from '@/lib/types';
import { DataPageLayout } from '@/components/data/data-page-layout';
import type { ColumnDef } from '@/components/data/data-table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { NewPhotographySessionDialog } from '@/components/photography/new-photography-session-dialog';

const columns: ColumnDef<PhotographySession>[] = [
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => {
      const date = row.original.createdAt?.toDate();
      return date ? format(date, 'yyyy-MM-dd') : 'N/A';
    },
  },
  {
    accessorKey: 'shotCounter',
    header: 'Shots Taken',
    cell: ({ row }) => <span className="font-medium">{row.original.shotCounter}</span>,
  },
  {
    accessorKey: 'qualityAssessment',
    header: 'Quality',
    cell: ({ row }) => {
      const score = row.original.qualityAssessment;
      return (
        <Badge
          variant={score > 3 ? 'default' : score > 1 ? 'secondary' : 'destructive'}
          className="bg-primary/20 text-primary hover:bg-primary/30"
        >
          {score}/5
        </Badge>
      );
    },
  },
  {
    accessorKey: 'editingPipeline',
    header: 'Pipeline',
  },
  {
    accessorKey: 'skillGapAnalysis',
    header: 'Skill Gaps',
    cell: ({ row }) => <span className="text-muted-foreground max-w-xs truncate">{row.original.skillGapAnalysis || 'None'}</span>,
  },
];

export default function PhotographyPage() {
  return (
    <DataPageLayout
      title="Photography"
      description="Track your photo sessions, ratings, and workflow from Firestore."
      collectionName="photographySessions"
      columns={columns}
      NewItemDialog={NewPhotographySessionDialog}
      emptyState={{
        icon: Camera,
        title: 'No photography sessions logged yet.',
        description: 'Click "Log Session" to get started.',
      }}
    />
  );
}
