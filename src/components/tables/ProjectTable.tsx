'use client';

import { useState } from 'react';
import Cookies from 'js-cookie';
import { Pencil, Trash2, PlusCircle, BookOpen, CheckCircle, User } from 'lucide-react';
import { BackofficeDataTable } from "@/components/tables/BackofficeDataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from 'next/navigation';
import ProjectModal from '../modals/ProjectModal';
import Project from '@/interfaces/Project';
import axiosInstance from '@/lib/axios';

interface Props {
  initialData: Project[];
  userRole: string;
  userId: string;
}

export default function ProjectTable({ initialData, userRole, userId }: Props) {
  const [data, setData] = useState(initialData);
  // const [totalRows, setTotalRows] = useState(initialTotalRows);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<Project | null>(null);
  // const [pageSize, setPageSize] = useState(10);
  // const [pageIndex, setPageIndex] = useState(0);
  const router = useRouter();

  const token = Cookies.get('sempoa');

  const columns: ColumnDef<Project>[] = [
    {
      header: 'Project Name',
      accessorKey: 'projectName',
    },
    {
      header: 'Project Code',
      accessorKey: 'projectCode',
    },
    {
      header: 'Status',
      accessorKey: 'status',
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div>
          <button
            onClick={() => {
              setModalData(row.original);
              setIsModalOpen(true);
            }}
            className="text-blue-500 hover:text-blue-700 p-2 border rounded border-gray-200 mr-2"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              router.push(`/projects/${row.original.id}/fields`);
            }}
            className="text-blue-500 hover:text-blue-700 p-2 border rounded border-gray-200 mr-2"
          >
            <BookOpen className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleSetCurrentProject(row.original.id)}
            className="text-blue-500 hover:text-blue-700 p-2 border rounded border-gray-200 mr-2"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              router.push(`/projects/${row.original.id}/members`);
            }}
            className="text-blue-500 hover:text-blue-700 p-2 border rounded border-gray-200 mr-2"
          >
            <User className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDisable(row.original.id)}
            className="text-red-500 hover:text-red-700 p-2 border rounded border-gray-200 mr-2"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleSetCurrentProject = async (id: string) => {
    const endpoint = `/users/${userId}/current-project`;
    try {
      await axiosInstance.patch(endpoint, 
        {
          currentProjectId: id,
        }, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } catch (err) {
      console.error('Error saving:', err);
    }
  }

  const handleAddEdit = async (project: Project) => {
    const endpoint = project.id
      ? `/projects/${project.id}`
      : `/projects`;
    const method = project.id ? 'patch' : 'post';

    try {
      await axiosInstance[method](endpoint, project, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error saving:', err);
    }
  };

  const handleDisable = async (id: string) => {
    try {
      await axiosInstance.delete(`/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const fetchData = () => {
    setLoading(true);
    axiosInstance.get(`/projects`, {
      headers: {
        Authorization: `Bearer ${Cookies.get('sempoa')}`
      }
    })
      .then(res => {
        setData(res.data.data.data);
      })
      .catch(err => console.error('Get error:', err))
      .finally(() => setLoading(false));
  };

  // const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
  //   const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
  //   setPageIndex(next.pageIndex);
  //   setPageSize(next.pageSize);
  //   fetchData(next.pageIndex);
  // };

  return (
    <div className="w-full bg-white rounded-lg p-2">
      <button
        onClick={() => {
          setModalData({} as Project);
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
        <ProjectModal
          data={modalData}
          id={modalData?.id || ""}
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddEdit}
          userRole={userRole}
        />
      )}
    </div>
  );
}