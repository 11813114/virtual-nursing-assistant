import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { calculateReminderTimeLabel, getReminderIcon, formatDate, formatTime } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Bell, 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  CheckCircle, 
  Filter, 
  ChevronDown,
  Trash
} from "lucide-react";

interface Reminder {
  id: number;
  title: string;
  description: string;
  patientId: number;
  dueTime: string;
  completed: boolean;
  priority: string;
  type: string;
}

interface Patient {
  id: number;
  name: string;
}

// Form schema for creating/editing reminders
const reminderFormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string(),
  patientId: z.number({ required_error: "Please select a patient" }),
  dueTime: z.date({ required_error: "Please select a due date and time" }),
  priority: z.string().default("medium"),
  type: z.string().default("general_care"),
});

export default function Reminders() {
  const queryClient = useQueryClient();
  const [filterCompleted, setFilterCompleted] = React.useState<"all" | "active" | "completed">("all");
  const [filterPriority, setFilterPriority] = React.useState<string | null>(null);
  const [filterType, setFilterType] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isAddReminderOpen, setIsAddReminderOpen] = React.useState(false);

  const { data: reminders, isLoading: isLoadingReminders } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders"],
  });

  const { data: patients, isLoading: isLoadingPatients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const completeReminderMutation = useMutation({
    mutationFn: async (reminderId: number) => {
      await apiRequest("PATCH", `/api/reminders/${reminderId}/complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
    },
  });

  const createReminderMutation = useMutation({
    mutationFn: async (data: z.infer<typeof reminderFormSchema>) => {
      await apiRequest("POST", "/api/reminders", {
        ...data,
        dueTime: data.dueTime.toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      setIsAddReminderOpen(false);
      form.reset();
    },
  });

  // Setup form
  const form = useForm<z.infer<typeof reminderFormSchema>>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      type: "general_care",
    },
  });

  const onSubmit = (data: z.infer<typeof reminderFormSchema>) => {
    createReminderMutation.mutate(data);
  };

  // Filter and group reminders
  const filteredReminders = React.useMemo(() => {
    if (!reminders) return [];
    
    return reminders.filter((reminder) => {
      // Filter by completion status
      if (filterCompleted === "active" && reminder.completed) return false;
      if (filterCompleted === "completed" && !reminder.completed) return false;
      
      // Filter by priority
      if (filterPriority && reminder.priority !== filterPriority) return false;
      
      // Filter by type
      if (filterType && reminder.type !== filterType) return false;
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          reminder.title.toLowerCase().includes(query) ||
          reminder.description.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [reminders, filterCompleted, filterPriority, filterType, searchQuery]);

  // Group reminders by due date
  const groupedReminders = React.useMemo(() => {
    if (!filteredReminders.length) return {};
    
    const grouped: Record<string, Reminder[]> = {};
    
    filteredReminders.forEach((reminder) => {
      const dueDate = new Date(reminder.dueTime);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      let dateKey;
      
      if (dueDate.toDateString() === today.toDateString()) {
        dateKey = "Today";
      } else if (dueDate.toDateString() === tomorrow.toDateString()) {
        dateKey = "Tomorrow";
      } else {
        dateKey = formatDate(dueDate);
      }
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push(reminder);
    });
    
    return grouped;
  }, [filteredReminders]);

  const handleCompleteReminder = (id: number) => {
    completeReminderMutation.mutate(id);
  };

  // Sorting the date keys to ensure Today and Tomorrow appear first
  const sortedDateKeys = React.useMemo(() => {
    if (!groupedReminders) return [];
    
    return Object.keys(groupedReminders).sort((a, b) => {
      if (a === "Today") return -1;
      if (b === "Today") return 1;
      if (a === "Tomorrow") return -1;
      if (b === "Tomorrow") return 1;
      return 0;
    });
  }, [groupedReminders]);

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-neutral-800">
            Reminders
          </h1>
          <p className="text-neutral-500 mt-1">
            Manage and track patient care reminders
          </p>
        </div>
        <Dialog open={isAddReminderOpen} onOpenChange={setIsAddReminderOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Reminder</DialogTitle>
              <DialogDescription>
                Add a new care reminder for a patient.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Medication Check" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Details about the reminder" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="patientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patient</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Patient" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingPatients ? (
                              <SelectItem value="loading" disabled>Loading patients...</SelectItem>
                            ) : patients && patients.length > 0 ? (
                              patients.map((patient) => (
                                <SelectItem key={patient.id} value={patient.id.toString()}>
                                  {patient.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="empty" disabled>No patients found</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dueTime"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Due Date & Time</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={`w-full ${!field.value ? "text-muted-foreground" : ""}`}
                              >
                                {field.value ? (
                                  formatDate(field.value)
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                            <div className="p-3 border-t border-neutral-100">
                              <Label>Time</Label>
                              <div className="flex mt-2">
                                <Select
                                  onValueChange={(value) => {
                                    const date = field.value || new Date();
                                    const [hours, minutes] = value.split(':');
                                    date.setHours(parseInt(hours), parseInt(minutes));
                                    field.onChange(date);
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select time" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from({ length: 24 }).map((_, hour) => (
                                      <React.Fragment key={hour}>
                                        <SelectItem value={`${hour.toString().padStart(2, '0')}:00`}>
                                          {hour.toString().padStart(2, '0')}:00
                                        </SelectItem>
                                        <SelectItem value={`${hour.toString().padStart(2, '0')}:30`}>
                                          {hour.toString().padStart(2, '0')}:30
                                        </SelectItem>
                                      </React.Fragment>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="medication">Medication</SelectItem>
                            <SelectItem value="vital_check">Vital Check</SelectItem>
                            <SelectItem value="general_care">General Care</SelectItem>
                            <SelectItem value="nutrition">Nutrition</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddReminderOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createReminderMutation.isPending}
                  >
                    {createReminderMutation.isPending ? "Creating..." : "Create Reminder"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Status</Label>
              <div className="flex flex-col space-y-2 mt-2">
                <Button 
                  variant={filterCompleted === "all" ? "default" : "outline"} 
                  size="sm" 
                  className="justify-start"
                  onClick={() => setFilterCompleted("all")}
                >
                  All Reminders
                </Button>
                <Button 
                  variant={filterCompleted === "active" ? "default" : "outline"} 
                  size="sm" 
                  className="justify-start"
                  onClick={() => setFilterCompleted("active")}
                >
                  Active
                </Button>
                <Button 
                  variant={filterCompleted === "completed" ? "default" : "outline"} 
                  size="sm" 
                  className="justify-start"
                  onClick={() => setFilterCompleted("completed")}
                >
                  Completed
                </Button>
              </div>
            </div>
            
            <div>
              <Label>Priority</Label>
              <Select 
                onValueChange={(value) => setFilterPriority(value === "all" ? null : value)} 
                defaultValue="all"
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Type</Label>
              <Select 
                onValueChange={(value) => setFilterType(value === "all" ? null : value)} 
                defaultValue="all"
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="vital_check">Vital Check</SelectItem>
                  <SelectItem value="general_care">General Care</SelectItem>
                  <SelectItem value="nutrition">Nutrition</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Search</Label>
              <Input 
                type="search" 
                placeholder="Search reminders..." 
                className="mt-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Reminders List */}
        <div className="lg:col-span-3 space-y-6">
          {isLoadingReminders ? (
            // Loading skeleton
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <Skeleton className="h-10 w-10 rounded-md" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : Object.keys(groupedReminders).length > 0 ? (
            sortedDateKeys.map((dateKey) => (
              <Card key={dateKey}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {dateKey}
                    <Badge variant="outline" className="ml-2">
                      {groupedReminders[dateKey].length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {groupedReminders[dateKey].map((reminder) => {
                      const { icon, bgColor, textColor } = getReminderIcon(reminder.type);
                      return (
                        <li key={reminder.id} className="flex items-start group">
                          <div className={`reminder-icon ${bgColor} ${textColor}`}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d={
                                  icon === "pills"
                                    ? "M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                                    : icon === "stethoscope"
                                    ? "M7 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10 8a1 1 0 01-1 1h-3v3a1 1 0 11-2 0v-3H8a1 1 0 110-2h3V7a1 1 0 112 0v3h3a1 1 0 011 1z"
                                    : icon === "procedures"
                                    ? "M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"
                                    : icon === "utensils"
                                    ? "M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z"
                                    : "M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"
                                }
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className={`text-base font-medium ${reminder.completed ? "line-through text-neutral-400" : ""}`}>
                                  {reminder.title}
                                </p>
                                <p className="text-sm text-neutral-500 mt-1">
                                  {reminder.description}
                                </p>
                                <div className="flex items-center mt-2 text-xs text-neutral-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatTime(reminder.dueTime)}
                                  
                                  <Badge 
                                    variant="outline" 
                                    className={`ml-3 ${
                                      reminder.priority === "high" 
                                        ? "border-red-200 text-red-700 bg-red-50" 
                                        : reminder.priority === "medium"
                                        ? "border-amber-200 text-amber-700 bg-amber-50"
                                        : "border-blue-200 text-blue-700 bg-blue-50"
                                    }`}
                                  >
                                    {reminder.priority.charAt(0).toUpperCase() + reminder.priority.slice(1)}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!reminder.completed ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCompleteReminder(reminder.id)}
                                    className="h-8"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Complete
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8"
                                  >
                                    <Trash className="h-4 w-4 mr-1" />
                                    Remove
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Bell className="h-12 w-12 text-neutral-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Reminders Found</h3>
                <p className="text-neutral-500 mb-4 text-center">
                  {searchQuery || filterPriority || filterType || filterCompleted !== "all"
                    ? "Try adjusting your filters to see more results"
                    : "You don't have any reminders yet. Create your first reminder to get started."}
                </p>
                <Button onClick={() => setIsAddReminderOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Reminder
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
