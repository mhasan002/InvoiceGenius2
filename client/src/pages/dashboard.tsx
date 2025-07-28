import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardInsights } from '@/components/dashboard/DashboardInsights';

export default function Dashboard() {
  return (
    <DashboardLayout 
      title="Total Insights" 
      description="Overview of your invoice management system"
    >
      <DashboardInsights />
    </DashboardLayout>
  );
}