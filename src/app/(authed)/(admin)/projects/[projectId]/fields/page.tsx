import { cookies } from 'next/headers';
import { getUserFromServerToken } from '@/lib/server/getUserFromToken';
import { DatatableProps } from '@/interfaces/DatatableProps';
import ProjectFieldTable from '@/components/tables/ProjectFieldTable';
import ProjectField from '@/interfaces/ProjectField';
import axiosInstance from '@/lib/axios';
import { getApiBaseUrl } from '@/lib/api';

async function fetchData(projectId: string) {
  const cookiesObject = await cookies();
  const token = cookiesObject.get('sempoa')?.value;

  if (!token) {
    console.error('Missing authentication token');
    return { data: [], totalRows: 0 };
  }

  try {
    const res = await axiosInstance.get(
      `${getApiBaseUrl()}/project-fields?projectId=${projectId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const json: DatatableProps<ProjectField, unknown> = res.data;
    return {
      data: json.data,
      totalRows: json.recordsTotal // match backend return
    };

  } catch (error) {
    console.error('Fetch error:', error);
    return { data: [], totalRows: 0 };
  }
}

export default async function ProjectFieldsPage({ params }: any) {
  const { projectId } = await params;
  const { data, totalRows } = await fetchData(projectId);
  const user = await getUserFromServerToken();
  const role = user?.role ?? "USER";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-kcicGray">
      <h1 className="text-2xl font-bold mb-4 text-kcicBlack">Project Fields</h1>
      <ProjectFieldTable initialData={data} userRole={role} projectId={projectId} />
    </div>
  );
}
