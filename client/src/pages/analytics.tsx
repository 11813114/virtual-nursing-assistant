import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  BarChart2, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Users, 
  Clock, 
  Heart, 
  Activity, 
  Calendar, 
  Download 
} from "lucide-react";

interface HealthMetric {
  id: number;
  metricType: string;
  date: string;
  value: number;
  change: number;
}

export default function Analytics() {
  const [timeRange, setTimeRange] = React.useState<"7" | "30" | "90">("7");

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

  // Format data for charts
  const formatChartData = (data?: HealthMetric[]) => {
    if (!data || data.length === 0) return [];
    
    return data.map(metric => ({
      date: new Date(metric.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: metric.value,
    }));
  };

  const bloodPressureChartData = formatChartData(bloodPressureData);
  const glucoseChartData = formatChartData(glucoseData);
  const medicationAdherenceChartData = formatChartData(medicationAdherenceData);

  // Patient status distribution data (mock data for visualization)
  const patientStatusData = [
    { name: "Stable", value: 25, color: "#4CAF50" },
    { name: "Monitoring", value: 12, color: "#F59E0B" },
    { name: "Needs Attention", value: 5, color: "#DC2626" }
  ];

  // Care activity data (mock data for visualization)
  const careActivityData = [
    { name: "Medication", count: 42 },
    { name: "Vital Checks", count: 28 },
    { name: "General Care", count: 16 },
    { name: "Nutrition", count: 10 }
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-neutral-800">
            Analytics
          </h1>
          <p className="text-neutral-500 mt-1">
            Health trends and patient data insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as "7" | "30" | "90")}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Health Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Heart className="h-5 w-5 mr-2 text-primary" />
              Blood Pressure
            </CardTitle>
            <CardDescription>Average systolic over time</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoadingBP ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={bloodPressureChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#1976D2" 
                    strokeWidth={2} 
                    dot={{ r: 3 }} 
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <div className="text-sm">
              <span className="font-medium">Latest: </span>
              {isLoadingBP ? (
                <Skeleton className="h-4 w-16 inline-block" />
              ) : (
                bloodPressureChartData.length > 0 && (
                  <span>
                    {bloodPressureChartData[bloodPressureChartData.length - 1].value} mmHg
                  </span>
                )
              )}
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Activity className="h-5 w-5 mr-2 text-secondary" />
              Glucose Levels
            </CardTitle>
            <CardDescription>Average glucose readings</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoadingGlucose ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={glucoseChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#26A69A" 
                    strokeWidth={2} 
                    dot={{ r: 3 }} 
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <div className="text-sm">
              <span className="font-medium">Latest: </span>
              {isLoadingGlucose ? (
                <Skeleton className="h-4 w-16 inline-block" />
              ) : (
                glucoseChartData.length > 0 && (
                  <span>
                    {glucoseChartData[glucoseChartData.length - 1].value} mg/dL
                  </span>
                )
              )}
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-accent" />
              Medication Adherence
            </CardTitle>
            <CardDescription>Percentage of medications taken</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoadingMA ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={medicationAdherenceChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4CAF50" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <div className="text-sm">
              <span className="font-medium">Average: </span>
              {isLoadingMA ? (
                <Skeleton className="h-4 w-16 inline-block" />
              ) : (
                medicationAdherenceChartData.length > 0 && (
                  <span>
                    {Math.round(
                      medicationAdherenceChartData.reduce((acc, curr) => acc + curr.value, 0) / 
                      medicationAdherenceChartData.length
                    )}%
                  </span>
                )
              )}
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Patient Status and Care Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChartIcon className="h-5 w-5 mr-2 text-primary" />
              Patient Status Distribution
            </CardTitle>
            <CardDescription>
              Current status of monitored patients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={patientStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {patientStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} patients`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full flex justify-around">
              {patientStatusData.map((entry, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-1"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-secondary" />
              Care Activity Breakdown
            </CardTitle>
            <CardDescription>
              Distribution of nursing activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={careActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#26A69A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter>
            <div className="text-sm">
              <span className="font-medium">Total Care Activities: </span>
              <span>
                {careActivityData.reduce((acc, curr) => acc + curr.count, 0)}
              </span>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Health Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Health Insights
          </CardTitle>
          <CardDescription>
            Key observations based on patient data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center text-primary mb-2">
                <Heart className="h-5 w-5 mr-2" />
                <h3 className="font-medium">Blood Pressure Trend</h3>
              </div>
              <p className="text-sm text-neutral-600">
                Average patient blood pressure has decreased by 6% over the last {timeRange} days, indicating improved management.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center text-secondary mb-2">
                <Activity className="h-5 w-5 mr-2" />
                <h3 className="font-medium">Glucose Stability</h3>
              </div>
              <p className="text-sm text-neutral-600">
                Glucose levels show more stability with 78% of patients maintaining levels within target range.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center text-accent mb-2">
                <Calendar className="h-5 w-5 mr-2" />
                <h3 className="font-medium">Medication Adherence</h3>
              </div>
              <p className="text-sm text-neutral-600">
                Medication adherence has improved to 92%, a 3% increase compared to the previous period.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center text-amber-500 mb-2">
                <Clock className="h-5 w-5 mr-2" />
                <h3 className="font-medium">Response Time</h3>
              </div>
              <p className="text-sm text-neutral-600">
                Average response time to patient alerts has decreased to 4.2 minutes, improving urgent care delivery.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center text-blue-500 mb-2">
                <Users className="h-5 w-5 mr-2" />
                <h3 className="font-medium">Patient Engagement</h3>
              </div>
              <p className="text-sm text-neutral-600">
                Patient engagement with educational resources has increased by 12%, indicating better health literacy.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center text-purple-500 mb-2">
                <TrendingUp className="h-5 w-5 mr-2" />
                <h3 className="font-medium">Recovery Progress</h3>
              </div>
              <p className="text-sm text-neutral-600">
                Post-discharge recovery rates have improved by 8%, with fewer readmissions observed during this period.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            Generate Detailed Report
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
