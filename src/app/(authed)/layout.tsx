import TopBar from '@/components/TopBar';
import 'react-datepicker/dist/react-datepicker.css';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import axiosInstance from '@/lib/axios';

type User = {
  id: string;
  name?: string;
  email?: string;
  currentProjectId?: string | null;
};

async function getUser(): Promise<User | null> {
  try {
    const token = (await cookies()).get('sempoa')?.value;
    if (!token) return null;

    const res = await axiosInstance.get('/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

    return res.data as User;
  } catch (e) {
    console.error('Error fetching user:', e);
    return null;
  }
}

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) {
    // Not authenticated; send to login
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <TopBar user={user} />

      {/* Page Content */}
      <main className="flex-1 p-6 bg-gray-100 border-r border-b border-l border-gray-200">{children}</main>
    </div>
  );
}