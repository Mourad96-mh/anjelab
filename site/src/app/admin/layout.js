import AdminShell from "@/components/admin/AdminShell";
import "./admin.css";

export const metadata = {
  title: { default: "Administration", template: "%s — Admin ANJELAB" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
