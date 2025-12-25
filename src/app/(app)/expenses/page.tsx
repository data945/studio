'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, DollarSign } from "lucide-react";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import type { Expense } from "@/lib/types";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function ExpensesPage() {
    const { firestore, user, isUserLoading } = useFirebase();
    const { toast } = useToast();

    const expensesQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, `users/${user.uid}/expenseManagements`);
    }, [firestore, user]);

    const { data: expenses, isLoading: expensesLoading, error } = useCollection<Expense>(expensesQuery);

    const handleNewExpense = () => {
        if (!firestore || !user) return;

        const newExpense: Omit<Expense, 'id' | 'createdAt'> = {
            userId: user.uid,
            category: "Learning",
            description: "New course subscription",
            amount: 49.99,
        };
        
        const expensesCollectionRef = collection(firestore, `users/${user.uid}/expenseManagements`);

        addDocumentNonBlocking(expensesCollectionRef, { ...newExpense, createdAt: serverTimestamp() })
            .then(() => {
                toast({ title: "Expense logged!" });
            });
    }

    if (error) {
        return <div>Error: {error.message}</div>
    }

    const totalExpenses = expenses ? expenses.reduce((acc, exp) => acc + exp.amount, 0) : 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Expense Management</h1>
          <p className="text-muted-foreground">Track your expenses and manage your budget from Firestore.</p>
        </div>
        <Button onClick={handleNewExpense} disabled={isUserLoading || expensesLoading}>
            <PlusCircle className="mr-2 h-4 w-4"/>
            Log Expense
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Expense History</CardTitle>
            <CardDescription>
                Your recent expenses. Total: <span className="font-bold text-foreground">${totalExpenses.toFixed(2)}</span>
            </CardDescription>
        </CardHeader>
        <CardContent>
            {(isUserLoading || expensesLoading) && <Loader2 className="h-8 w-8 animate-spin mx-auto my-8" />}
            
            {!isUserLoading && !expensesLoading && expenses && expenses.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {expenses.sort((a,b) => b.createdAt.toMillis() - a.createdAt.toMillis()).map((expense) => (
                            <TableRow key={expense.id}>
                                <TableCell>{expense.createdAt ? format(expense.createdAt.toDate(), 'yyyy-MM-dd') : 'N/A'}</TableCell>
                                <TableCell className="font-medium">{expense.description}</TableCell>
                                <TableCell>{expense.category}</TableCell>
                                <TableCell className="text-right font-mono">${expense.amount.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {!isUserLoading && !expensesLoading && (!expenses || expenses.length === 0) && (
                <div className="text-center py-12">
                    <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No expenses logged yet.</p>
                    <p className="text-muted-foreground">Click "Log Expense" to get started.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
