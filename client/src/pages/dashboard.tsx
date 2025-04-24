import React from "react";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { PatientMonitoring } from "@/components/dashboard/patient-monitoring";
import { HealthDataChart } from "@/components/dashboard/health-data-chart";
import { UpcomingReminders } from "@/components/dashboard/upcoming-reminders";
import { VirtualAssistant } from "@/components/dashboard/virtual-assistant";
import { EducationResources } from "@/components/dashboard/education-resources";

export default function Dashboard() {
  return (
    <div>
      {/* Dashboard Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-semibold text-neutral-800">
          Nursing Dashboard
        </h1>
        <p className="text-neutral-500 mt-1">
          Overview of patient care and staff activities
        </p>
      </div>

      {/* Stats Overview */}
      <StatsOverview />

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Patient Monitoring */}
        <div className="lg:col-span-2 space-y-6">
          <PatientMonitoring />
          <HealthDataChart />
        </div>

        {/* Right Column - Reminders and Chat */}
        <div className="space-y-6">
          <UpcomingReminders />
          <VirtualAssistant />
          <EducationResources />
        </div>
      </div>
    </div>
  );
}
