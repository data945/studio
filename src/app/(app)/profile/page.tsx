'use client';

import { useFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, UserCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user, isUserLoading } = useFirebase();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {isUserLoading ? (
              <Loader2 className="h-20 w-20 animate-spin text-primary" />
            ) : (
              <Avatar className="h-24 w-24 mx-auto border-2 border-primary">
                <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} data-ai-hint="person face" />
                <AvatarFallback className="bg-muted">
                  <UserCircle className="h-16 w-16 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          <CardTitle className="text-3xl font-headline">
            {isUserLoading ? 'Loading...' : user?.displayName || 'Anonymous User'}
          </CardTitle>
          <CardDescription>
            {isUserLoading ? 'Fetching your details...' : user?.email || 'No email provided'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span className="font-semibold text-foreground">User ID:</span>
              <span>{isUserLoading ? '...' : user?.uid}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-foreground">Account Created:</span>
              <span>{isUserLoading || !user?.metadata.creationTime ? '...' : new Date(user.metadata.creationTime).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-foreground">Last Sign In:</span>
              <span>{isUserLoading || !user?.metadata.lastSignInTime ? '...' : new Date(user.metadata.lastSignInTime).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
