import React, { useState } from 'react';
import { Customer, Subscription, Invoice, Payment } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Tabs } from '@/components/ui/tabs';
import { DataTable, Column } from '@/components/common/DataTable';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Building2, Mail, Phone, MapPin, ReceiptText, Repeat, CreditCard } from 'lucide-react';

interface CustomerDetailsCardProps {
  customer: Customer;
  subscriptions: Subscription[];
  invoices: Invoice[];
  payments: Payment[];
  onClose: () => void;
}

export const CustomerDetailsCard: React.FC<CustomerDetailsCardProps> = ({
  customer,
  subscriptions,
  invoices,
  payments,
}) => {
  const [activeTab, setActiveTab] = useState<'subs' | 'invs' | 'pays'>('subs');

  const customerSubs = subscriptions.filter((s) => s.customerId === customer.id);
  const customerInvs = invoices.filter((i) => i.customerId === customer.id);
  const customerPays = payments.filter((p) => p.customerId === customer.id);

  const subColumns: Column<Subscription>[] = [
    { key: 'subscriptionNumber', header: 'Sub Number', sortable: true },
    { key: 'planName', header: 'Plan', sortable: true },
    { key: 'billingInterval', header: 'Interval', render: (r) => <span className="capitalize">{r.billingInterval}</span> },
    { key: 'amount', header: 'Amount', align: 'right', render: (r) => formatCurrency(r.amount) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const invColumns: Column<Invoice>[] = [
    { key: 'invoiceNumber', header: 'Invoice #', sortable: true },
    { key: 'invoiceDate', header: 'Date', render: (r) => formatDate(r.invoiceDate) },
    { key: 'dueDate', header: 'Due Date', render: (r) => formatDate(r.dueDate) },
    { key: 'totalAmount', header: 'Total', align: 'right', render: (r) => formatCurrency(r.totalAmount) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const payColumns: Column<Payment>[] = [
    { key: 'transactionId', header: 'Transaction ID', sortable: true },
    { key: 'paymentDate', header: 'Date', render: (r) => formatDate(r.paymentDate) },
    { key: 'paymentMethod', header: 'Method' },
    { key: 'amount', header: 'Amount', align: 'right', render: (r) => formatCurrency(r.amount) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <Card className="mt-6 border-blue-200/80 shadow-md">
      <CardHeader className="bg-slate-50/70 border-b border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div>
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl">{customer.name}</CardTitle>
              <StatusBadge status={customer.status} />
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{customer.company}</span>
              {customer.taxNumber && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="font-mono">GST: {customer.taxNumber}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[11px] text-slate-400 font-semibold uppercase">Subscriptions</p>
              <p className="text-lg font-bold text-slate-900">{customerSubs.length}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-slate-400 font-semibold uppercase">Total Revenue</p>
              <p className="text-lg font-bold text-emerald-600">{formatCurrency(customer.totalRevenue)}</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Contact details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{customer.email}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{customer.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{customer.city}, {customer.country} ({customer.postalCode})</span>
          </div>
        </div>

        {/* Tabbed Activity Tables */}
        <div>
          <Tabs
            variant="pills"
            activeTab={activeTab}
            onChange={(tab) => setActiveTab(tab as any)}
            tabs={[
              { id: 'subs', label: 'Subscription History', badge: customerSubs.length, icon: <Repeat className="w-3.5 h-3.5" /> },
              { id: 'invs', label: 'Invoices', badge: customerInvs.length, icon: <ReceiptText className="w-3.5 h-3.5" /> },
              { id: 'pays', label: 'Payment Receipts', badge: customerPays.length, icon: <CreditCard className="w-3.5 h-3.5" /> },
            ]}
          />

          <div className="mt-4">
            {activeTab === 'subs' && (
              <DataTable
                columns={subColumns}
                data={customerSubs}
                keyExtractor={(s) => s.id}
                emptyTitle="No subscriptions found"
                emptyDescription="This customer has not activated any subscription plans yet."
              />
            )}
            {activeTab === 'invs' && (
              <DataTable
                columns={invColumns}
                data={customerInvs}
                keyExtractor={(i) => i.id}
                emptyTitle="No invoices found"
                emptyDescription="No invoices have been billed to this customer."
              />
            )}
            {activeTab === 'pays' && (
              <DataTable
                columns={payColumns}
                data={customerPays}
                keyExtractor={(p) => p.id}
                emptyTitle="No payments recorded"
                emptyDescription="No payment transactions recorded for this customer yet."
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

