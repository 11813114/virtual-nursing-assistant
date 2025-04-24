import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { UserRound, Plus, Search, Filter, ArrowUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Patient {
  id: number;
  patientId: string;
  name: string;
  avatar?: string;
  condition: string;
  status: string;
  notes?: string;
}

export default function Patients() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");
  
  const { data: patients, isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  // Filter and sort patients
  const filteredPatients = React.useMemo(() => {
    if (!patients) return [];
    
    return patients
      .filter((patient) => {
        // Apply search filter
        const matchesSearch = !searchQuery || 
          patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.condition.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Apply status filter
        const matchesStatus = !statusFilter || patient.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        // Apply sorting
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        
        if (sortOrder === "asc") {
          return nameA > nameB ? 1 : -1;
        } else {
          return nameA < nameB ? 1 : -1;
        }
      });
  }, [patients, searchQuery, statusFilter, sortOrder]);

  const handleToggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };
  
  const handleStatusFilterChange = (status: string | null) => {
    setStatusFilter(status);
  };

  const renderPatientStatusBadge = (status: string) => {
    return (
      <span className={`patient-status-badge ${getStatusColor(status)}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-semibold text-neutral-800">
          Patients
        </h1>
        <p className="text-neutral-500 mt-1">
          View and manage patient information
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
              <Input
                type="search"
                placeholder="Search patients by name, ID, or condition..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all" className="px-4">
            <TabsList>
              <TabsTrigger 
                value="all" 
                onClick={() => handleStatusFilterChange(null)}
              >
                All Patients
              </TabsTrigger>
              <TabsTrigger 
                value="stable"
                onClick={() => handleStatusFilterChange("stable")}
              >
                Stable
              </TabsTrigger>
              <TabsTrigger 
                value="monitor"
                onClick={() => handleStatusFilterChange("monitor")}
              >
                Monitor
              </TabsTrigger>
              <TabsTrigger 
                value="attention"
                onClick={() => handleStatusFilterChange("attention")}
              >
                Needs Attention
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <div className="flex items-center cursor-pointer" onClick={handleToggleSortOrder}>
                      Patient
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Patient ID</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeleton
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-20 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <UserAvatar
                            name={patient.name}
                            imageUrl={patient.avatar}
                            className="h-10 w-10 mr-3"
                          />
                          <div>
                            <p className="font-medium">{patient.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{patient.condition}</TableCell>
                      <TableCell>
                        {renderPatientStatusBadge(patient.status)}
                      </TableCell>
                      <TableCell>{patient.patientId}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            window.location.href = `/patients/${patient.id}`;
                          }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-neutral-500">
                      No patients found. Try adjusting your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {!isLoading && filteredPatients.length > 0 && (
          <CardFooter className="flex items-center justify-between border-t p-4">
            <p className="text-sm text-neutral-500">
              Showing {filteredPatients.length} of {patients?.length || 0} patients
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Status Distribution</CardTitle>
            <CardDescription>
              Overview of current patient status categories
            </CardDescription>
          </CardHeader>
          <CardContent className="h-60 flex items-center justify-center">
            {isLoading ? (
              <Skeleton className="h-full w-full rounded-md" />
            ) : (
              <div className="text-center text-neutral-500">
                <UserRound className="h-12 w-12 mx-auto mb-2 text-primary opacity-50" />
                <p>Patient status visualization will be shown here</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recently Updated Patients</CardTitle>
            <CardDescription>
              Patients with recent status changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPatients.length > 0 ? (
              <div className="space-y-4">
                {filteredPatients.slice(0, 3).map((patient) => (
                  <div key={patient.id} className="flex items-center">
                    <UserAvatar
                      name={patient.name}
                      imageUrl={patient.avatar}
                      className="h-10 w-10 mr-3"
                    />
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-neutral-500">
                        {renderPatientStatusBadge(patient.status)}{' '}
                        <span className="ml-2">{patient.condition}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-neutral-500 py-4">
                No patient updates found
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
