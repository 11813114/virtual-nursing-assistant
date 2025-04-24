import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatResourceType } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface Resource {
  id: number;
  title: string;
  description: string;
  resourceType: string;
  url: string;
  icon: string;
}

export function EducationResources() {
  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  return (
    <Card>
      <CardHeader className="px-5 py-4 border-b border-neutral-100">
        <CardTitle className="font-heading font-semibold text-neutral-800">
          Patient Education Resources
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5">
        {isLoading ? (
          <div className="space-y-3">
            {Array(3)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="p-3 flex items-center">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <div className="ml-3 space-y-1 flex-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="space-y-3">
            {resources && resources.length > 0 ? (
              resources.map((resource) => {
                const { icon, bgColor, textColor } = formatResourceType(resource.resourceType);

                return (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-neutral-50 rounded-md hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <div
                        className={`flex-shrink-0 h-10 w-10 rounded ${bgColor} flex items-center justify-center ${textColor}`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d={
                              icon === "file-pdf"
                                ? "M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                : icon === "video"
                                ? "M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"
                                : icon === "file-alt"
                                ? "M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                : "M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"
                            }
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{resource.title}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {resource.description}
                        </p>
                      </div>
                    </div>
                  </a>
                );
              })
            ) : (
              <p className="text-sm text-neutral-500 text-center py-4">
                No resources available
              </p>
            )}
          </div>
        )}

        <Button
          variant="outline"
          className="w-full mt-4 border border-primary text-primary hover:bg-primary hover:text-white transition-colors text-sm"
        >
          Browse All Resources
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
