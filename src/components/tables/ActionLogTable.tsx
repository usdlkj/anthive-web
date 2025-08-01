'use client';

import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { ColumnDef } from "@tanstack/react-table";
import { OnChangeFn, PaginationState } from '@tanstack/react-table';
import { BackofficeDataTable } from "@/components/tables/BackofficeDataTable";
import { formatWibDate } from '@/lib/formatters';
import { ActionLog } from '@/interfaces/ActionLog';
import ActionLogModal from '../modals/ActionLogModal';

interface Props {
  initialData: ActionLog[];
  initialTotalRows: number;
  initialTotalPages: number;
}

export default function ActionLogTable({ initialData, initialTotalRows, initialTotalPages }: Props) {
  const [data, setData] = useState(initialData);
  const [total, setTotal] = useState(initialTotalRows);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<ActionLog | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const token = Cookies.get('whoosh');

  const columns: ColumnDef<ActionLog>[] = [
    {
      accessorKey: 'userName',
      header: 'User',
    },
    {
      accessorKey: 'action',
      header: 'Action',
    },
    {
      accessorKey: 'resourceType',
      header: 'Resource Type',
    },
    {
      accessorKey: 'resourceId',
      header: 'Resource ID',
    },
    {
      accessorFn: (row) => formatWibDate(row.timestamp),
      id: 'timestamp',
      header: 'Timestamp',
    },
  ];

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const fetchData = (page: number, filterText = '') => {
    setLoading(true);
    axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/action-logs?page=${page + 1}&limit=${limit}&action=${filterText}`, {
      headers: {
        Authorization: `Bearer ${Cookies.get('whoosh')}`
      }
    })
      .then(res => {
        const ret = res.data.data;
        setData(ret.data);
        setTotal(ret.total);
        setTotalPages(ret.totalPages);
      })
      .catch(err => console.error('Get error:', err))
      .finally(() => setLoading(false));
  };

  const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: page, pageSize: limit }) : updater;
    setPage(next.pageIndex);
    setLimit(next.pageSize);
    fetchData(next.pageIndex, filter);
  };

  return (
    <div className="w-full max-w-6xl bg-white rounded-lg p-2">
      <section className="space-y-4">
        <BackofficeDataTable
          columns={columns}
          data={data}
          pageCount={totalPages}
          pageIndex={page}
          pageSize={limit}
          onPaginationChange={handlePaginationChange}
          manualPagination={true}
          onFilterChange={(text) => {
            setFilter(text);
            setPage(0);
            fetchData(0, text);
          }}
          globalFilter={filter}
        />
      </section>

      <ActionLogModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        logData={selectedLog}
      />
    </div>
  );
}