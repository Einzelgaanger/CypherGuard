"use client";

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  XCircle, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  MessageSquare,
  Shield
} from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

interface RegistrationRequestCardProps {
  request: any;
  onReview: (requestId: Id<"user_registration_requests">, action: "approve" | "reject", notes?: string) => void;
  readonly?: boolean;
}

export function RegistrationRequestCard({ 
  request, 
  onReview, 
  readonly = false 
}: RegistrationRequestCardProps) {
  const [reviewNotes, setReviewNotes] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [pendingAction, setPendingAction] = useState<"approve" | "reject" | null>(null);
  const [loading, setLoading] = useState(false);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getRequestAge = (timestamp: number) => {
    const ageMs = request.requestAge || (Date.now() - timestamp);
    const ageHours = Math.floor(ageMs / (1000 * 60 * 60));
    const ageDays = Math.floor(ageHours / 24);
    
    if (ageDays > 0) {
      return `${ageDays} day${ageDays > 1 ? 's' : ''} ago`;
    } else if (ageHours > 0) {
      return `${ageHours} hour${ageHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Less than an hour ago';
    }
  };

  const handleReviewAction = (action: "approve" | "reject") => {
    setPendingAction(action);
    setShowReviewForm(true);
  };

  const handleSubmitReview = async () => {
    if (!pendingAction) return;
    
    setLoading(true);
    try {
      await onReview(request._id, pendingAction, reviewNotes || undefined);
      setShowReviewForm(false);
      setPendingAction(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Failed to review request:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (request.status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{request.status}</Badge>;
    }
  };

  return (
    <Card className={`${
      request.status === 'approved' ? 'border-green-200 bg-green-50' : 
      request.status === 'rejected' ? 'border-red-200 bg-red-50' : ''
    }`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500" />
              <CardTitle className="text-lg">
                {request.firstName} {request.lastName}
              </CardTitle>
              {getStatusBadge()}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Requested {getRequestAge(request.requestedAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <Badge variant="outline">
              {request.role.charAt(0).toUpperCase() + request.role.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{request.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{request.phone}</span>
          </div>
        </div>

        {/* National ID if provided */}
        {request.nationalId && (
          <div className="text-sm">
            <strong>National ID:</strong> {request.nationalId}
          </div>
        )}

        {/* Request Reason */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-start gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
            <strong className="text-sm">Reason for Registration:</strong>
          </div>
          <p className="text-sm text-gray-700 pl-6">{request.requestReason}</p>
        </div>

        {/* Review Information (for reviewed requests) */}
        {request.status !== 'pending' && (
          <div className="border-t pt-4">
            <div className="text-sm text-gray-600">
              <strong>Reviewed:</strong> {formatDate(request.reviewedAt)}
            </div>
            {request.reviewNotes && (
              <div className="mt-2 bg-blue-50 p-3 rounded-lg">
                <strong className="text-sm">Admin Notes:</strong>
                <p className="text-sm text-gray-700 mt-1">{request.reviewNotes}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons (for pending requests) */}
        {!readonly && request.status === 'pending' && !showReviewForm && (
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={() => handleReviewAction('approve')}
              className="flex-1 bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button
              onClick={() => handleReviewAction('reject')}
              variant="destructive"
              className="flex-1"
              size="sm"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        )}

        {/* Review Form */}
        {showReviewForm && (
          <div className="border-t pt-4 space-y-3">
            <div>
              <Label htmlFor="reviewNotes">
                {pendingAction === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason'}
              </Label>
              <Textarea
                id="reviewNotes"
                placeholder={
                  pendingAction === 'approve' 
                    ? 'Add any notes about the approval...'
                    : 'Please provide a reason for rejection...'
                }
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitReview}
                disabled={loading || (pendingAction === 'reject' && !reviewNotes.trim())}
                className={pendingAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                variant={pendingAction === 'approve' ? 'default' : 'destructive'}
                size="sm"
              >
                {loading ? 'Processing...' : `Confirm ${pendingAction === 'approve' ? 'Approval' : 'Rejection'}`}
              </Button>
              <Button
                onClick={() => {
                  setShowReviewForm(false);
                  setPendingAction(null);
                  setReviewNotes('');
                }}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 