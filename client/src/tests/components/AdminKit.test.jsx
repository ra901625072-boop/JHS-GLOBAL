import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from '../../admin/components/DataTable';
import { FilterBar } from '../../admin/components/FilterBar';
import { AdminStatusBadge } from '../../admin/components/AdminStatusBadge';

describe('Admin Component Kit Suite', () => {
  describe('DataTable Component', () => {
    const sampleColumns = [
      { key: 'ref', label: 'Reference No', sortable: true },
      { key: 'company', label: 'Company Name' },
      { key: 'status', label: 'Status', render: (val) => <span data-testid="status-cell">{val}</span> },
    ];

    const sampleData = [
      { id: 1, ref: 'RFQ-2026-000001', company: 'Bavaria Extracts', status: 'new' },
      { id: 2, ref: 'RFQ-2026-000002', company: 'Gulf Trade FZE', status: 'quoted' },
    ];

    it('renders column headers and row items correctly', () => {
      render(
        <DataTable
          columns={sampleColumns}
          data={sampleData}
          totalCount={2}
        />
      );

      expect(screen.getByText('Reference No')).toBeInTheDocument();
      expect(screen.getByText('Company Name')).toBeInTheDocument();
      expect(screen.getByText('Bavaria Extracts')).toBeInTheDocument();
      expect(screen.getByText('Gulf Trade FZE')).toBeInTheDocument();
      expect(screen.getAllByTestId('status-cell').length).toBe(2);
    });

    it('displays custom empty message when no records exist', () => {
      render(
        <DataTable
          columns={sampleColumns}
          data={[]}
          emptyMessage="No pending inquiries in queue"
        />
      );

      expect(screen.getByText('No pending inquiries in queue')).toBeInTheDocument();
    });

    it('triggers onSort callback when sortable column header is clicked', () => {
      const handleSort = vi.fn();
      render(
        <DataTable
          columns={sampleColumns}
          data={sampleData}
          onSort={handleSort}
        />
      );

      fireEvent.click(screen.getByText('Reference No'));
      expect(handleSort).toHaveBeenCalledWith('ref');
    });

    it('handles pagination navigation clicks', () => {
      const handlePageChange = vi.fn();
      render(
        <DataTable
          columns={sampleColumns}
          data={sampleData}
          page={1}
          totalPages={3}
          totalCount={6}
          onPageChange={handlePageChange}
        />
      );

      const nextButton = screen.getByRole('button', { name: /next page/i });
      fireEvent.click(nextButton);
      expect(handlePageChange).toHaveBeenCalledWith(2);
    });

    it('handles row selection checkboxes', () => {
      const handleSelectRow = vi.fn();
      const handleSelectAll = vi.fn();

      render(
        <DataTable
          columns={sampleColumns}
          data={sampleData}
          selectable
          selectedRows={[1]}
          onSelectRow={handleSelectRow}
          onSelectAll={handleSelectAll}
        />
      );

      const selectAllBox = screen.getByRole('checkbox', { name: /select all rows/i });
      fireEvent.click(selectAllBox);
      expect(handleSelectAll).toHaveBeenCalled();

      const rowCheckboxes = screen.getAllByRole('checkbox');
      fireEvent.click(rowCheckboxes[2]); // second row (id: 2)
      expect(handleSelectRow).toHaveBeenCalledWith(2);
    });
  });

  describe('FilterBar Component', () => {
    const statusOptions = [
      { id: 'all', label: 'All Inquiries', count: 10 },
      { id: 'new', label: 'New', count: 3 },
      { id: 'quoted', label: 'Quoted', count: 4 },
    ];

    it('renders search input and responds to input changes', () => {
      const handleSearch = vi.fn();
      render(
        <FilterBar
          searchQuery="Curcumin"
          onSearchChange={handleSearch}
          statusOptions={statusOptions}
        />
      );

      const searchInput = screen.getByDisplayValue('Curcumin');
      fireEvent.change(searchInput, { target: { value: 'Castor' } });
      expect(handleSearch).toHaveBeenCalledWith('Castor');
    });

    it('renders status pills with count badges and handles status selection', () => {
      const handleStatusChange = vi.fn();
      render(
        <FilterBar
          statusOptions={statusOptions}
          selectedStatus="new"
          onStatusChange={handleStatusChange}
        />
      );

      expect(screen.getByText('All Inquiries')).toBeInTheDocument();
      expect(screen.getByText('New')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Quoted'));
      expect(handleStatusChange).toHaveBeenCalledWith('quoted');
    });

    it('renders reset button when filters are active and triggers onClear', () => {
      const handleClear = vi.fn();
      render(
        <FilterBar
          searchQuery="Test query"
          selectedStatus="new"
          statusOptions={statusOptions}
          onClear={handleClear}
        />
      );

      const resetButton = screen.getByRole('button', { name: /reset/i });
      expect(resetButton).toBeInTheDocument();
      fireEvent.click(resetButton);
      expect(handleClear).toHaveBeenCalled();
    });
  });

  describe('AdminStatusBadge Component', () => {
    it('renders semantic status labels and accessibility dots', () => {
      const { rerender } = render(<AdminStatusBadge status="new" />);
      expect(screen.getByText('New')).toBeInTheDocument();

      rerender(<AdminStatusBadge status="quoted" />);
      expect(screen.getByText('Quoted')).toBeInTheDocument();

      rerender(<AdminStatusBadge status="won" />);
      expect(screen.getByText('Won')).toBeInTheDocument();

      rerender(<AdminStatusBadge status="spam" />);
      expect(screen.getByText('Spam')).toBeInTheDocument();
    });

    it('renders priority badges accurately', () => {
      const { rerender } = render(<AdminStatusBadge priority="hot" />);
      expect(screen.getByText('hot')).toBeInTheDocument();

      rerender(<AdminStatusBadge priority="warm" />);
      expect(screen.getByText('warm')).toBeInTheDocument();

      rerender(<AdminStatusBadge priority="cold" />);
      expect(screen.getByText('cold')).toBeInTheDocument();
    });
  });
});
