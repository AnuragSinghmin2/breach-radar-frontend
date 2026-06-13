import StatsCards from "../components/StatsCards";
import MonitoringWidgets from "../components/MonitoringWidgets";
import ChartSection from "../components/ChartSection";
import BottomSection from "../components/BottomSection";

export default function DashboardPage() {
  return (
    <>
      <StatsCards />
      <MonitoringWidgets />
      <div className="middle-section">
        <ChartSection />
      </div>
      <BottomSection />
    </>
  );
}
