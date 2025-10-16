import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";

export default function Planilhados() {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'admin';

  return (
    <DashboardLayout isAdmin={isAdmin}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Planilhados</h1>
          <p className="text-muted-foreground">Dados abertos da planilha</p>
        </div>
        
        <div className="w-full h-[calc(100vh-280px)] border border-border rounded-lg overflow-hidden bg-card">
          <iframe
            src="https://docs.google.com/spreadsheets/d/16Wz8uwMLbbKhWYd4a77rEfIbRiFBwKn87xuMkE5leLQ/edit?rm=minimal&gid=1902108347&single=true&widget=true&headers=false"
            className="w-full h-full"
            title="Planilhados Spreadsheet"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
