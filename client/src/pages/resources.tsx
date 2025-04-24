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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatResourceType } from "@/lib/utils";
import { Search, BookOpen, FileText, Video, Link as LinkIcon, ExternalLink, Download } from "lucide-react";

interface Resource {
  id: number;
  title: string;
  description: string;
  resourceType: string;
  url: string;
  icon: string;
}

export default function Resources() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [resourceTypeFilter, setResourceTypeFilter] = React.useState<string | null>(null);
  const [selectedResource, setSelectedResource] = React.useState<Resource | null>(null);

  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  // Filter resources based on search and type
  const filteredResources = React.useMemo(() => {
    if (!resources) return [];
    
    return resources.filter((resource) => {
      // Apply search filter
      const matchesSearch = !searchQuery || 
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Apply type filter
      const matchesType = !resourceTypeFilter || resource.resourceType === resourceTypeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [resources, searchQuery, resourceTypeFilter]);

  // Group resources by type
  const resourcesByType = React.useMemo(() => {
    if (!filteredResources.length) return {};
    
    const grouped: Record<string, Resource[]> = {};
    
    filteredResources.forEach((resource) => {
      if (!grouped[resource.resourceType]) {
        grouped[resource.resourceType] = [];
      }
      grouped[resource.resourceType].push(resource);
    });
    
    return grouped;
  }, [filteredResources]);

  const getResourceTypeLabel = (type: string) => {
    switch (type) {
      case "pdf":
        return "PDF Documents";
      case "video":
        return "Video Resources";
      case "document":
        return "Text Documents";
      case "link":
        return "External Links";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      case "document":
        return <BookOpen className="h-5 w-5" />;
      case "link":
        return <LinkIcon className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-semibold text-neutral-800">
          Patient Education Resources
        </h1>
        <p className="text-neutral-500 mt-1">
          Educational materials to help patients manage their health
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
              <Input
                type="search"
                placeholder="Search resources..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button>
              Upload Resource
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all" className="px-4">
            <TabsList>
              <TabsTrigger 
                value="all" 
                onClick={() => setResourceTypeFilter(null)}
              >
                All Resources
              </TabsTrigger>
              <TabsTrigger 
                value="pdf"
                onClick={() => setResourceTypeFilter("pdf")}
              >
                PDFs
              </TabsTrigger>
              <TabsTrigger 
                value="video"
                onClick={() => setResourceTypeFilter("video")}
              >
                Videos
              </TabsTrigger>
              <TabsTrigger 
                value="document"
                onClick={() => setResourceTypeFilter("document")}
              >
                Documents
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full rounded-md" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full rounded-md" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredResources.length > 0 ? (
        <>
          {/* Display resources by type */}
          {Object.keys(resourcesByType).map((type) => (
            <div key={type} className="mb-8">
              <div className="flex items-center mb-4">
                <div className={`p-2 rounded-md ${
                  type === "pdf" ? "bg-red-100 text-red-500" :
                  type === "video" ? "bg-blue-100 text-blue-500" :
                  type === "document" ? "bg-green-100 text-green-500" :
                  "bg-purple-100 text-purple-500"
                }`}>
                  {getResourceTypeIcon(type)}
                </div>
                <h2 className="text-xl font-semibold ml-3">{getResourceTypeLabel(type)}</h2>
                <Badge variant="outline" className="ml-2">
                  {resourcesByType[type].length}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resourcesByType[type].map((resource) => {
                  const { icon, bgColor, textColor } = formatResourceType(resource.resourceType);
                  
                  return (
                    <Card key={resource.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className={`w-10 h-10 rounded-md ${bgColor} ${textColor} flex items-center justify-center`}>
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
                          <Badge variant="outline" className={bgColor}>
                            {resource.resourceType.toUpperCase()}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mt-2">{resource.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {resource.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {resource.resourceType === "video" && (
                          <div className="aspect-video bg-neutral-100 rounded-md flex items-center justify-center text-neutral-400 mb-4">
                            <Video className="h-8 w-8" />
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedResource(resource)}
                        >
                          Preview
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          asChild
                        >
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            {resource.resourceType === "pdf" || resource.resourceType === "document" ? (
                              <>
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </>
                            ) : (
                              <>
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Open
                              </>
                            )}
                          </a>
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-16 w-16 text-neutral-300 mb-4" />
            <h3 className="text-xl font-medium mb-2">No Resources Found</h3>
            <p className="text-neutral-500 text-center max-w-md mb-6">
              {searchQuery || resourceTypeFilter
                ? "Try adjusting your search or filters to find what you're looking for."
                : "There are no education resources available yet. Upload your first resource to get started."}
            </p>
            <Button>Upload Resource</Button>
          </CardContent>
        </Card>
      )}

      {/* Resource Preview Dialog */}
      <Dialog open={!!selectedResource} onOpenChange={() => setSelectedResource(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{selectedResource?.title}</DialogTitle>
            <DialogDescription>
              {selectedResource?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            {selectedResource?.resourceType === "video" ? (
              <div className="aspect-video bg-neutral-100 rounded-md flex items-center justify-center text-neutral-500">
                <div className="text-center">
                  <Video className="h-10 w-10 mx-auto mb-2" />
                  <p>Video preview would appear here</p>
                </div>
              </div>
            ) : selectedResource?.resourceType === "pdf" ? (
              <div className="h-[400px] bg-neutral-100 rounded-md flex items-center justify-center text-neutral-500">
                <div className="text-center">
                  <FileText className="h-10 w-10 mx-auto mb-2" />
                  <p>PDF preview would appear here</p>
                </div>
              </div>
            ) : (
              <div className="h-[400px] bg-neutral-100 rounded-md flex items-center justify-center text-neutral-500">
                <div className="text-center">
                  <BookOpen className="h-10 w-10 mx-auto mb-2" />
                  <p>Document preview would appear here</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end mt-4">
            <Button asChild>
              <a href={selectedResource?.url} target="_blank" rel="noopener noreferrer">
                {selectedResource?.resourceType === "pdf" || selectedResource?.resourceType === "document" ? (
                  <>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open
                  </>
                )}
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
