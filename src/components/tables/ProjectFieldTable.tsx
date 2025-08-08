'use client';

import { useState } from 'react';
import Cookies from 'js-cookie';
import { Pencil, Trash2, PlusCircle } from 'lucide-react';
import { BackofficeDataTable } from "@/components/tables/BackofficeDataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from 'next/navigation';
import ProjectField from '@/interfaces/ProjectField';
import ProjectFieldModal from '../modals/ProjectFieldModal';
import axiosInstance from '@/lib/axios';

interface Props {
  initialData: ProjectField[];
  userRole: string;
  projectId: string;
}

export default function ProjectFieldTable({ initialData, userRole, projectId }: Props) {
  const [data, setData] = useState(initialData);
  // const [totalRows, setTotalRows] = useState(initialTotalRows);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<ProjectField | null>(null);
  // const [pageSize, setPageSize] = useState(10);
  // const [pageIndex, setPageIndex] = useState(0);
  const router = useRouter();

  const token = Cookies.get('sempoa');

  const columns: ColumnDef<ProjectField>[] = [
    {
      header: 'Field Code',
      accessorKey: 'fieldCode',
    },
    {
      header: 'Field Text',
      accessorKey: 'fieldText',
    },
    {
      header: 'Type',
      accessorKey: 'type',
    },
    {
      header: 'Visible',
      accessorKey: 'visible',
    },
    {
      header: 'Mandatory',
      accessorKey: 'mandatory',
    },
    {
      header: 'Sequence',
      accessorKey: 'sequence',
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div>
          {!row.original.isSystem && (
            <>
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
                onClick={() => handleDisable(row.original.id)}
                className="text-red-500 hover:text-red-700 p-2 border rounded border-gray-200 mr-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const handleAddEdit = async (field: ProjectField) => {
    const endpoint = field.id
      ? `/project-fields/${field.id}`
      : `/project-fields`;
    const method = field.id ? 'patch' : 'post';

    try {
      await axiosInstance[method](endpoint, field, {
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
      await axiosInstance.delete(`/project-fields/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const fetchData = () => {
    setLoading(true);
    axiosInstance.get(`/project-fields?projectId=${projectId}`, {
      headers: { Authorization: `Bearer ${Cookies.get('sempoa')}` }
    })
      .then(res => {
        setData(res.data.data);
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
          setModalData({} as ProjectField);
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
        <ProjectFieldModal
          data={modalData}
          id={modalData?.id || ""}
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddEdit}
          userRole={userRole}
          projectId={projectId}
        />
      )}
    </div>
  );
}