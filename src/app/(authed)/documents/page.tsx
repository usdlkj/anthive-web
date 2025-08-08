import { cookies } from 'next/headers';
import { getUserFromServerToken } from '@/lib/server/getUserFromToken';
import DocumentTableClient from '@/components/documents/DocumentClient';
import User from '@/interfaces/User';
import axiosInstance from '@/lib/axios';
import { getApiBaseUrl } from '@/lib/api';

async function fetchData(userId: string) {
  const cookiesObject = await cookies();
  const token = cookiesObject.get('sempoa')?.value;

  if (!token) {
    return { documents: [], fields: [] };
  }

  try {
    const res = await axiosInstance.get(`${getApiBaseUrl()}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const user = res.data as User;
    const [docRes, fieldRes] = await Promise.all([
      axiosInstance.get(`${getApiBaseUrl()}/documents?companyId=01K1MG4N1XYG8V9HTD2WT03TF3&currentPage=1&pageSize=10`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axiosInstance.get(`${getApiBaseUrl()}/project-fields?projectId=${user.currentProjectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);

    return {
      documents: docRes.data.data,
      fields: fieldRes.data.data,
    };
  } catch (error) {
    console.error('Fetch error:', error);
    return { documents: [], fields: [] };
  }
}

export default async function DocumentsPage() {
  const user = await getUserFromServerToken();
  const role = user?.role ?? "USER";
  const userId = user?.userId ?? "ID";
  const { documents, fields } = await fetchData(userId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-kcicGray">
      <h1 className="text-2xl font-bold mb-4 text-kcicBlack">Documents</h1>
      <DocumentTableClient
        documents={documents}
        projectFields={fields}
        userRole={role}
      />
    </div>
  );
}
