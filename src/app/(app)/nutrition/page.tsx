'use client';

import { CookingPot } from 'lucide-react';
import type { NutritionLog } from '@/lib/types';
import { DataPageLayout } from '@/components/data/data-page-layout';
import type { ColumnDef } from '@/components/data/data-table';
import { format } from 'date-fns';

const columns: ColumnDef<NutritionLog>[] = [
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => {
      const date = row.original.createdAt?.toDate();
      return date ? format(date, 'yyyy-MM-dd') : 'N/A';
    },
  },
  {
    accessorKey: 'mealName',
    header: 'Meal',
    cell: ({ row }) => <span className="font-medium">{row.original.mealName}</span>,
  },
  {
    accessorKey: 'calories',
    header: 'Calories',
  },
  {
    accessorKey: 'protein',
    header: 'Protein (g)',
  },
  {
    accessorKey: 'carbs',
    header: 'Carbs (g)',
  },
  {
    accessorKey: 'fat',
    header: 'Fat (g)',
  },
];

const newLog: Omit<NutritionLog, 'id' | 'createdAt' | 'userId'> = {
  mealName: 'Chicken and Rice',
  calories: 450,
  protein: 40,
  carbs: 50,
  fat: 10,
};

export default function NutritionPage() {
  return (
    <DataPageLayout
      title="Nutrition"
      description="Track your meals and macronutrients from Firestore."
      collectionName="nutritionDiets"
      columns={columns}
      newItem={newLog}
      emptyState={{
        icon: CookingPot,
        title: 'No meals logged yet.',
        description: 'Click "Log Meal" to get started.',
      }}
    />
  );
}
