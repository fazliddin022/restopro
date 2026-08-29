import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <Sidebar role={session.user.role || "waiter"} name={session.user.name || ""} />
      <div className="flex-1 ml-64 p-8">
        {children}
      </div>
    </div>
  );
}