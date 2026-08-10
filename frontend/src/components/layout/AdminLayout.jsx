import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0d0106] via-[#1a0210] to-[#0d0106]">
      <AdminSidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}