import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/ui/stat-card";
import { UserRound, CalendarCheck, Bell, MessageSquare, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsOverview() {
  const { data: patients, isLoading: isLoadingPatients } = useQuery<any[]>({
    queryKey: ["/api/patients"],
  });
  
  const { data: reminders, isLoading: isLoadingReminders } = useQuery<any[]>({
    queryKey: ["/api/reminders", { upcoming: true }],
  });
  
  const { data: messages, isLoading: isLoadingMessages } = useQuery<any[]>({
    queryKey: ["/api/messages"],
  });
  
  const isLoading = isLoadingPatients || isLoadingReminders || isLoadingMessages;
  
  // Calculate unread messages
  const unreadMessages = messages?.filter(m => !m.isBot)?.length || 0;
  
  // Count reminders needing attention (those due today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const remindersNeedingAttention = reminders?.filter(reminder => {
    const reminderDate = new Date(reminder.dueTime);
    reminderDate.setHours(0, 0, 0, 0);
    return reminderDate.getTime() === today.getTime();
  })?.length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {isLoading ? (
        // Loading skeletons
        Array(4).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-5 border border-neutral-100">
            <div className="flex items-center">
              <Skeleton className="h-12 w-12 rounded-md" />
              <div className="ml-4 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
            <Skeleton className="h-3 w-32 mt-2" />
          </div>
        ))
      ) : (
        <>
          <StatCard
            title="Active Patients"
            value={patients?.length || 0}
            icon={UserRound}
            changeText="8% from last week"
            changeValue={8}
            iconBgColor="bg-primary-light bg-opacity-10"
            iconColor="text-primary"
          />
          
          <StatCard
            title="Appointments"
            value={12}
            icon={CalendarCheck}
            changeText="3% from yesterday"
            changeValue={3}
            iconBgColor="bg-secondary-light bg-opacity-10"
            iconColor="text-secondary"
          />
          
          <StatCard
            title="Reminders"
            value={reminders?.length || 0}
            icon={Bell}
            changeText={`${remindersNeedingAttention} need attention`}
            changeValue={remindersNeedingAttention > 0 ? 1 : 0}
            iconBgColor="bg-accent-light bg-opacity-10"
            iconColor="text-accent"
          />
          
          <StatCard
            title="Messages"
            value={messages?.length || 0}
            icon={MessageSquare}
            changeText={`${unreadMessages} unread`}
            changeValue={unreadMessages > 0 ? 1 : 0}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-500"
          />
        </>
      )}
    </div>
  );
}
