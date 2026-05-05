"use client";

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MigrationPage() {
  const [status, setStatus] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  
  const runCleanup = useMutation(api.migration.cleanupConflictingData);
  const createAdmin = useMutation(api.migration.createAdminUser);

  const handleCleanup = async () => {
    setIsRunning(true);
    setStatus('Running cleanup...');
    
    try {
      const result = await runCleanup({});
      if (result.success) {
        setStatus(`✅ Success! Cleaned ${result.cleaned} conflicting records.`);
      } else {
        setStatus(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setStatus(`❌ Failed: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCreateAdmin = async () => {
    setIsRunning(true);
    setStatus('Creating admin user...');
    
    try {
      const result = await createAdmin({});
      if (result.success) {
        setStatus(`✅ ${result.message}\n📧 Email: ${result.email}\n💡 ${result.note}`);
      } else {
        setStatus(`❌ ${result.message || result.error}`);
      }
    } catch (error) {
      setStatus(`❌ Failed: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Database Migration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Database utilities for development and testing.
          </p>
          
          <div className="space-y-2">
            <Button 
              onClick={handleCreateAdmin}
              disabled={isRunning}
              className="w-full"
              variant="default"
            >
              {isRunning ? 'Creating...' : 'Create Admin User'}
            </Button>
            
            <Button 
              onClick={handleCleanup}
              disabled={isRunning}
              className="w-full"
              variant="outline"
            >
              {isRunning ? 'Running...' : 'Clean Database'}
            </Button>
          </div>
          
          {status && (
            <div className="p-3 border rounded text-sm whitespace-pre-line">
              {status}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 