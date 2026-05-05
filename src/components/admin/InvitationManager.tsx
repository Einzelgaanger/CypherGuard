"use client";

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Plus, 
  QrCode, 
  Copy, 
  Calendar, 
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { z } from 'zod';

const invitationSchema = z.object({
  guestName: z.string().min(2, 'Guest name must be at least 2 characters'),
  guestIdNumber: z.string().min(5, 'ID number must be at least 5 characters'),
  guestPhone: z.string().optional(),
  vehicleRegistration: z.string().optional(),
  arrivalDate: z.string().min(1, 'Arrival date is required'),
  arrivalTime: z.string().min(1, 'Arrival time is required'),
  duration: z.number().min(1, 'Duration must be at least 1 hour').max(72, 'Duration cannot exceed 72 hours'),
});

export function InvitationManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    guestName: '',
    guestIdNumber: '',
    guestPhone: '',
    vehicleRegistration: '',
    arrivalDate: '',
    arrivalTime: '',
    duration: 4, // 4 hours default
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);


  // Convex queries and mutations
  const invitations = useQuery(api.residents.getMyInvitations, {});
  const createInvitation = useMutation(api.residents.createInvitation);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Create arrival window
      const arrivalDateTime = new Date(`${formData.arrivalDate}T${formData.arrivalTime}`);
      const expiryDateTime = new Date(arrivalDateTime.getTime() + (formData.duration * 60 * 60 * 1000));

      const validatedData = invitationSchema.parse({
        ...formData,
        arrivalDate: formData.arrivalDate,
        arrivalTime: formData.arrivalTime,
      });

      const result = await createInvitation({
        guestName: validatedData.guestName,
        guestIdNumber: validatedData.guestIdNumber,
        guestPhone: validatedData.guestPhone || undefined,
        vehicleRegistration: validatedData.vehicleRegistration || undefined,
        arrivalWindow: {
          from: arrivalDateTime.getTime(),
          to: expiryDateTime.getTime(),
        },
      });

      if (result.success) {
        setIsCreateOpen(false);
        setFormData({
          guestName: '',
          guestIdNumber: '',
          guestPhone: '',
          vehicleRegistration: '',
          arrivalDate: '',
          arrivalTime: '',
          duration: 4,
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path.length > 0) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        // Handle Convex and other errors with user-friendly messages
        const errorMessage = (error as Error).message;
        if (errorMessage.includes('Active invitation already exists')) {
          setErrors({ 
            guestIdNumber: 'This guest already has an active invitation. Please check existing invitations or wait for the current one to expire.' 
          });
        } else if (errorMessage.includes('Resident not found')) {
          setErrors({ 
            submit: 'Unable to create invitation. Please contact support.' 
          });
        } else {
          setErrors({ 
            submit: 'Failed to create invitation. Please try again or contact support if the problem persists.' 
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const copyInvitationLink = (link: string) => {
    navigator.clipboard.writeText(link);
    // You could add a toast notification here
  };

  const generateQRCode = (invitation: any) => {
    return invitation.invitationLink;
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getInvitationStatus = (invitation: any) => {
    if (invitation.isUsed) return { label: 'Used', variant: 'default' as const };
    if (invitation.isExpired) return { label: 'Expired', variant: 'destructive' as const };
    return { label: 'Active', variant: 'secondary' as const };
  };

  // Use real invitations data
  const realInvitations = invitations || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Invitation Management</CardTitle>
            <CardDescription>
              Create and manage guest invitations
            </CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Invitation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Guest Invitation</DialogTitle>
                <DialogDescription>
                  Generate a secure invitation link for your guest
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="guestName">Guest Name</Label>
                  <Input
                    id="guestName"
                    value={formData.guestName}
                    onChange={(e) => handleChange('guestName', e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                  {errors.guestName && <p className="text-sm text-red-600">{errors.guestName}</p>}
                </div>

                <div>
                  <Label htmlFor="guestIdNumber">ID/Passport Number</Label>
                  <Input
                    id="guestIdNumber"
                    value={formData.guestIdNumber}
                    onChange={(e) => handleChange('guestIdNumber', e.target.value)}
                    placeholder="12345678"
                    required
                  />
                  {errors.guestIdNumber && <p className="text-sm text-red-600">{errors.guestIdNumber}</p>}
                </div>

                <div>
                  <Label htmlFor="guestPhone">Phone Number (Optional)</Label>
                  <Input
                    id="guestPhone"
                    value={formData.guestPhone}
                    onChange={(e) => handleChange('guestPhone', e.target.value)}
                    placeholder="+254701234567"
                  />
                </div>

                <div>
                  <Label htmlFor="vehicleRegistration">Vehicle Registration (Optional)</Label>
                  <Input
                    id="vehicleRegistration"
                    value={formData.vehicleRegistration}
                    onChange={(e) => handleChange('vehicleRegistration', e.target.value)}
                    placeholder="KAA 123A"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="arrivalDate">Arrival Date</Label>
                    <Input
                      id="arrivalDate"
                      type="date"
                      value={formData.arrivalDate}
                      onChange={(e) => handleChange('arrivalDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    {errors.arrivalDate && <p className="text-sm text-red-600">{errors.arrivalDate}</p>}
                  </div>

                  <div>
                    <Label htmlFor="arrivalTime">Arrival Time</Label>
                    <Input
                      id="arrivalTime"
                      type="time"
                      value={formData.arrivalTime}
                      onChange={(e) => handleChange('arrivalTime', e.target.value)}
                      required
                    />
                    {errors.arrivalTime && <p className="text-sm text-red-600">{errors.arrivalTime}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="duration">Visit Duration (hours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                    min="1"
                    max="72"
                    required
                  />
                </div>

                {errors.submit && (
                  <p className="text-sm text-red-600">{errors.submit}</p>
                )}

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Creating...' : 'Create Invitation'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="used">Used</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 mt-4">
                            {realInvitations.filter((inv: any) => !inv.isUsed && !inv.isExpired).length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No active invitations</p>
              </div>
            ) : (
              <div className="space-y-4">
                {realInvitations.filter((inv: any) => !inv.isUsed && !inv.isExpired).map((invitation: any) => (
                  <Card key={invitation._id} className="border-l-4 border-l-green-500">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{invitation.guestName}</span>
                            <Badge variant={getInvitationStatus(invitation).variant}>
                              {getInvitationStatus(invitation).label}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            ID: {invitation.guestIdNumber}
                            {invitation.vehicleRegistration && (
                              <> • Vehicle: {invitation.vehicleRegistration}</>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDateTime(invitation.arrivalWindow.from)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Until {formatDateTime(invitation.arrivalWindow.to)}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyInvitationLink(invitation.invitationLink)}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copy Link
                          </Button>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <QrCode className="w-4 h-4 mr-1" />
                                QR Code
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-sm">
                              <DialogHeader>
                                <DialogTitle>Invitation QR Code</DialogTitle>
                                <DialogDescription>
                                  Share this QR code with {invitation.guestName}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex flex-col items-center space-y-4">
                                <QRCodeSVG
                                  value={generateQRCode(invitation)}
                                  size={200}
                                  level="M"
                                  includeMargin={true}
                                  className="border rounded-lg"
                                />
                                <Button
                                  variant="outline"
                                  onClick={() => copyInvitationLink(invitation.invitationLink)}
                                  className="w-full"
                                >
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copy Invitation Link
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="used" className="space-y-4 mt-4">
            <div className="space-y-4">
              {realInvitations.filter((inv: any) => inv.isUsed).map((invitation: any) => (
                <Card key={invitation._id} className="border-l-4 border-l-gray-300">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{invitation.guestName}</span>
                          <Badge variant="default">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Used
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          ID: {invitation.guestIdNumber}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="expired" className="space-y-4 mt-4">
            <div className="text-center py-8">
              <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No expired invitations</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 