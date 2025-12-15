import { CRMLayout } from "@/components/crm/CRMLayout";
import AdminScriptsTab from "@/components/admin/AdminScriptsTab";

const CRMScripts = () => {
  return (
    <CRMLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Voice Agent Scripts</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage scripts for your AI voice agents
          </p>
        </div>
        <AdminScriptsTab />
      </div>
    </CRMLayout>
  );
};

export default CRMScripts;
