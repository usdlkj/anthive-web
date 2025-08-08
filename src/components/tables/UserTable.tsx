'use client';

import { useState } from 'react';
import Cookies from 'js-cookie';
import { Trash2, PlusCircle } from 'lucide-react';
import UserModal from '../modals/UserModal';
import User from '@/interfaces/User';
import { BackofficeDataTable } from "@/components/tables/BackofficeDataTable";
import { ColumnDef } from "@tanstack/react-table";
import { formatWibDate } from '@/lib/formatters';
import axiosInstance from '@/lib/axios';
import { getApiBaseUrl } from '@/lib/api';

interface Props {
  initialData: User[];
  companyId: string;
  userRole: string;
}

export default function UserTable({ initialData, companyId, userRole }: Props) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<User | null>(null);

  const token = Cookies.get('sempoa');

  const columns: ColumnDef<User>[] = [
    {
      header: 'Name',
      cell: ({ row }) => (
        <button
          onClick={() => {
            setModalData(row.original);
            setIsModalOpen(true);
          }}
          className="text-blue-600 underline hover:text-blue-800"
        >
          {row.original.name}
        </button>
      ),
    },
    {
      header: 'Email',
      accessorKey: 'email',
    },
    {
      header: 'Phone',
      accessorKey: 'phoneNumber',
    },
    {
      header: 'Role',
      accessorKey: 'role',
    },
    {
      header: 'Last Login',
      cell: ({ row }) => (
        <div>
          {formatWibDate(row.original.lastLoginDate)}
        </div>
      ),
    },
    {
      header: 'Status',
      cell: ({ row }) => {
        const isDisabled = row.original.status === 'disabled';
        return (
          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${isDisabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {isDisabled ? 'Disabled' : 'Active'}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div>
          {row.original.role !== 'super' && (
            <button
              onClick={() => handleDisable(row.original.id)}
              className="text-red-500 hover:text-red-700 text-sm p-2 border rounded hover:bg-gray-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const fetchData = () => {
    setLoading(true);
    axiosInstance.get(`${getApiBaseUrl()}/companies/${companyId}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setData(res.data.data);
      })
      .catch(err => console.error('Get error:', err))
      .finally(() => setLoading(false));
  };

  const handleDisable = async (id: string) => {
    try {
      await axiosInstance.delete(`${getApiBaseUrl()}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  return (
    <div className="w-full bg-white rounded-lg p-2">
      <button
        onClick={() => {
          setModalData({
            id: '',
            name: '',
            email: '',
            phoneNumber: '',
            role: '',
            password: '',
            lastLoginDate: '',
            status: 'new',
            companyId: companyId,
          });
          setIsModalOpen(true);
        }}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
      >
        <PlusCircle className="w-5 h-5 mr-2" /> Create
      </button>

      <BackofficeDataTable
        columns={columns}
        data={data}
      />

      {isModalOpen && (
        <UserModal
          open={isModalOpen}
          data={modalData}
          onClose={() => setIsModalOpen(false)}
          onSave={() => {
            fetchData();
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}