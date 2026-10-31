import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '@/api/customers.api';
import { subscriptionsApi } from '@/api/subscriptions.api';
import { invoicesApi } from '@/api/invoices.api';
import { paymentsApi } from '@/api/payments.api';
import { Customer } from '@/types';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { FilterDropdown } from '@/components/common/FilterDropdown';
import { DataTable, Column } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dropdown } from '@/components/ui/dropdown';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { CustomerModal } from '@/components/customers/CustomerModal';
import { CustomerDetailsCard } from '@/components/customers/CustomerDetailsCard';
import { formatCurrency } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';
import { Plus, MoreHorizontal, Eye, Edit, Trash2, Building2 } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    if ((location.state as any)?.openCreate) {
      setIsAddModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Queries
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.getAll(),
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => subscriptionsApi.getAll(),
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoicesApi.getAll(),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsApi.getAll(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => customersApi.create(data),
    onSuccess: (newCust) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsAddModalOpen(false);
      success('Customer Created', `${newCust.name} (${newCust.company}) added successfully.`);
    },
    onError: () => error('Error', 'Failed to create customer.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => customersApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setEditingCustomer(null);
      if (selectedCustomer?.id === updated.id) setSelectedCustomer(updated);
      success('Customer Updated', `${updated.name} updated successfully.`);
    },
    onError: () => error('Error', 'Failed to update customer.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setDeletingCustomerId(null);
      if (selectedCustomer?.id === deletingCustomerId) setSelectedCustomer(null);
      success('Customer Deleted', 'Customer record removed.');
    },
    onError: () => error('Error', 'Failed to delete customer.'),
  });

  // Filtering & Pagination
  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch =
      cust.name.toLowerCase().includes(search.toLowerCase()) ||
      cust.company.toLowerCase().includes(search.toLowerCase()) ||
      cust.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cust.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Customer Name',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 block">{row.name}</span>
          <span className="text-[11px] text-slate-400">{row.city}, {row.country}</span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (row) => <span className="text-slate-600">{row.email}</span>,
    },
    {
      key: 'company',
      header: 'Company',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5 font-medium text-slate-800">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.company}</span>
        </div>
      ),
    },
    {
      key: 'subscriptionCount',
      header: 'Subscriptions',
      align: 'center',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
          {row.subscriptionCount}
        </span>
      ),
    },
    {
      key: 'totalRevenue',
      header: 'Total Revenue',
      align: 'right',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-slate-900">{formatCurrency(row.totalRevenue)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <Dropdown
          align="right"
          trigger={
            <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          }
          items={[
            {
              label: 'View Details',
              icon: <Eye className="w-3.5 h-3.5" />,
              onClick: () => setSelectedCustomer(row),
            },
            {
              label: 'Edit Customer',
              icon: <Edit className="w-3.5 h-3.5" />,
              onClick: () => setEditingCustomer(row),
            },
            {
              label: 'Delete Customer',
              icon: <Trash2 className="w-3.5 h-3.5" />,
              danger: true,
              onClick: () => setDeletingCustomerId(row.id),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Manage enterprise accounts, subscriber billing history, and contact contracts."
        actions={
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Customer
          </Button>
        }
      />

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setCurrentPage(1);
          }}
          placeholder="Search by customer, company, or email..."
        />

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <FilterDropdown
            label="Status"
            selectedValue={statusFilter}
            onChange={(v) => {
              setStatusFilter(v);
              setCurrentPage(1);
            }}
            options={[
              { label: 'All Statuses', value: 'all' },
              { label: 'Active Customers', value: 'active' },
              { label: 'Leads', value: 'lead' },
              { label: 'Inactive', value: 'inactive' },
            ]}
          />
        </div>
      </div>

      {/* Customers Data Table */}
      <DataTable
        columns={columns}
        data={paginatedCustomers}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
        onRowClick={(row) => setSelectedCustomer(row)}
        emptyTitle="No customers found"
        emptyDescription="There are no customer accounts matching your current search parameters."
        emptyActionText="Add Customer"
        onEmptyAction={() => setIsAddModalOpen(true)}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={filteredCustomers.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />

      {/* Selected Customer Detailed Inspection View */}
      {selectedCustomer && (
        <CustomerDetailsCard
          customer={selectedCustomer}
          subscriptions={subscriptions}
          invoices={invoices}
          payments={payments}
          onClose={() => setSelectedCustomer(null)}
        />
      )}

      {/* Add Customer Modal */}
      <CustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <CustomerModal
          isOpen={!!editingCustomer}
          initialData={editingCustomer}
          onClose={() => setEditingCustomer(null)}
          onSubmit={(data) => updateMutation.mutate({ id: editingCustomer.id, data })}
          isLoading={updateMutation.isPending}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingCustomerId}
        onClose={() => setDeletingCustomerId(null)}
        title="Delete Customer Account"
        message="Are you sure you want to permanently delete this customer? All historical records will be unlinked."
        confirmText="Delete Customer"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deletingCustomerId && deleteMutation.mutate(deletingCustomerId)}
      />
    </div>
  );
};

