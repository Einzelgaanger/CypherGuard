"use client";

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { ReportGenerator } from '@/components/admin/ReportGenerator';
import { NotificationManager } from '@/components/admin/NotificationManager';

import { QRScanner } from '@/components/qr/QRScanner';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  LogOut,
  QrCode
} from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

export default function AdminDashboardPage() {
  const [filter, setFilter] = useState<"all" | "checked_in" | "expected">("checked_in");


  const [showQRScanner, setShowQRScanner] = useState(false);
  const [qrScanMode, setQrScanMode] = useState<'checkin' | 'checkout' | 'verification'>('checkout');

  // Sample estate ID - in real app this would come from authentication context
  const estateId = "k170xnrdb0eppstrtwxvn7yyf97mdkse" as Id<"estates">;

  // Convex queries and mutations - Real-time subscriptions
  const allVisitsData = useQuery(api.subscriptions.subscribeToVisitors, { estateId });
  const dashboardData = useQuery(api.admin.getDashboardData, { 
    estateId, 
    filter: filter === "all" ? undefined : filter 
  });
  const alerts = useQuery(api.subscriptions.subscribeToAlerts, { estateId });
  const checkoutVisitor = useMutation(api.admin.checkoutVisitor);

  // Filter visits based on selected filter and real-time data
  const allVisits = allVisitsData || [];
  const expectedGuests = dashboardData?.expectedGuests || [];
  
  // Real-time counts
  const checkedInCount = allVisits.filter((v: any) => v.status === "checked_in").length;
  const realTimeOverstayCount = allVisits.filter((v: any) => 
    v.status === "checked_in" && 
    (Date.now() - v.checkinTime) > (8 * 60 * 60 * 1000) // 8 hours
  ).length;

  const handleCheckout = async (visitId: Id<"visits">) => {
    try {
      await checkoutVisitor({ visitId });
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };



  const handleQRScanSuccess = (data: any) => {
    console.log('QR scan result:', data);
    
    if (data.type === 'digital_pass' && data.visitId) {
      // Handle checkout via QR code
      handleCheckout(data.visitId);
    } else if (data.type === 'invitation' && data.token) {
      // Redirect to invitation check-in
      window.open(`/invitation/${data.token}`, '_blank');
    }
    
    setShowQRScanner(false);
  };



  // Real data from Convex
  const checkedInVisits = allVisits.filter((v: any) => v.status === "checked_in");

  // handleCheckout already defined above - removed duplicate

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m`;
  };

  return (
    <AppLayout>
      <div className="space-y-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Checked In</p>
                  <p className="text-2xl font-bold text-green-600">{checkedInCount}</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expected Today</p>
                  <p className="text-2xl font-bold text-blue-600">{expectedGuests.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overstays</p>
                  <p className="text-2xl font-bold text-orange-600">{realTimeOverstayCount}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Today</p>
                  <p className="text-2xl font-bold text-gray-600">{allVisits.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Alerts */}
        {alerts && alerts.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="w-5 h-5" />
                Active Alerts ({alerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts.slice(0, 3).map((alert: any) => (
                <div key={alert._id} className="bg-white p-3 rounded-lg border border-orange-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-900">{alert.message}</p>
                      <p className="text-xs text-orange-700 mt-1">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={
                      alert.priority === 'high' ? 'destructive' : 
                      alert.priority === 'medium' ? 'default' : 'secondary'
                    }>
                      {alert.priority}
                    </Badge>
                  </div>
                </div>
              ))}
              {alerts.length > 3 && (
                <p className="text-sm text-orange-700 text-center">
                  And {alerts.length - 3} more alerts...
                </p>
              )}
            </CardContent>
          </Card>
        )}



        {/* QR Code Scanner */}
        {showQRScanner ? (
          <QRScanner
            mode={qrScanMode}
            onScanSuccess={handleQRScanSuccess}
            onCancel={() => setShowQRScanner(false)}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    setQrScanMode('checkout');
                    setShowQRScanner(true);
                  }}
                  variant="outline"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Scan for Checkout
                </Button>
                <Button 
                  onClick={() => {
                    setQrScanMode('checkin');
                    setShowQRScanner(true);
                  }}
                  variant="outline"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Scan Invitation
                </Button>
                <Button 
                  onClick={() => {
                    setQrScanMode('verification');
                    setShowQRScanner(true);
                  }}
                  variant="outline"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Verify Guest
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Visitor Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Visitor Management</CardTitle>
                <CardDescription>
                  Monitor and manage current visitors
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={filter} onValueChange={(value: any) => setFilter(value)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="checked_in">
                  Currently In ({checkedInVisits.length})
                </TabsTrigger>
                <TabsTrigger value="expected">
                  Expected ({expectedGuests.length})
                </TabsTrigger>
                <TabsTrigger value="all">
                  All Today ({allVisits.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="checked_in" className="space-y-4">
                {checkedInVisits.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No visitors currently checked in</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {checkedInVisits.map((visit) => (
                      <Card key={visit._id} className="border-l-4 border-l-green-500">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{visit.guest?.name || 'Unknown Guest'}</span>
                                <Badge variant="outline">{visit.purpose}</Badge>
                                {((Date.now() - visit.checkinTime) > (8 * 60 * 60 * 1000)) && (
                                  <Badge variant="destructive">Overstay</Badge>
                                )}
                              </div>
                              
                              <div className="text-sm text-gray-600">
                                ID: {visit.guest?.idNumber || 'N/A'}
                                {visit.guest?.vehicleRegistration && (
                                  <> • Vehicle: {visit.guest.vehicleRegistration}</>
                                )}
                              </div>

                              <div className="text-sm text-gray-500">
                                {visit.resident ? (
                                  <>Visiting: {visit.resident.name} ({visit.resident.unitNumber})</>
                                ) : (
                                  <>Walk-in visitor</>
                                )}
                              </div>

                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  Checked in: {formatTime(visit.checkinTime)}
                                </div>
                                <div>
                                  Duration: {Math.floor((Date.now() - visit.checkinTime) / (1000 * 60))} mins
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCheckout(visit._id as Id<"visits">)}
                              >
                                <LogOut className="w-4 h-4 mr-1" />
                                Check Out
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="expected" className="space-y-4">
                {expectedGuests.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No expected guests today</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {expectedGuests.map((guest: any) => (
                      <Card key={guest.invitation._id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{guest.invitation.guestName}</span>
                              <Badge variant="secondary">Expected</Badge>
                            </div>
                            
                            <div className="text-sm text-gray-600">
                              ID: {guest.invitation.guestIdNumber}
                            </div>

                            <div className="text-sm text-gray-500">
                              Expected arrival: {formatTime(guest.expectedArrival)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="all" className="space-y-4">
                <div className="space-y-4">
                  {allVisits.map((visit: any) => (
                    <Card key={visit._id} className={`border-l-4 ${
                      visit.status === "checked_in" ? "border-l-green-500" : "border-l-gray-300"
                    }`}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{visit.guest.name}</span>
                              <Badge variant="outline">{visit.purpose}</Badge>
                              <Badge variant={visit.status === "checked_in" ? "default" : "secondary"}>
                                {visit.status === "checked_in" ? "In" : "Out"}
                              </Badge>
                            </div>
                            
                            <div className="text-sm text-gray-600">
                              ID: {visit.guest.idNumber}
                            </div>

                            <div className="text-sm text-gray-500">
                              Duration: {formatDuration(visit.duration)}
                            </div>
                          </div>

                          {visit.status === "checked_in" && (
                            <Button
                              variant="outline"
                              size="sm"
                                                              onClick={() => handleCheckout(visit._id as Id<"visits">)}
                            >
                              <LogOut className="w-4 h-4 mr-1" />
                              Check Out
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Report Generation */}
        <ReportGenerator estateId={estateId} />

        {/* Notification Management */}
        <NotificationManager />
      </div>
    </AppLayout>
  );
} 