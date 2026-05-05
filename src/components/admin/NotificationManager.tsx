"use client";

import { useState } from 'react';
import { useAction } from 'convex/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  MessageSquare, 
  Send, 
  Settings, 
  CheckCircle, 
  XCircle,
  Clock
} from 'lucide-react';
import { api } from '../../../convex/_generated/api';

export function NotificationManager() {
  const [testSMS, setTestSMS] = useState({ phone: '', message: '' });
  const [testEmail, setTestEmail] = useState({ email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [lastSent, setLastSent] = useState<string | null>(null);

  const sendSMS = useAction(api.notifications.sendSMS);
  const sendEmail = useAction(api.notifications.sendEmail);

  const handleSendTestSMS = async () => {
    if (!testSMS.phone || !testSMS.message) return;
    
    setSending(true);
    try {
      await sendSMS({
        to: testSMS.phone,
        message: testSMS.message,
        type: "reminder"
      });
      setLastSent('SMS sent successfully!');
      setTestSMS({ phone: '', message: '' });
    } catch (error) {
      setLastSent(`SMS failed: ${(error as Error).message}`);
    } finally {
      setSending(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail.email || !testEmail.subject || !testEmail.message) return;
    
    setSending(true);
    try {
      await sendEmail({
        to: testEmail.email,
        subject: testEmail.subject,
        html: `<p>${testEmail.message.replace(/\n/g, '<br>')}</p>`,
        type: "reminder"
      });
      setLastSent('Email sent successfully!');
      setTestEmail({ email: '', subject: '', message: '' });
    } catch (error) {
      setLastSent(`Email failed: ${(error as Error).message}`);
    } finally {
      setSending(false);
    }
  };

  // Real notification history would come from Convex query
  // For now, empty array until notification history backend is implemented
  const notificationHistory: any[] = [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Sent</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Notification Management
          </CardTitle>
          <CardDescription>
            Configure and test SMS and email notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="test" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="test">Test Notifications</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="test" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SMS Testing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MessageSquare className="w-5 h-5" />
                      Test SMS
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="sms-phone">Phone Number</Label>
                      <Input
                        id="sms-phone"
                        type="tel"
                        placeholder="+254740193147"
                        value={testSMS.phone}
                        onChange={(e) => setTestSMS(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sms-message">Message</Label>
                      <Textarea
                        id="sms-message"
                        placeholder="Enter your test message..."
                        value={testSMS.message}
                        onChange={(e) => setTestSMS(prev => ({ ...prev, message: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <Button 
                      onClick={handleSendTestSMS} 
                      disabled={sending || !testSMS.phone || !testSMS.message}
                      className="w-full"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {sending ? 'Sending...' : 'Send Test SMS'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Email Testing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Mail className="w-5 h-5" />
                      Test Email
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="email-address">Email Address</Label>
                      <Input
                        id="email-address"
                        type="email"
                        placeholder="john@example.com"
                        value={testEmail.email}
                        onChange={(e) => setTestEmail(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email-subject">Subject</Label>
                      <Input
                        id="email-subject"
                        placeholder="Test notification from CypherSec"
                        value={testEmail.subject}
                        onChange={(e) => setTestEmail(prev => ({ ...prev, subject: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email-message">Message</Label>
                      <Textarea
                        id="email-message"
                        placeholder="Enter your test message..."
                        value={testEmail.message}
                        onChange={(e) => setTestEmail(prev => ({ ...prev, message: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <Button 
                      onClick={handleSendTestEmail} 
                      disabled={sending || !testEmail.email || !testEmail.subject || !testEmail.message}
                      className="w-full"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {sending ? 'Sending...' : 'Send Test Email'}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {lastSent && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      {lastSent.includes('successfully') ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className={lastSent.includes('successfully') ? 'text-green-800' : 'text-red-800'}>
                        {lastSent}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Notification History</h3>
                  <Badge variant="outline">{notificationHistory.length} total</Badge>
                </div>
                
                                  {notificationHistory.map((notification: any) => (
                  <Card key={notification.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {notification.type === 'sms' ? (
                            <MessageSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Mail className="w-5 h-5 text-purple-600" />
                          )}
                          <div>
                            <div className="font-medium">{notification.recipient}</div>
                            <div className="text-sm text-gray-600 truncate max-w-md">
                              {notification.message}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(notification.timestamp).toLocaleString()} • {notification.notificationType}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(notification.status)}
                          {getStatusBadge(notification.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Templates</CardTitle>
                  <CardDescription>
                    Pre-configured message templates for different notification types
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {[
                      {
                        name: 'Guest Invitation',
                        type: 'invitation',
                        sms: 'Hi {guestName}! You have been invited to {estate}. Use this link to check in: {invitationLink}',
                        email: 'Welcome to {estate}! You have been invited by {hostName}. Please use the attached QR code or visit {invitationLink} to complete your check-in.'
                      },
                      {
                        name: 'Arrival Reminder',
                        type: 'reminder',
                        sms: 'Reminder: {guestName} is expected to arrive at {arrivalTime}.',
                        email: 'Guest Arrival Reminder: {guestName} is expected to arrive at {estate} on {arrivalTime}.'
                      },
                      {
                        name: 'Security Alert',
                        type: 'alert',
                        sms: 'ALERT: {alertMessage} at {estate}. Please check the dashboard.',
                        email: 'Security Alert: {alertMessage} has been detected at {estate}. Please review the admin dashboard immediately.'
                      }
                    ].map((template, index) => (
                      <Card key={index} className="bg-gray-50">
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{template.name}</h4>
                              <Badge variant="outline">{template.type}</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium flex items-center gap-2">
                                  <MessageSquare className="w-4 h-4" />
                                  SMS Template
                                </Label>
                                <div className="mt-1 p-3 bg-white rounded border text-sm">
                                  {template.sms}
                                </div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium flex items-center gap-2">
                                  <Mail className="w-4 h-4" />
                                  Email Template
                                </Label>
                                <div className="mt-1 p-3 bg-white rounded border text-sm">
                                  {template.email}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 