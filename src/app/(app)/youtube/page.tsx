'use client';

import { Clapperboard } from 'lucide-react';
import type { YoutubeLectureProduction } from '@/lib/types';
import { DataPageLayout } from '@/components/data/data-page-layout';
import type { ColumnDef } from '@/components/data/data-table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const workflowStageColors: Record<YoutubeLectureProduction['workflowStage'], string> = {
  'Learning': 'bg-blue-500',
  'Scripting': 'bg-purple-500',
  'Recording': 'bg-red-500',
  'Audio Enhancement': 'bg-yellow-500',
  'Visual Enhancement': 'bg-orange-500',
  'Publishing': 'bg-green-500',
  'Analytics Review': 'bg-indigo-500',
};

const columns: ColumnDef<YoutubeLectureProduction>[] = [
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => {
      const date = row.original.createdAt?.toDate();
      return date ? format(date, 'yyyy-MM-dd') : 'N/A';
    },
  },
  {
    accessorKey: 'syllabusAlignment',
    header: 'Syllabus Alignment',
    cell: ({ row }) => <span className="font-medium">{row.original.syllabusAlignment}</span>,
  },
  {
    accessorKey: 'workflowStage',
    header: 'Workflow Stage',
    cell: ({ row }) => {
      const stage = row.original.workflowStage;
      return (
        <Badge>
          <span className={`mr-2 h-2 w-2 rounded-full ${workflowStageColors[stage]}`}></span>
          {stage}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'qualityFeedbackLoop',
    header: 'Quality Feedback',
    cell: ({ row }) => <span className="text-muted-foreground max-w-xs truncate">{row.original.qualityFeedbackLoop || 'None'}</span>,
  },
];

const newProduction: Omit<YoutubeLectureProduction, 'id' | 'createdAt' | 'userId' | 'timeBlockId'> = {
  workflowStage: 'Learning',
  syllabusAlignment: 'New Video Topic',
  qualityFeedbackLoop: 'N/A',
};

export default function YoutubePage() {
  return (
    <DataPageLayout
      title="YouTube Production"
      description="Track your video creation workflow from Firestore."
      collectionName="youtubeLectureProductions"
      columns={columns}
      newItem={{...newProduction, timeBlockId: 'temp-id' }}
      emptyState={{
        icon: Clapperboard,
        title: 'No production entries logged yet.',
        description: 'Click "Log Production Entry" to get started.',
      }}
    />
  );
}
