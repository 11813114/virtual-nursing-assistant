import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface HealthMetric {
  id: number;
  metricType: string;
  date: string;
  value: number;
  change: number;
}

type TimeRange = "7" | "30" | "90";
type ChartType = "blood_pressure" | "glucose" | "medication_adherence";

export function HealthDataChart() {
  const [timeRange, setTimeRange] = React.useState<TimeRange>("7");
  const [chartType, setChartType] = React.useState<ChartType>("blood_pressure");

  const { data: bloodPressureData, isLoading: isLoadingBP } = useQuery<HealthMetric[]>({
    queryKey: ["/api/health-metrics", { type: "blood_pressure", days: timeRange }],
  });

  const { data: glucoseData, isLoading: isLoadingGlucose } = useQuery<HealthMetric[]>({
    queryKey: ["/api/health-metrics", { type: "glucose", days: timeRange }],
  });

  const { data: medicationAdherenceData, isLoading: isLoadingMA } = useQuery<HealthMetric[]>({
    queryKey: ["/api/health-metrics", { type: "medication_adherence", days: timeRange }],
  });

  const isLoading = isLoadingBP || isLoadingGlucose || isLoadingMA;

  // Calculate average change for each metric
  const calculateAverageChange = (data?: HealthMetric[]) => {
    if (!data || data.length === 0) return 0;
    const totalChange = data.reduce((acc, curr) => acc + (curr.change || 0), 0);
    return totalChange / data.length;
  };

  const bloodPressureChange = calculateAverageChange(bloodPressureData);
  const glucoseChange = calculateAverageChange(glucoseData);
  const medicationAdherenceChange = calculateAverageChange(medicationAdherenceData);

  // Format the chart data
  const formatChartData = (data?: HealthMetric[]) => {
    if (!data || data.length === 0) return [];
    
    return data.map(metric => ({
      date: new Date(metric.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: metric.value,
    }));
  };

  const chartData = React.useMemo(() => {
    switch (chartType) {
      case "blood_pressure":
        return formatChartData(bloodPressureData);
      case "glucose":
        return formatChartData(glucoseData);
      case "medication_adherence":
        return formatChartData(medicationAdherenceData);
      default:
        return [];
    }
  }, [chartType, bloodPressureData, glucoseData, medicationAdherenceData]);

  // Define chart colors
  const getChartColor = () => {
    switch (chartType) {
      case "blood_pressure":
        return "#1976D2"; // primary
      case "glucose":
        return "#26A69A"; // secondary
      case "medication_adherence":
        return "#4CAF50"; // accent
      default:
        return "#1976D2";
    }
  };

  // Determine if we should use a line or bar chart based on the data type
  const ChartComponent = chartType === "medication_adherence" ? BarChart : LineChart;
  const DataComponent = chartType === "medication_adherence" ? Bar : Line;

  return (
    <Card>
      <CardHeader className="px-5 py-4 border-b border-neutral-100 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
        <CardTitle className="font-heading font-semibold text-neutral-800">
          Health Data Trends
        </CardTitle>
        <div className="flex space-x-2">
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as TimeRange)}
          >
            <SelectTrigger className="w-[150px] text-sm">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ) : (
          <>
            <div className="h-64 border border-neutral-100 rounded-lg overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <ChartComponent
                  data={chartData}
                  margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [`${value}${chartType === "medication_adherence" ? "%" : ""}`]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <DataComponent
                    type="monotone"
                    dataKey="value"
                    fill={getChartColor()}
                    stroke={getChartColor()}
                    strokeWidth={2}
                  />
                </ChartComponent>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div 
                className="p-3 rounded-lg border border-neutral-100 text-center cursor-pointer hover:bg-neutral-50 transition-colors"
                onClick={() => setChartType("blood_pressure")}
              >
                <div className={`text-sm font-medium ${chartType === "blood_pressure" ? "text-primary" : "text-neutral-500"}`}>Blood Pressure</div>
                <div className="mt-1 text-xl font-semibold text-neutral-800 flex items-center justify-center">
                  {bloodPressureChange < 0 ? "↓" : bloodPressureChange > 0 ? "↑" : "—"} {Math.abs(bloodPressureChange)}%
                </div>
              </div>

              <div 
                className="p-3 rounded-lg border border-neutral-100 text-center cursor-pointer hover:bg-neutral-50 transition-colors"
                onClick={() => setChartType("glucose")}
              >
                <div className={`text-sm font-medium ${chartType === "glucose" ? "text-secondary" : "text-neutral-500"}`}>Glucose Levels</div>
                <div className="mt-1 text-xl font-semibold text-neutral-800 flex items-center justify-center">
                  {glucoseChange < 0 ? "↓" : glucoseChange > 0 ? "↑" : "—"} {Math.abs(glucoseChange)}%
                </div>
              </div>

              <div 
                className="p-3 rounded-lg border border-neutral-100 text-center cursor-pointer hover:bg-neutral-50 transition-colors"
                onClick={() => setChartType("medication_adherence")}
              >
                <div className={`text-sm font-medium ${chartType === "medication_adherence" ? "text-accent" : "text-neutral-500"}`}>Medication Adherence</div>
                <div className="mt-1 text-xl font-semibold text-neutral-800">
                  {medicationAdherenceData && medicationAdherenceData.length > 0 
                    ? `${medicationAdherenceData[medicationAdherenceData.length - 1].value}%`
                    : "—"}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
