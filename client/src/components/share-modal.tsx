import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Mail,
  Copy,
  Share2,
  Instagram,
} from "lucide-react";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  url: string;
  onShare?: () => void;
}

export function ShareModal({ 
  open, 
  onOpenChange, 
  title, 
  description, 
  url,
  onShare 
}: ShareModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareText = `${title}\n\n${description}\n\nSupport this needs list: ${url}`;
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const encodedUrl = encodeURIComponent(url);
  const encodedShareText = encodeURIComponent(shareText);

  const socialPlatforms = [
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodeURIComponent(`${title} - ${description}`)}`,
    },
    {
      name: "X",
      icon: Twitter,
      color: "bg-black hover:bg-gray-800",
      url: `https://x.com/intent/tweet?text=${encodeURIComponent(`${title} - Help support this needs list!`)}&url=${encodedUrl}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-blue-700 hover:bg-blue-800",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-500 hover:bg-green-600",
      url: `https://wa.me/?text=${encodedShareText}`,
    },
    {
      name: "Instagram",
      icon: Instagram,
      color: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
      url: "instagram",
    },
    {
      name: "Email",
      icon: Mail,
      color: "bg-gray-600 hover:bg-gray-700",
      url: `mailto:?subject=${encodedTitle}&body=${encodedShareText}`,
    },
  ];

  const handleSocialShare = async (platform: typeof socialPlatforms[0]) => {
    // Call the onShare callback to increment share count
    if (onShare) {
      onShare();
    }

    // Handle Instagram specially
    if (platform.name === "Instagram") {
      try {
        await navigator.clipboard.writeText(shareText);
        window.open('https://www.instagram.com/', '_blank');
        toast({
          title: "Content Copied!",
          description: "Opening Instagram - paste your content to share this needs list.",
        });
      } catch (error) {
        toast({
          title: "Instagram Sharing",
          description: "Copy the link below and share it on Instagram.",
        });
      }
      return;
    }

    // Open the sharing URL for other platforms
    window.open(platform.url, '_blank', 'width=600,height=400');
    
    toast({
      title: "Shared!",
      description: `Opening ${platform.name} to share this needs list.`,
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // Call the onShare callback to increment share count
      if (onShare) {
        onShare();
      }
      
      toast({
        title: "Link Copied",
        description: "The needs list link has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: url,
        });
        
        // Call the onShare callback to increment share count
        if (onShare) {
          onShare();
        }
      } catch (error) {
        // User canceled or error occurred, don't show error toast
        console.log('Native sharing canceled or failed');
      }
    }
  };

  const handleSMS = () => {
    const smsBody = encodeURIComponent(`${title}\n\n${description}\n\nSupport this needs list: ${url}`);
    const smsUrl = `sms:?body=${smsBody}`;
    
    // Call the onShare callback to increment share count
    if (onShare) {
      onShare();
    }
    
    window.location.href = smsUrl;
    
    toast({
      title: "SMS Ready",
      description: "Opening your messaging app to share this needs list.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Share2 className="mr-2 h-5 w-5 text-coral" />
            Share Needs List
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-navy mb-1 line-clamp-2">{title}</h4>
            <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
          </div>

          {/* Social Media Platforms */}
          <div>
            <h5 className="font-medium text-navy mb-3">Share on Social Media</h5>
            <div className="grid grid-cols-2 gap-3">
              {socialPlatforms.map((platform) => (
                <Button
                  key={platform.name}
                  variant="outline"
                  className={`${platform.color} text-white border-0 hover:text-white`}
                  onClick={() => handleSocialShare(platform)}
                >
                  <platform.icon className="mr-2 h-4 w-4" />
                  {platform.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Other Sharing Options */}
          <div>
            <h5 className="font-medium text-navy mb-3">Other Options</h5>
            <div className="space-y-2">
              {/* Native Share (mobile) */}
              {navigator.share && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleNativeShare}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share via Device
                </Button>
              )}

              {/* SMS */}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleSMS}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Send via Text Message
              </Button>

              {/* Copy Link */}
              <div className="flex space-x-2">
                <Input
                  value={url}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className={copied ? "bg-green-100 text-green-700" : ""}
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}