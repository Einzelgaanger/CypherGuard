"use client";

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock,
  Search,
  MoreVertical,
  Shield,
  Mail,
  Phone,
  Key,
  Copy,
  ExternalLink
} from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { RegistrationRequestCard } from './RegistrationRequestCard';

interface UserManagementDashboardProps {
  // Removed adminUserId - it's now determined from the authenticated user
}

export function UserManagementDashboard(props: UserManagementDashboardProps) {
  const [activeTab, setActiveTab] = useState("requests");
  const [userFilter, setUserFilter] = useState<any>(undefined);

  const pendingRequests = useQuery(api.userManagement.getRegistrationRequests, { 
    status: "pending" 
  });
  const allRequests = useQuery(api.userManagement.getRegistrationRequests, {});
  const allUsers = useQuery(api.admin.getAllUsers, userFilter);
  const stats = useQuery(api.admin.getUserRegistrationStats);
  const pendingAuthSetups = useQuery(api.admin.getPendingAuthSetup, {});

  const reviewRequest = useMutation(api.admin.reviewRegistrationRequest);
  const updateUserStatus = useMutation(api.admin.updateUserStatus);
  const updateUserRole = useMutation(api.admin.updateUserRole);

  const handleReviewRequest = async (
    requestId: Id<"user_registration_requests">, 
    action: "approve" | "reject",
    notes?: string
  ) => {
    try {
      await reviewRequest({
        requestId,
        action,
        reviewNotes: notes,
        // adminUserId is now determined from the authenticated user
      });
    } catch (error) {
      console.error("Failed to review request:", error);
    }
  };

  const handleToggleUserStatus = async (userEmail: string, currentStatus: boolean) => {
    try {
      await updateUserStatus({
        userEmail,
        isActive: !currentStatus,
        // adminUserId is now determined from the authenticated user
      });
    } catch (error) {
      console.error("Failed to update user status:", error);
    }
  };

  const pendingCount = stats?.pendingRequests || 0;
  const approvedCount = stats?.approvedRequests || 0;
  const rejectedCount = stats?.rejectedRequests || 0;
  const activeUsers = stats?.activeUsers || 0;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-blue-600">{approvedCount}</p>
              </div>
              <UserCheck className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <UserX className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user registrations and existing accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="requests">
                Registration Requests ({pendingCount})
              </TabsTrigger>
              <TabsTrigger value="pending-auth">
                Pending Auth Setup ({Array.isArray(pendingAuthSetups) ? pendingAuthSetups.length : 0})
              </TabsTrigger>
              <TabsTrigger value="users">
                All Users ({allUsers?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="history">
                Request History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="requests" className="space-y-4">
              {pendingCount === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No pending registration requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests?.map((request) => (
                    <RegistrationRequestCard
                      key={request._id}
                      request={request}
                      onReview={handleReviewRequest}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending-auth" className="space-y-4">
              {!pendingAuthSetups || !Array.isArray(pendingAuthSetups) || pendingAuthSetups.length === 0 ? (
                <div className="text-center py-8">
                  <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No pending authentication setups</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Users will appear here after approval until they complete their account setup
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingAuthSetups.map((setup: any) => (
                    <Card key={setup._id} className="border-orange-200 bg-orange-50">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-orange-600" />
                              <span className="font-medium">{setup.email}</span>
                              <Badge variant="outline" className="text-orange-700 border-orange-300">
                                Awaiting Setup
                              </Badge>
                            </div>
                            
                            <div className="text-sm text-orange-700">
                              <p>Created: {new Date(setup.createdAt).toLocaleDateString()}</p>
                              <p>Expires: {new Date(setup.expiresAt).toLocaleDateString()}</p>
                            </div>

                            <div className="bg-orange-100 p-3 rounded-lg border border-orange-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-orange-800 mb-1">
                                    Temporary Password:
                                  </p>
                                  <code className="text-sm bg-white px-2 py-1 rounded border">
                                    {setup.tempPassword}
                                  </code>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigator.clipboard.writeText(setup.tempPassword)}
                                  className="border-orange-300 text-orange-700 hover:bg-orange-200"
                                >
                                  <Copy className="w-3 h-3 mr-1" />
                                  Copy
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const url = `${window.location.origin}/complete-signup?email=${encodeURIComponent(setup.email)}`;
                                navigator.clipboard.writeText(url);
                              }}
                              className="border-orange-300 text-orange-700 hover:bg-orange-200"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy Setup Link
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                window.open(`/complete-signup?email=${encodeURIComponent(setup.email)}`, '_blank');
                              }}
                              className="border-orange-300 text-orange-700 hover:bg-orange-200"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View Setup Page
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-6">
                      <div className="text-sm text-blue-800">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Key className="w-4 h-4" />
                          Instructions for New Users
                        </h4>
                        <ol className="list-decimal list-inside space-y-1 text-xs">
                          <li>Share the temporary password with the approved user</li>
                          <li>Send them the "Setup Link" to complete their registration</li>
                          <li>They will create their own secure password</li>
                          <li>Once complete, they can log in normally</li>
                        </ol>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <div className="flex gap-4 mb-4">
                <Button
                  variant={userFilter?.role ? "outline" : "default"}
                  onClick={() => setUserFilter(undefined)}
                  size="sm"
                >
                  All Roles
                </Button>
                <Button
                  variant={userFilter?.role === "resident" ? "default" : "outline"}
                  onClick={() => setUserFilter({ role: "resident" })}
                  size="sm"
                >
                  Residents
                </Button>
                <Button
                  variant={userFilter?.role === "admin" ? "default" : "outline"}
                  onClick={() => setUserFilter({ role: "admin" })}
                  size="sm"
                >
                  Admins
                </Button>
              </div>

              <div className="space-y-4">
                {allUsers?.map((user) => (
                  <Card key={user._id} className={!user.isActive ? 'bg-gray-50' : ''}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-600" />
                            <span className="font-medium">{user.email}</span>
                            <Badge variant={user.isActive ? "default" : "secondary"}>
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline">
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {user.phone}
                              </div>
                            )}
                          </div>

                          {(user as any).resident && (
                            <div className="text-sm text-gray-600">
                              <strong>Unit:</strong> {(user as any).resident.unitNumber} • 
                              <strong> Status:</strong> {(user as any).resident.isVerified ? 'Verified' : 'Pending Verification'}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                            variant={user.isActive ? "outline" : "default"}
                            size="sm"
                          >
                            {user.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="space-y-4">
                {allRequests?.filter(r => r.status !== "pending").map((request) => (
                  <RegistrationRequestCard
                    key={request._id}
                    request={request}
                    onReview={handleReviewRequest}
                    readonly={true}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 