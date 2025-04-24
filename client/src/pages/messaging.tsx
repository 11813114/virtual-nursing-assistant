import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { timeAgo, formatTime } from "@/lib/utils";
import { Search, Send, Phone, Video, PaperclipIcon, SmilePlus } from "lucide-react";

interface Message {
  id: number;
  senderId: number;
  content: string;
  timestamp: string;
  isBot: boolean;
}

interface Patient {
  id: number;
  patientId: string;
  name: string;
  avatar?: string;
  status: string;
}

// Simulated conversations for demo purposes
const conversations = [
  { id: 1, name: "James Wilson", avatar: "", lastMessage: "I've been feeling much better today", time: new Date(Date.now() - 1000 * 60 * 5), unread: 2 },
  { id: 2, name: "Maria Garcia", avatar: "", lastMessage: "When should I take my medication?", time: new Date(Date.now() - 1000 * 60 * 30), unread: 0 },
  { id: 3, name: "Robert Johnson", avatar: "", lastMessage: "My oxygen levels have improved", time: new Date(Date.now() - 1000 * 60 * 60 * 2), unread: 0 },
  { id: 4, name: "Emily Davis", avatar: "", lastMessage: "Thank you for the follow-up", time: new Date(Date.now() - 1000 * 60 * 60 * 8), unread: 0 },
];

export default function Messaging() {
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = React.useState<number | null>(1);
  const [messageText, setMessageText] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const { data: patients, isLoading: isLoadingPatients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: messages, isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/messages", {
        senderId: 1, // Current user
        content,
        timestamp: new Date().toISOString(),
        isBot: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });

  // Filter conversations based on search query
  const filteredConversations = React.useMemo(() => {
    if (!searchQuery) return conversations;
    
    return conversations.filter(conversation => 
      conversation.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      sendMessageMutation.mutate(messageText);
      setMessageText("");
    }
  };

  // Scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-semibold text-neutral-800">
          Messaging
        </h1>
        <p className="text-neutral-500 mt-1">
          Communicate with patients and healthcare team
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader className="px-4 py-3 space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
              <Input
                type="search"
                placeholder="Search conversations..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                <TabsTrigger value="patients" className="flex-1">Patients</TabsTrigger>
                <TabsTrigger value="team" className="flex-1">Team</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto max-h-[calc(100vh-300px)]">
            {isLoadingPatients ? (
              // Skeleton loaders for conversations
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="px-4 py-3 border-b border-neutral-100">
                  <div className="flex items-start">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="ml-3 flex-1 space-y-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-56" />
                    </div>
                  </div>
                </div>
              ))
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <div 
                  key={conversation.id}
                  className={`px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer ${
                    selectedConversation === conversation.id ? "bg-neutral-50" : ""
                  }`}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <div className="flex items-start">
                    <UserAvatar
                      name={conversation.name}
                      imageUrl={conversation.avatar}
                      className="h-10 w-10"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium">{conversation.name}</p>
                        <span className="text-xs text-neutral-500">{timeAgo(conversation.time)}</span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-1">
                        {conversation.lastMessage}
                      </p>
                    </div>
                    {conversation.unread > 0 && (
                      <Badge variant="default" className="ml-2 h-5 min-w-5 rounded-full px-1.5">
                        {conversation.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-neutral-500">
                No conversations found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader className="px-6 py-4 border-b border-neutral-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <UserAvatar
                      name={conversations.find(c => c.id === selectedConversation)?.name || ""}
                      className="h-10 w-10 mr-3"
                    />
                    <div>
                      <CardTitle className="text-base">
                        {conversations.find(c => c.id === selectedConversation)?.name}
                      </CardTitle>
                      <p className="text-xs text-neutral-500">
                        Last active 5 minutes ago
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 h-[calc(100vh-460px)] overflow-y-auto">
                {isLoadingMessages ? (
                  // Skeleton loaders for messages
                  <div className="space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                      <div 
                        key={i} 
                        className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
                      >
                        <div 
                          className={`max-w-[80%] ${
                            i % 2 === 0 
                              ? "bg-neutral-100 rounded-tr-lg rounded-br-lg rounded-bl-lg" 
                              : "bg-primary text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg"
                          } p-3`}
                        >
                          <Skeleton className={`h-4 w-48 ${i % 2 === 0 ? "bg-neutral-200" : "bg-primary-dark"}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Example message bubbles - would be replaced with real messages */}
                    <div className="flex justify-start">
                      <div className="bg-neutral-100 rounded-tr-lg rounded-br-lg rounded-bl-lg p-3 max-w-[80%]">
                        <p className="text-sm">Hello! How are you feeling today?</p>
                        <p className="text-xs text-neutral-500 mt-1">10:15 AM</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-primary text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg p-3 max-w-[80%]">
                        <p className="text-sm">I'm feeling much better today, thank you for asking.</p>
                        <p className="text-xs text-primary-foreground/70 mt-1">10:17 AM</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-neutral-100 rounded-tr-lg rounded-br-lg rounded-bl-lg p-3 max-w-[80%]">
                        <p className="text-sm">That's great to hear! Have you been taking your medications regularly?</p>
                        <p className="text-xs text-neutral-500 mt-1">10:20 AM</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-primary text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg p-3 max-w-[80%]">
                        <p className="text-sm">Yes, I've been following the schedule as prescribed.</p>
                        <p className="text-xs text-primary-foreground/70 mt-1">10:22 AM</p>
                      </div>
                    </div>
                    
                    {/* Display actual messages from the API */}
                    {messages && messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
                      >
                        <div 
                          className={`max-w-[80%] ${
                            message.isBot 
                              ? "bg-neutral-100 rounded-tr-lg rounded-br-lg rounded-bl-lg" 
                              : "bg-primary text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg"
                          } p-3`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs ${message.isBot ? "text-neutral-500" : "text-primary-foreground/70"} mt-1`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 border-t border-neutral-100">
                <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
                  <Button variant="ghost" size="icon" type="button">
                    <PaperclipIcon className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="ghost" size="icon" type="button">
                    <SmilePlus className="h-4 w-4" />
                  </Button>
                  <Button type="submit" disabled={!messageText.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </>
          ) : (
            <div className="h-full flex items-center justify-center p-8 text-center">
              <div>
                <Send className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Conversation Selected</h3>
                <p className="text-neutral-500 mb-4">
                  Choose a conversation from the list or start a new one
                </p>
                <Button>Start New Conversation</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
