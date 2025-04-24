import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { calculateReminderTimeLabel, getReminderIcon } from "@/lib/utils";
import { Plus } from "lucide-react";

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

export function UpcomingReminders() {
  const queryClient = useQueryClient();

  const { data: reminders, isLoading } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders", { upcoming: true, limit: 4 }],
  });

  const completeReminderMutation = useMutation({
    mutationFn: async (reminderId: number) => {
      await apiRequest("PATCH", `/api/reminders/${reminderId}/complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
    },
  });

  const handleCompleteReminder = (id: number) => {
    completeReminderMutation.mutate(id);
  };

  // Use this function to determine the appearance of the time label
  const getTimeTextColor = (urgency: "now" | "soon" | "later") => {
    switch (urgency) {
      case "now":
        return "text-destructive font-medium";
      case "soon":
        return "text-amber-500 font-medium";
      default:
        return "text-neutral-500 font-medium";
    }
  };

  return (
    <Card>
      <CardHeader className="px-5 py-4 border-b border-neutral-100 flex justify-between items-center">
        <CardTitle className="font-heading font-semibold text-neutral-800">
          Upcoming Reminders
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary-dark transition-colors p-0 h-auto"
        >
          <Plus className="h-4 w-4 mr-1" />
          New
        </Button>
      </CardHeader>

      <CardContent className="px-5 py-3">
        {isLoading ? (
          <div className="space-y-4">
            {Array(4)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="py-3 flex items-start">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <div className="ml-3 space-y-2 flex-1">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {reminders && reminders.length > 0 ? (
              reminders.map((reminder) => {
                const { icon, bgColor, textColor } = getReminderIcon(reminder.type);
                const { text: timeText, urgency } = calculateReminderTimeLabel(reminder.dueTime);
                
                return (
                  <li
                    key={reminder.id}
                    className="reminder-item group"
                    onClick={() => handleCompleteReminder(reminder.id)}
                  >
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
                        <p className="text-sm font-medium">{reminder.title}</p>
                        <span className={`text-xs ${getTimeTextColor(urgency)}`}>
                          {timeText}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">
                        {reminder.description}
                      </p>
                      <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-primary hover:text-primary-dark"
                        >
                          Mark as completed
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="py-3 text-center text-neutral-500 text-sm">
                No upcoming reminders
              </li>
            )}
          </ul>
        )}
      </CardContent>

      <CardFooter className="px-5 py-3 border-t border-neutral-100">
        <Button
          variant="ghost"
          className="w-full py-2 text-sm text-primary hover:text-primary-dark transition-colors"
        >
          View All Reminders
        </Button>
      </CardFooter>
    </Card>
  );
}
