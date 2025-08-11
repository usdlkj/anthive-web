'use client';

import { useState } from 'react';
import Cookies from 'js-cookie';
import { Trash2, PlusCircle } from 'lucide-react';
import { BackofficeDataTable } from "@/components/tables/BackofficeDataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import ProjectMemberModal from '../modals/ProjectMemberModal';
import ProjectMember from '@/interfaces/ProjectMember';

interface Props {
  initialData: ProjectMember[];
  userRole: string;
  projectId: string;
}

export default function ProjectMemberTable({ initialData, userRole, projectId }: Props) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<ProjectMember | null>(null);
  const router = useRouter();

  const token = Cookies.get('sempoa');

  const columns: ColumnDef<ProjectMember>[] = [
    {
      header: 'Company',
      accessorKey: 'user.companyName',
    },
    {
      header: 'User',
      accessorKey: 'user.name',
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div>
          <>
            <button
              onClick={() => handleDelete(row.original.id)}
              className="text-red-500 hover:text-red-700 p-2 border rounded border-gray-200 mr-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        </div>
      ),
    },
  ];

  const handleAdd = async (member: ProjectMember) => {
    try {
      await axiosInstance.post(`/project-members`, member, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/project-members/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const fetchData = () => {
    setLoading(true);
    axiosInstance.get(`/project-members?projectId=${projectId}`, {
      headers: { Authorization: `Bearer ${Cookies.get('sempoa')}` }
    })
      .then(res => {
        setData(res.data);
      })
      .catch(err => console.error('Get error:', err))
      .finally(() => setLoading(false));
  };

  return (
    <div className="w-full bg-white rounded-lg p-2">
      <button
        onClick={() => {
          setModalData({} as ProjectMember);
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
        <ProjectMemberModal
          data={modalData}
          id={modalData?.id || ""}
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAdd}
          userRole={userRole}
          projectId={projectId}
        />
      )}
    </div>
  );
}