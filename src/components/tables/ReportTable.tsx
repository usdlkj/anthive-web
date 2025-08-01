'use client';

import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { PlusCircle } from 'lucide-react';
import { ColumnDef } from "@tanstack/react-table";
import { OnChangeFn, PaginationState } from '@tanstack/react-table';
import { BackofficeDataTable } from "@/components/tables/BackofficeDataTable";
import Report from '@/interfaces/Report';

interface Props {
  initialData: Report[];
  initialTotalRows: number;
}

export default function ReportTable({ initialData, initialTotalRows }: Props) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(initialTotalRows);
  const [pageIndex, setPageIndex] = useState(0);

  const [isRecreateModalOpen, setIsRecreateModalOpen] = useState(false);
  const [newReportType, setNewReportType] = useState('');
  const [newReportDate, setNewReportDate] = useState('');

  const token = Cookies.get('whoosh');

  const columns: ColumnDef<Report>[] = [
    { 
      accessorKey: 'reportTitle',
      header: 'Report Title',
    },
    { 
      accessorKey: 'reportType',
      header: 'Report Type',
    },
    { 
      accessorKey: 'createdAt',
      header: 'Report Date',
      cell: info => {
        const row = info.row.original;
        const localDate = new Date(row.createdAt);
        localDate.setHours(localDate.getHours() + 7); // Convert to GMT+7 (WIB)
        return localDate.toLocaleString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    },
    { 
      accessorKey: 'status',
      header: 'Status',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: info => {
        const row = info.row.original;
        return (
          <div className="flex gap-2">
            <button 
              onClick={() => handleDownload(row.id)}
              className="text-sm px-2 py-1 border rounded hover:bg-gray-100"
              title="Download"
            >
              ⬇️
            </button>
            <button 
              onClick={() => {
                if (confirm('Are you sure you want to delete this report?')) {
                  handleDelete(row.id);
                }
              }}
              className="text-sm px-2 py-1 border rounded hover:bg-gray-100"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        );
      },
    },
  ];

  const handleDownload = async (id: string) => {
    try {
      const response = await axios.get(`/api/report/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Optional: you can set a custom filename
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `report-${id}.xlsx`;

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/report/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData(pageIndex);
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const fetchData = (page: number) => {
    setLoading(true);
    axios.get(`/api/report?currentPage=${page + 1}&pageSize=${pageSize}`, {
      headers: {
        Authorization: `Bearer ${Cookies.get('whoosh')}`
      }
    })
      .then(res => {
        setData(res.data.data.data);
        setTotalRows(res.data.data.recordsFiltered);
      })
      .catch(err => console.error('Get error:', err))
      .finally(() => setLoading(false));
  };

  const handleRecreate = async () => {
    try {
      await axios.post('/api/report', {
        reportType: newReportType,
        reportDate: newReportDate,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      console.log('Report creation triggered');
      fetchData(pageIndex);
    } catch (error) {
      console.error('Failed to recreate report:', error);
    } finally {
      setIsRecreateModalOpen(false);
    }
  };

  const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
    setPageIndex(next.pageIndex);
    setPageSize(next.pageSize);
    fetchData(next.pageIndex);
  };

  return (
    <div className="w-full max-w-6xl bg-white rounded-lg p-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Reports</h2>
        <button
          onClick={() => setIsRecreateModalOpen(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          <PlusCircle className="w-5 h-5 mr-2" /> Recreate Report
        </button>
      </div>

      <section className="space-y-4">
        <BackofficeDataTable
          columns={columns}
          data={data}
          pageCount={Math.ceil(totalRows / pageSize)}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPaginationChange={handlePaginationChange}
        />
      </section>

      {isRecreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md max-w-md w-full flex flex-col gap-y-3">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Recreate Report</h2>
              <p className="text-sm text-gray-500">Select a report type and date to generate a new report.</p>
            </div>
            <div className="space-y-1">
              <label>Report Type</label>
              <select
                value={newReportType}
                onChange={(e) => setNewReportType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select report type</option>
                <option value="Order Report">Order Report</option>
              </select>
            </div>
            <div className="space-y-1">
              <label>Report Date</label>
              <input
                type="date"
                value={newReportDate}
                onChange={(e) => setNewReportDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <hr className="my-4" />
            <div className="flex justify-between gap-2">
              <button
                onClick={() => setIsRecreateModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleRecreate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Recreate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}