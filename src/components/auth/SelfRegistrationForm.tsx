"use client";

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, UserPlus } from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { z } from 'zod';

const registrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  role: z.enum(['resident', 'admin'], 'Please select an account type'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  nationalId: z.string().optional(),
  requestReason: z.string().min(10, 'Reason must be at least 10 characters long'),
});

export function SelfRegistrationForm() {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    role: '',
    firstName: '',
    lastName: '',
    nationalId: '',
    requestReason: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitRegistration = useMutation(api.userManagement.submitRegistrationRequest);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Ensure role is properly set before validation
      if (!formData.role) {
        setErrors({ role: 'Please select an account type' });
        setLoading(false);
        return;
      }

      // Add length check for requestReason as early validation
      if (formData.requestReason.length < 10) {
        setErrors({ requestReason: 'Reason must be at least 10 characters long' });
        setLoading(false);
        return;
      }

      const validatedData = registrationSchema.parse(formData);

      await submitRegistration({
        email: validatedData.email,
        phone: validatedData.phone,
        role: validatedData.role as "resident" | "admin",
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        nationalId: validatedData.nationalId,
        requestReason: validatedData.requestReason,
      });

      setSubmitted(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path && issue.path.length > 0) {
            const fieldName = String(issue.path[0]);
            fieldErrors[fieldName] = issue.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ submit: (error as Error).message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (submitted) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <CardTitle className="text-green-600">Registration Submitted!</CardTitle>
          <CardDescription>
            Your registration request has been submitted for admin approval. 
            You'll receive an email once it's reviewed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>What happens next?</strong><br />
              • Our admin team will review your request<br />
              • You'll receive an email notification within 24 hours<br />
              • Once approved, you can log in with your email and phone number
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-blue-600" />
          <CardTitle>Register New Account</CardTitle>
        </div>
        <CardDescription>
          Submit a registration request for admin approval
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="John"
                required
              />
              {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Doe"
                required
              />
              {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="john@example.com"
              required
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+254700000000"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              required
            />
            {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
          </div>

          <div>
            <Label htmlFor="role">Account Type *</Label>
            <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
              <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resident">Resident</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}
          </div>

          <div>
            <Label htmlFor="nationalId">National ID (Optional)</Label>
            <Input
              id="nationalId"
              value={formData.nationalId}
              onChange={(e) => handleChange('nationalId', e.target.value)}
              placeholder="12345678"
            />
          </div>

          <div>
            <Label htmlFor="requestReason">Reason for Registration</Label>
            <Textarea
              id="requestReason"
              placeholder="Please explain why you need access to this system... (minimum 10 characters)"
              value={formData.requestReason}
              onChange={(e) => handleChange('requestReason', e.target.value)}
              required
              rows={3}
              className={errors.requestReason ? 'border-red-500' : ''}
            />
            <div className="flex justify-between items-center mt-1">
              <div>
                {errors.requestReason && <p className="text-sm text-red-600">{errors.requestReason}</p>}
              </div>
              <p className={`text-xs ${formData.requestReason.length >= 10 ? 'text-green-600' : 'text-gray-500'}`}>
                {formData.requestReason.length}/10 characters
              </p>
            </div>
          </div>

          {errors.submit && (
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Registration Request'}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Already have an account? <a href="/login" className="text-blue-600 hover:underline">Sign in</a>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 