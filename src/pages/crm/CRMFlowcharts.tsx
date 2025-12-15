import { CRMLayout } from "@/components/crm/CRMLayout";
import AdminFlowchartsTab from "@/components/admin/AdminFlowchartsTab";

const CRMFlowcharts = () => {
  return (
    <CRMLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Conversation Flowcharts</h1>
          <p className="text-muted-foreground mt-1">
            Visual gallery of all voice agent conversation flows
          </p>
        </div>
        <AdminFlowchartsTab />
      </div>
    </CRMLayout>
  );
};

export default CRMFlowcharts;
