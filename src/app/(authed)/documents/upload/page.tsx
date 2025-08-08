// app/documents/create/page.tsx (Server Component)

import DocumentFormClient from '@/components/documents/DocumentFormClient';
import { cookies } from 'next/headers';
import axiosInstance from '@/lib/axios';
import { getApiBaseUrl } from '@/lib/api';
import User from '@/interfaces/User';

export default async function DocumentCreatePage() {
  const token = (await cookies()).get('sempoa')?.value;
  if (!token) return <div>Unauthorized</div>;

  const userRes = await axiosInstance.get(`${getApiBaseUrl()}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const user = userRes.data as User;
  const fieldRes = await axiosInstance.get(`${getApiBaseUrl()}/project-fields?projectId=${user.currentProjectId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return (
    <DocumentFormClient
      fields={fieldRes.data.data}
      initialData={{}} // or document data if editing
    />
  );
}