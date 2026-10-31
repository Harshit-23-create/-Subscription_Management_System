import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input, Label, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { User, Building2, Save } from 'lucide-react';

export const CustomerProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { success } = useToast();

  const [name, setName] = useState(user?.name || 'Aarav Sharma');
  const [email, setEmail] = useState(user?.email || 'aarav.sharma@techspire.in');
  const [company, setCompany] = useState(user?.company || 'TechSpire Solutions Pvt Ltd');
  const [phone, setPhone] = useState('+91 98201 44521');
  const [address, setAddress] = useState('Plot 42, Hitec City Phase 2, Hyderabad 500081');
  const [gstin, setGstin] = useState('36AABCT1332L1Z4');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    success('Profile Saved', 'Your organization profile has been updated.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Account Profile & Billing Information"
        description="Maintain authorized contact details, billing address, and tax information."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Organization & Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label required>Authorized Representative</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div>
                    <Label required>Billing Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label required>Company Name</Label>
                    <Input value={company} onChange={(e) => setCompany(e.target.value)} required />
                  </div>
                  <div>
                    <Label required>Phone Number</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                </div>

                <div>
                  <Label required>GST Identification Number (GSTIN)</Label>
                  <Input value={gstin} onChange={(e) => setGstin(e.target.value)} className="font-mono uppercase" required />
                </div>

                <div>
                  <Label required>Official Billing Address</Label>
                  <Textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} required />
                </div>

                <div className="pt-2">
                  <Button type="submit" size="sm">
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    Save Billing Details
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-slate-50 border-slate-200">
            <CardHeader>
              <CardTitle className="text-sm">Account Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-5 text-xs text-slate-600 space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="font-semibold text-slate-800">{company}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Primary Account Holder: {name}</span>
              </div>
              <p className="pt-2 border-t border-slate-200 text-slate-500 leading-relaxed">
                Need to add secondary billing contacts or update direct debit mandates? Contact your Brightloop account executive.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

