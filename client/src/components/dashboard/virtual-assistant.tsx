import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatTime } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { Send, Bot } from "lucide-react";

interface Message {
  id: number;
  senderId: number;
  content: string;
  timestamp: string;
  isBot: boolean;
}

export function VirtualAssistant() {
  const queryClient = useQueryClient();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = React.useState("");
  const [isAssistantTyping, setIsAssistantTyping] = React.useState(false);

  const { data: messages, isLoading } = useQuery<Message[]>({
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
      setIsAssistantTyping(true);
      
      // Simulate the assistant typing
      setTimeout(() => {
        setIsAssistantTyping(false);
        queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      }, 2000);
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage);
      setNewMessage("");
    }
  };

  // Scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAssistantTyping]);

  return (
    <Card>
      <CardHeader className="px-5 py-4 border-b border-neutral-100 flex justify-between items-center">
        <CardTitle className="font-heading font-semibold text-neutral-800">
          Virtual Nursing Assistant
        </CardTitle>
        <Badge variant="outline" className="bg-green-100 text-green-700 hover:bg-green-100">
          Online
        </Badge>
      </CardHeader>

      <CardContent className="p-5">
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {isLoading ? (
            // Loading state
            Array(3)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className={`flex items-start ${i % 2 === 0 ? "" : "justify-end"}`}
                >
                  {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
                  <div
                    className={`${
                      i % 2 === 0 ? "ml-3 bg-neutral-50" : "bg-primary-light bg-opacity-10"
                    } rounded-lg py-2 px-3 max-w-[80%]`}
                  >
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-20 mt-1" />
                  </div>
                </div>
              ))
          ) : (
            <>
              {/* Actual messages */}
              {messages && messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start ${
                    message.isBot ? "" : "justify-end"
                  }`}
                >
                  {message.isBot && (
                    <Avatar className="h-8 w-8 bg-primary">
                      <AvatarFallback className="text-white">
                        <Bot size={16} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`${
                      message.isBot
                        ? "ml-3 bg-neutral-50"
                        : "bg-primary-light bg-opacity-10"
                    } rounded-lg py-2 px-3 max-w-[80%]`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs text-neutral-400 mt-1">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Assistant typing indicator */}
              {isAssistantTyping && (
                <div className="flex items-start">
                  <Avatar className="h-8 w-8 bg-primary">
                    <AvatarFallback className="text-white">
                      <Bot size={16} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3 bg-neutral-50 rounded-lg py-2 px-3">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="mt-4 flex">
          <Input
            type="text"
            placeholder="Type your message..."
            className="flex-1 border border-neutral-200 rounded-l-md"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isAssistantTyping}
          />
          <Button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary-dark transition-colors"
            disabled={!newMessage.trim() || isAssistantTyping}
          >
            <Send size={16} />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
