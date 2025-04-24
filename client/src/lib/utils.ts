import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ago`;
  } else if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return "Just now";
  }
}

export function calculateReminderTimeLabel(dueTime: string | Date): { text: string; urgency: "now" | "soon" | "later" } {
  const now = new Date();
  const dueDate = new Date(dueTime);
  const diff = dueDate.getTime() - now.getTime();
  
  // If due time is in the past, return "Now"
  if (diff <= 0) {
    return { text: "Now", urgency: "now" };
  }
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  
  if (minutes < 60) {
    return { text: `In ${minutes}m`, urgency: "soon" };
  } else if (hours < 24) {
    return { text: `In ${hours}h`, urgency: "soon" };
  } else {
    return {
      text: dueDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      urgency: "later"
    };
  }
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "stable":
      return "patient-status-stable";
    case "monitor":
      return "patient-status-monitor";
    case "attention":
      return "patient-status-attention";
    default:
      return "bg-neutral-200 text-neutral-700";
  }
}

export function getReminderIcon(type: string): { icon: string; bgColor: string; textColor: string } {
  switch (type.toLowerCase()) {
    case "medication":
      return { icon: "pills", bgColor: "bg-red-100", textColor: "text-red-500" };
    case "vital_check":
      return { icon: "stethoscope", bgColor: "bg-amber-100", textColor: "text-amber-500" };
    case "general_care":
      return { icon: "procedures", bgColor: "bg-blue-100", textColor: "text-blue-500" };
    case "nutrition":
      return { icon: "utensils", bgColor: "bg-green-100", textColor: "text-green-500" };
    default:
      return { icon: "bell", bgColor: "bg-neutral-100", textColor: "text-neutral-500" };
  }
}

export function formatResourceType(type: string): { icon: string; bgColor: string; textColor: string } {
  switch (type.toLowerCase()) {
    case "pdf":
      return { icon: "file-pdf", bgColor: "bg-red-100", textColor: "text-red-500" };
    case "video":
      return { icon: "video", bgColor: "bg-blue-100", textColor: "text-blue-500" };
    case "document":
      return { icon: "file-alt", bgColor: "bg-green-100", textColor: "text-green-500" };
    case "link":
      return { icon: "link", bgColor: "bg-purple-100", textColor: "text-purple-500" };
    default:
      return { icon: "file", bgColor: "bg-neutral-100", textColor: "text-neutral-500" };
  }
}
