import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserAvatar } from "@/components/ui/avatar";
import { getStatusColor } from "@/lib/utils";
import { Heart, Stethoscope, HeartPulse } from "lucide-react";

interface Patient {
  id: number;
  patientId: string;
  name: string;
  avatar?: string;
  condition: string;
  status: string;
}

interface PatientVitals {
  heartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  oxygenSaturation?: number;
}

export function PatientMonitoring() {
  const [timeFilter, setTimeFilter] = React.useState<"today" | "all">("today");
  const [currentPage, setCurrentPage] = React.useState(1);
  const patientsPerPage = 3;

  const { data: patients, isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  // Get patient vitals for each patient
  const patientVitals = useQuery<Record<number, PatientVitals>>({
    queryKey: ["/api/patient-vitals"],
    queryFn: async () => {
      if (!patients) return {};
      
      const vitals: Record<number, PatientVitals> = {};
      
      for (const patient of patients) {
        const res = await fetch(`/api/patients/${patient.id}/vital-signs?limit=1`);
        const data = await res.json();
        if (data && data.length > 0) {
          vitals[patient.id] = {
            heartRate: data[0].heartRate,
            bloodPressureSystolic: data[0].bloodPressureSystolic,
            bloodPressureDiastolic: data[0].bloodPressureDiastolic,
            oxygenSaturation: data[0].oxygenSaturation,
          };
        }
      }
      
      return vitals;
    },
    enabled: !!patients,
  });

  // Calculate pagination
  const totalPages = patients ? Math.ceil(patients.length / patientsPerPage) : 0;
  const startIndex = (currentPage - 1) * patientsPerPage;
  const paginatedPatients = patients?.slice(startIndex, startIndex + patientsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Render heart rate icon with appropriate color
  const renderHeartRateIcon = (heartRate?: number) => {
    if (!heartRate) return <Heart className="text-neutral-400 mr-1" size={16} />;
    if (heartRate > 100) return <Heart className="text-destructive mr-1" size={16} />;
    if (heartRate < 60) return <Heart className="text-amber-500 mr-1" size={16} />;
    return <Heart className="text-neutral-400 mr-1" size={16} />;
  };

  // Render blood pressure icon with appropriate color
  const renderBPIcon = (systolic?: number, diastolic?: number) => {
    if (!systolic || !diastolic) return <Stethoscope className="text-neutral-400 mr-1" size={16} />;
    if (systolic > 140 || diastolic > 90) return <Stethoscope className="text-amber-500 mr-1" size={16} />;
    if (systolic > 160 || diastolic > 100) return <Stethoscope className="text-destructive mr-1" size={16} />;
    return <Stethoscope className="text-neutral-400 mr-1" size={16} />;
  };

  // Render oxygen saturation icon with appropriate color
  const renderO2Icon = (o2?: number) => {
    if (!o2) return <HeartPulse className="text-neutral-400 mr-1" size={16} />;
    if (o2 < 95) return <HeartPulse className="text-amber-500 mr-1" size={16} />;
    if (o2 < 90) return <HeartPulse className="text-destructive mr-1" size={16} />;
    return <HeartPulse className="text-neutral-400 mr-1" size={16} />;
  };

  return (
    <Card>
      <CardHeader className="px-5 py-4 border-b border-neutral-100 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
        <CardTitle className="font-heading font-semibold text-neutral-800">
          Patient Monitoring
        </CardTitle>
        <div className="flex space-x-2">
          <Button
            variant={timeFilter === "today" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeFilter("today")}
          >
            Today
          </Button>
          <Button
            variant={timeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeFilter("all")}
          >
            View All
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-5 py-3 overflow-x-auto">
        {isLoading ? (
          <div className="space-y-3">
            {Array(3)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Patient
                </TableHead>
                <TableHead className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Condition
                </TableHead>
                <TableHead className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Vital Signs
                </TableHead>
                <TableHead className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-neutral-100">
              {paginatedPatients && paginatedPatients.length > 0 ? (
                paginatedPatients.map((patient) => {
                  const vitals = patientVitals.data?.[patient.id];

                  return (
                    <TableRow key={patient.id}>
                      <TableCell className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserAvatar
                            name={patient.name}
                            imageUrl={patient.avatar}
                            className="h-8 w-8"
                          />
                          <div className="ml-3">
                            <p className="text-sm font-medium">{patient.name}</p>
                            <p className="text-xs text-neutral-400">{patient.patientId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-3 whitespace-nowrap">
                        <span className="text-sm">{patient.condition}</span>
                      </TableCell>
                      <TableCell className="px-3 py-3 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="flex items-center">
                            {renderHeartRateIcon(vitals?.heartRate)}
                            <span>{vitals?.heartRate || "--"} bpm</span>
                          </div>
                          <div className="flex items-center mt-1">
                            {renderBPIcon(vitals?.bloodPressureSystolic, vitals?.bloodPressureDiastolic)}
                            <span>
                              {vitals?.bloodPressureSystolic || "--"}/
                              {vitals?.bloodPressureDiastolic || "--"}
                            </span>
                          </div>
                          {vitals?.oxygenSaturation && (
                            <div className="flex items-center mt-1">
                              {renderO2Icon(vitals.oxygenSaturation)}
                              <span>O₂ {vitals.oxygenSaturation}%</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-3 whitespace-nowrap">
                        <span className={`patient-status-badge ${getStatusColor(patient.status)}`}>
                          {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="px-3 py-3 whitespace-nowrap text-sm">
                        <Button
                          variant="link"
                          size="sm"
                          className="text-primary hover:text-primary-dark transition-colors h-auto p-0"
                          onClick={() => {
                            window.location.href = `/patients/${patient.id}`;
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-neutral-500">
                    No patients found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {patients && patients.length > patientsPerPage && (
        <CardFooter className="px-5 py-3 border-t border-neutral-100 flex justify-between">
          <span className="text-sm text-neutral-500">
            Showing {startIndex + 1}-{Math.min(startIndex + patientsPerPage, patients.length)} of {patients.length} patients
          </span>
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              className="px-2 py-1 text-sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className="px-2 py-1 text-sm"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="px-2 py-1 text-sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &gt;
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
