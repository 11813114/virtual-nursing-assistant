import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Lock, 
  Bell, 
  Monitor, 
  Shield, 
  HelpCircle, 
  Save,
  Upload,
  LogOut
} from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [enableNotifications, setEnableNotifications] = React.useState(true);
  const [enableSounds, setEnableSounds] = React.useState(true);
  const [enableReminders, setEnableReminders] = React.useState(true);
  const [theme, setTheme] = React.useState("light");
  const [fontSize, setFontSize] = React.useState("medium");
  const [highContrast, setHighContrast] = React.useState(false);

  const { data: currentUser, isLoading } = useQuery<{ name: string; email: string; avatar?: string }>({
    queryKey: ["/api/users/me"],
    onSuccess: (data) => {
      if (data) {
        setName(data.name || "");
        setEmail(data.email || "");
      }
    },
  });

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleSaveAppearance = () => {
    toast({
      title: "Appearance Settings Updated",
      description: "Your display preferences have been saved.",
    });
  };

  const handlePasswordChange = () => {
    toast({
      title: "Password Changed",
      description: "Your password has been changed successfully.",
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-semibold text-neutral-800">
          Settings
        </h1>
        <p className="text-neutral-500 mt-1">
          Manage your account preferences
        </p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="account" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center">
            <Monitor className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="help" className="flex items-center">
            <HelpCircle className="h-4 w-4 mr-2" />
            Help
          </TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {isLoading ? (
                  <Skeleton className="h-20 w-20 rounded-full" />
                ) : (
                  <UserAvatar
                    name={currentUser?.name || "User"}
                    imageUrl={currentUser?.avatar}
                    className="h-20 w-20"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-medium">Profile Picture</h3>
                  <p className="text-sm text-neutral-500 mb-3">
                    Upload a new profile picture
                  </p>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Change Avatar
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isLoading ? "Loading..." : "Enter your name"}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isLoading ? "Loading..." : "Enter your email"}
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Tell us a little about yourself"
                  className="min-h-24"
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select defaultValue="nurse">
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nurse">Nurse</SelectItem>
                      <SelectItem value="head_nurse">Head Nurse</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select defaultValue="general">
                    <SelectTrigger>
                      <SelectValue placeholder="Select your department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Care</SelectItem>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="neurology">Neurology</SelectItem>
                      <SelectItem value="pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSaveProfile}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Enable Notifications</h3>
                    <p className="text-sm text-neutral-500">
                      Receive notifications for important updates
                    </p>
                  </div>
                  <Switch 
                    checked={enableNotifications} 
                    onCheckedChange={setEnableNotifications} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Notification Sounds</h3>
                    <p className="text-sm text-neutral-500">
                      Play sound when notifications are received
                    </p>
                  </div>
                  <Switch 
                    checked={enableSounds} 
                    onCheckedChange={setEnableSounds}
                    disabled={!enableNotifications}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Reminder Notifications</h3>
                    <p className="text-sm text-neutral-500">
                      Receive notifications for upcoming reminders
                    </p>
                  </div>
                  <Switch 
                    checked={enableReminders} 
                    onCheckedChange={setEnableReminders}
                    disabled={!enableNotifications}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Notification Methods</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="email-notifications" />
                    <Label htmlFor="email-notifications">Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="browser-notifications" defaultChecked />
                    <Label htmlFor="browser-notifications">Browser</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="sms-notifications" />
                    <Label htmlFor="sms-notifications">SMS</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="mobile-notifications" defaultChecked />
                    <Label htmlFor="mobile-notifications">Mobile App</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Notification Categories</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="patient-updates" defaultChecked />
                    <Label htmlFor="patient-updates">Patient Updates</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="reminders" defaultChecked />
                    <Label htmlFor="reminders">Reminders</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="messages" defaultChecked />
                    <Label htmlFor="messages">Messages</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="system-updates" />
                    <Label htmlFor="system-updates">System Updates</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveNotifications} className="ml-auto">
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>
                Customize the appearance of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-4">
                  <Button 
                    variant={theme === "light" ? "default" : "outline"} 
                    className="flex flex-col items-center justify-center h-24"
                    onClick={() => setTheme("light")}
                  >
                    <div className="w-12 h-12 bg-white border rounded-md mb-2 flex items-center justify-center">
                      <span className="text-black">A</span>
                    </div>
                    <span>Light</span>
                  </Button>
                  <Button 
                    variant={theme === "dark" ? "default" : "outline"} 
                    className="flex flex-col items-center justify-center h-24"
                    onClick={() => setTheme("dark")}
                  >
                    <div className="w-12 h-12 bg-neutral-800 border rounded-md mb-2 flex items-center justify-center">
                      <span className="text-white">A</span>
                    </div>
                    <span>Dark</span>
                  </Button>
                  <Button 
                    variant={theme === "system" ? "default" : "outline"} 
                    className="flex flex-col items-center justify-center h-24"
                    onClick={() => setTheme("system")}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-white to-neutral-800 border rounded-md mb-2"></div>
                    <span>System</span>
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Text Size</Label>
                <Select 
                  value={fontSize}
                  onValueChange={setFontSize}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="x-large">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">High Contrast Mode</h3>
                  <p className="text-sm text-neutral-500">
                    Increase contrast for better visibility
                  </p>
                </div>
                <Switch 
                  checked={highContrast} 
                  onCheckedChange={setHighContrast} 
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveAppearance} className="ml-auto">
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Change Password</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input 
                      id="current-password" 
                      type="password" 
                      placeholder="Enter your current password" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="new-password" 
                      type="password" 
                      placeholder="Enter your new password" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      placeholder="Confirm your new password" 
                    />
                  </div>
                </div>
                <Button onClick={handlePasswordChange}>
                  <Lock className="h-4 w-4 mr-2" />
                  Update Password
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-medium">Two-Factor Authentication</h3>
                <p className="text-sm text-neutral-500">
                  Add an extra layer of security to your account
                </p>
                <Button variant="outline">Enable Two-Factor Authentication</Button>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-medium">Account Sessions</h3>
                <p className="text-sm text-neutral-500">
                  Manage devices where you're currently signed in
                </p>
                <div className="border rounded-lg divide-y">
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-sm text-neutral-500">
                        Windows • Chrome • 192.168.1.1
                      </p>
                    </div>
                    <Badge>Active Now</Badge>
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">Mobile Device</p>
                      <p className="text-sm text-neutral-500">
                        iOS • Safari • Last active: 2 hours ago
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Logout
                    </Button>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Logout from All Devices
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Help & Support */}
        <TabsContent value="help">
          <Card>
            <CardHeader>
              <CardTitle>Help & Support</CardTitle>
              <CardDescription>
                Find help and contact support
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Documentation</h3>
                <p className="text-neutral-500">
                  Access comprehensive guides and resources to help you use the platform effectively.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Button variant="outline" className="justify-start h-auto py-3">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">User Guide</span>
                      <span className="text-xs text-neutral-500">Complete platform instructions</span>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-3">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Video Tutorials</span>
                      <span className="text-xs text-neutral-500">Step-by-step visual guides</span>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-3">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">FAQs</span>
                      <span className="text-xs text-neutral-500">Answers to common questions</span>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-3">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Best Practices</span>
                      <span className="text-xs text-neutral-500">Tips for optimal usage</span>
                    </div>
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Contact Support</h3>
                <p className="text-neutral-500">
                  Need help? Reach out to our support team.
                </p>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="issue-category">Issue Category</Label>
                    <Select defaultValue="technical">
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Problem</SelectItem>
                        <SelectItem value="account">Account Issue</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="billing">Billing Question</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support-message">Describe your issue</Label>
                    <Textarea 
                      id="support-message" 
                      placeholder="Provide details about your issue..."
                      className="min-h-32"
                    />
                  </div>
                  <Button>
                    Submit Support Request
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-red-500">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible account actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Log Out</h3>
              <p className="text-sm text-neutral-500">
                End your current session
              </p>
            </div>
            <Button variant="outline" className="border-red-200 text-red-500 hover:bg-red-50">
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Delete Account</h3>
              <p className="text-sm text-neutral-500">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="destructive">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
