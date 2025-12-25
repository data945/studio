'use client';

import { PenSquare } from 'lucide-react';
import type { Project } from '@/lib/types';
import { DataPageLayout } from '@/components/data/data-page-layout';
import type { ColumnDef } from '@/components/data/data-table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { NewProjectDialog } from '@/components/projects/new-project-dialog';

const statusColors: Record<Project['status'], string> = {
    'On Track': 'bg-green-500',
    'At Risk': 'bg-yellow-500',
    'Completed': 'bg-blue-500',
}

const columns: ColumnDef<Project>[] = [
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => {
      const date = row.original.createdAt?.toDate();
      return date ? format(date, 'yyyy-MM-dd') : 'N/A';
    },
  },
  {
    accessorKey: 'name',
    header: 'Project Name',
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => <p className="text-muted-foreground max-w-xs truncate">{row.original.description}</p>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
        const status = row.original.status;
        return (
            <Badge variant={status === 'Completed' ? 'default' : 'outline'}>
                <span className={`mr-2 h-2 w-2 rounded-full ${statusColors[status]}`}></span>
                {status}
            </Badge>
        );
    }
  },
];

export default function ProjectsPage() {
  return (
    <DataPageLayout
      title="Projects"
      description="Track your personal and professional projects from Firestore."
      collectionName="projects"
      columns={columns}
      NewItemDialog={NewProjectDialog}
      emptyState={{
        icon: PenSquare,
        title: 'No projects logged yet.',
        description: 'Click "Log Project" to get started.',
      }}
    />
  );
}
