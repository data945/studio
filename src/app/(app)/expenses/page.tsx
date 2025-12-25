'use client';

import { DollarSign } from 'lucide-react';
import type { Expense } from '@/lib/types';
import { DataPageLayout } from '@/components/data/data-page-layout';
import type { ColumnDef } from '@/components/data/data-table';
import { format } from 'date-fns';

const columns: ColumnDef<Expense>[] = [
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => {
      const date = row.original.createdAt?.toDate();
      return date ? format(date, 'yyyy-MM-dd') : 'N/A';
    },
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => <span className="font-medium">{row.original.description}</span>,
  },
  {
    accessorKey: 'category',
    header: 'Category',
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => <span className="font-mono text-right w-full block">${row.original.amount.toFixed(2)}</span>,
  },
];

const newExpense: Omit<Expense, 'id' | 'createdAt' | 'userId'> = {
  category: 'Learning',
  description: 'New course subscription',
  amount: 49.99,
};

export default function ExpensesPage() {
  return (
    <DataPageLayout
      title="Expenses"
      description="Track your expenses and manage your budget from Firestore."
      collectionName="expenseManagements"
      columns={columns}
      newItem={newExpense}
      emptyState={{
        icon: DollarSign,
        title: 'No expenses logged yet.',
        description: 'Click "Log Expense" to get started.',
      }}
    />
  );
}
