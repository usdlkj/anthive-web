import TopBar from '@/components/TopBar';
import 'react-datepicker/dist/react-datepicker.css';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <TopBar />

      {/* Page Content */}
      <main className="flex-1 p-6 bg-gray-100 border-r border-b border-l border-gray-200">{children}</main>
    </div>
  );
}