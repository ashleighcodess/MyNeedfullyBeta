import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Heart, Send, MessageSquare } from "lucide-react";

const thankYouNoteSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(100, "Subject too long"),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000, "Message too long"),
});

type ThankYouNoteForm = z.infer<typeof thankYouNoteSchema>;

interface ThankYouNoteProps {
  toUserId: string;
  donationId?: number;
  onSent?: () => void;
}

export default function ThankYouNote({ toUserId, donationId, onSent }: ThankYouNoteProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ThankYouNoteForm>({
    resolver: zodResolver(thankYouNoteSchema),
    defaultValues: {
      subject: "Thank You for Your Kindness",
      message: "",
    },
  });

  const sendNoteMutation = useMutation({
    mutationFn: async (data: ThankYouNoteForm) => {
      return await apiRequest("POST", "/api/thank-you-notes", {
        ...data,
        toUserId,
        donationId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/thank-you-notes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activity/recent'] });
      toast({
        title: "Thank You Note Sent!",
        description: "Your message of gratitude has been delivered.",
      });
      form.reset();
      onSent?.();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Error",
        description: "Failed to send thank you note. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: ThankYouNoteForm) => {
    setIsSubmitting(true);
    try {
      await sendNoteMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500">Please sign in to send a thank you note</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="h-8 w-8 text-coral" />
        </div>
        <h3 className="text-xl font-semibold text-navy mb-2">Send a Thank You Note</h3>
        <p className="text-gray-600 text-sm">
          Express your gratitude to this generous supporter
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Subject */}
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Thank You for Your Kindness"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Message */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Message</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Dear friend,&#10;&#10;I want to express my heartfelt gratitude for your generous donation. Your kindness means the world to me and my family during this difficult time. Because of people like you, we have hope and the support we need to get back on our feet.&#10;&#10;Thank you from the bottom of my heart.&#10;&#10;With sincere appreciation,"
                    className="min-h-[120px] resize-none"
                    {...field}
                  />
                </FormControl>
                <div className="text-xs text-gray-500 mt-1">
                  {field.value.length}/1000 characters
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tips */}
          <div className="bg-coral/5 border border-coral/20 rounded-lg p-4">
            <h4 className="font-medium text-navy mb-2 text-sm">💡 Tips for a meaningful thank you note:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Be specific about how their donation helped you</li>
              <li>• Share a personal detail or story</li>
              <li>• Express genuine emotion and gratitude</li>
              <li>• Keep it heartfelt and authentic</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onSent?.()}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !form.formState.isValid}
              className="flex-1 bg-coral hover:bg-coral/90"
            >
              {isSubmitting ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Note
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Preview */}
      {form.watch('message') && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-medium text-navy mb-2 text-sm">Preview:</h4>
          <div className="text-sm text-gray-700 space-y-2">
            <div><strong>Subject:</strong> {form.watch('subject')}</div>
            <div><strong>From:</strong> {user.firstName} {user.lastName}</div>
            <div className="mt-3 p-3 bg-white rounded border">
              <div className="whitespace-pre-wrap">{form.watch('message')}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
