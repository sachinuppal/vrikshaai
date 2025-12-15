import { CRMLayout } from "@/components/crm/CRMLayout";
import AdminObservabilityTab from "@/components/admin/AdminObservabilityTab";

const CRMObservability = () => {
  return (
    <CRMLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Call Observability</h1>
          <p className="text-muted-foreground mt-1">
            Analyze call quality and agent performance metrics
          </p>
        </div>
        <AdminObservabilityTab />
      </div>
    </CRMLayout>
  );
};

export default CRMObservability;
