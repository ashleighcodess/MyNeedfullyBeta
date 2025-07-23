import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  MessageSquare,
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
      name: "Twitter",
      icon: Twitter,
      color: "bg-blue-400 hover:bg-blue-500",
      url: `https://twitter.com/intent/tweet?text=${encodedShareText}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-blue-700 hover:bg-blue-800",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "WhatsApp",
      icon: MessageSquare,
      color: "bg-green-600 hover:bg-green-700",
      url: `https://wa.me/?text=${encodedShareText}`,
    },
  ];

  const handleSocialShare = (platform: typeof socialPlatforms[0]) => {
    window.open(platform.url, '_blank', 'noopener,noreferrer');
    
    if (onShare) {
      onShare();
    }
    
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
      
      if (onShare) {
        onShare();
      }
      
      toast({
        title: "Link copied!",
        description: "The needs list link has been copied to your clipboard.",
      });
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast({
        title: "Copy failed",
        description: "Unable to copy link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Help Support: ${title}`);
    const body = encodeURIComponent(shareText);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    
    window.location.href = mailtoUrl;
    
    if (onShare) {
      onShare();
    }
    
    toast({
      title: "Opening Email",
      description: "Your email client will open with the needs list details.",
    });
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: title,
        text: description,
        url: url,
      });
      
      if (onShare) {
        onShare();
      }
      
      toast({
        title: "Shared!",
        description: "Thanks for sharing this needs list.",
      });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleSMS = () => {
    const smsText = encodeURIComponent(shareText);
    const smsUrl = `sms:?body=${smsText}`;
    
    window.location.href = smsUrl;
    
    toast({
      title: "SMS Ready",
      description: "Opening your messaging app to share this needs list.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Share2 className="mr-2 h-5 w-5 text-coral" />
            Share Needs List
          </DialogTitle>
          <DialogDescription className="sr-only">
            Share this needs list with others to help spread the word
          </DialogDescription>
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

              {/* Email */}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleEmailShare}
              >
                <Mail className="mr-2 h-4 w-4" />
                Send via Email
              </Button>

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