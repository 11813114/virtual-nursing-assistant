import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  changeText?: string;
  changeValue?: number;
  className?: string;
  iconBgColor?: string;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  changeText,
  changeValue,
  className,
  iconBgColor = "bg-primary-light bg-opacity-10",
  iconColor = "text-primary"
}: StatCardProps) {
  // Determine if the change is positive, negative, or neutral
  const getChangeTextColor = () => {
    if (!changeValue) return "text-neutral-500";
    return changeValue > 0 ? "text-status-success" : "text-status-error";
  };

  return (
    <div className={cn("stat-card", className)}>
      <div className="flex items-center">
        <div className={cn("stat-icon-container", iconBgColor)}>
          <Icon className={iconColor} size={18} />
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-neutral-500">{title}</h3>
          <p className="text-2xl font-semibold text-neutral-800">{value}</p>
        </div>
      </div>
      {changeText && (
        <div className={cn("mt-2 flex items-center text-xs", getChangeTextColor())}>
          {changeValue && changeValue > 0 ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12 7a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L12 10.586V7z"
                clipRule="evenodd"
              />
            </svg>
          ) : changeValue && changeValue < 0 ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12 13a1 1 0 10-2 0v-3.586l-1.293 1.293a1 1 0 01-1.414-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L12 9.414V13z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <span>{changeText}</span>
        </div>
      )}
    </div>
  );
}
