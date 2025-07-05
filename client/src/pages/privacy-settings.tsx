import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Shield, Eye, EyeOff, Globe, Lock, Save } from "lucide-react";
import { Link } from "wouter";

export default function PrivacySettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [settings, setSettings] = useState({
    showNeedsListsLive: user?.showNeedsListsLive ?? true,
    hideNeedsListsFromPublic: user?.hideNeedsListsFromPublic ?? false,
    showProfileInSearch: user?.showProfileInSearch ?? true,
    allowDirectMessages: user?.allowDirectMessages ?? true,
    showDonationHistory: user?.showDonationHistory ?? false,
    emailNotifications: user?.emailNotifications ?? true,
    pushNotifications: user?.pushNotifications ?? true,
  });

  const updatePrivacyMutation = useMutation({
    mutationFn: async (data: typeof settings) => {
      return await apiRequest("PATCH", `/api/users/${user?.id}/privacy`, data);
    },
    onSuccess: () => {
      toast({
        title: "Privacy Settings Updated",
        description: "Your privacy preferences have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update privacy settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updatePrivacyMutation.mutate(settings);
  };

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-warm-bg">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Please Log In</h3>
            <p className="text-gray-600">You need to be logged in to access privacy settings.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-bg">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/profile">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-navy">Privacy Settings</h1>
          <p className="text-gray-600">Control how your information is shared and displayed</p>
        </div>

        <div className="space-y-6">
          {/* Needs List Visibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="mr-2 h-5 w-5" />
                Needs List Visibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="show-live">Show My Needs Lists Live</Label>
                  <p className="text-sm text-gray-600">
                    Allow your needs lists to appear in real-time searches and browse pages
                  </p>
                </div>
                <Switch
                  id="show-live"
                  checked={settings.showNeedsListsLive}
                  onCheckedChange={(checked) => updateSetting('showNeedsListsLive', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="hide-public">Hide My Needs Lists from Public View</Label>
                  <p className="text-sm text-gray-600">
                    Only allow logged-in users to see your needs lists
                  </p>
                </div>
                <Switch
                  id="hide-public"
                  checked={settings.hideNeedsListsFromPublic}
                  onCheckedChange={(checked) => updateSetting('hideNeedsListsFromPublic', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Profile Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Profile Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="show-profile">Show Profile in Search Results</Label>
                  <p className="text-sm text-gray-600">
                    Allow your profile to appear when people search by name or location
                  </p>
                </div>
                <Switch
                  id="show-profile"
                  checked={settings.showProfileInSearch}
                  onCheckedChange={(checked) => updateSetting('showProfileInSearch', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="direct-messages">Allow Direct Messages</Label>
                  <p className="text-sm text-gray-600">
                    Let other users send you thank you notes and messages
                  </p>
                </div>
                <Switch
                  id="direct-messages"
                  checked={settings.allowDirectMessages}
                  onCheckedChange={(checked) => updateSetting('allowDirectMessages', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="donation-history">Show Donation History</Label>
                  <p className="text-sm text-gray-600">
                    Display your donation activity on your public profile
                  </p>
                </div>
                <Switch
                  id="donation-history"
                  checked={settings.showDonationHistory}
                  onCheckedChange={(checked) => updateSetting('showDonationHistory', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-gray-600">
                    Receive email updates about donations and messages
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-gray-600">
                    Get instant notifications for important updates
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="mr-2 h-5 w-5" />
                Data & Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Your data is encrypted and stored securely. We never share personal information 
                  with third parties without your explicit consent.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    Download My Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                    Delete My Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <Link href="/profile">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button 
              onClick={handleSave}
              disabled={updatePrivacyMutation.isPending}
              className="bg-coral hover:bg-coral/90"
            >
              <Save className="mr-2 h-4 w-4" />
              {updatePrivacyMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}