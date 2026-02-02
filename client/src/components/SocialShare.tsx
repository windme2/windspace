import { Facebook, Twitter, Linkedin, Link2, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  className?: string;
  size?: "sm" | "default" | "lg";
  showLabels?: boolean;
}

/**
 * Social sharing buttons component
 */
export function SocialShare({
  url,
  title,
  description = "",
  image = "",
  className = "",
  size = "default",
  showLabels = false,
}: SocialShareProps) {
  const { toast } = useToast();

  // Ensure full URL
  const fullUrl = url.startsWith("http")
    ? url
    : `${window.location.origin}${url}`;

  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    line: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    const shareUrl = shareLinks[platform];
    
    if (platform === "email") {
      window.location.href = shareUrl;
    } else {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast({
        title: "Link copied!",
        description: "The article link has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: fullUrl,
        });
      } catch (err) {
        // User cancelled or share failed
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    }
  };

  const buttonSize = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";
  const iconSize = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";

  const platforms = [
    { key: "facebook", icon: Facebook, label: "Facebook", color: "hover:bg-[#1877F2] hover:text-white" },
    { key: "twitter", icon: Twitter, label: "Twitter/X", color: "hover:bg-[#1DA1F2] hover:text-white" },
    { key: "linkedin", icon: Linkedin, label: "LinkedIn", color: "hover:bg-[#0A66C2] hover:text-white" },
    { key: "line", icon: MessageCircle, label: "LINE", color: "hover:bg-[#00B900] hover:text-white" },
    { key: "email", icon: Mail, label: "Email", color: "hover:bg-gray-600 hover:text-white" },
  ] as const;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {showLabels && <span className="text-sm text-muted-foreground mr-2">Share:</span>}
      
      {platforms.map(({ key, icon: Icon, label, color }) => (
        <Button
          key={key}
          variant="outline"
          size="icon"
          className={`${buttonSize} ${color} transition-colors`}
          onClick={() => handleShare(key)}
          aria-label={`Share on ${label}`}
          title={`Share on ${label}`}
        >
          <Icon className={iconSize} />
        </Button>
      ))}

      <Button
        variant="outline"
        size="icon"
        className={`${buttonSize} hover:bg-gray-200 dark:hover:bg-gray-700`}
        onClick={copyToClipboard}
        aria-label="Copy link"
        title="Copy link"
      >
        <Link2 className={iconSize} />
      </Button>

      {/* Native share button (mobile) */}
      {typeof navigator !== "undefined" && navigator.share && (
        <Button
          variant="default"
          size={size === "sm" ? "sm" : "default"}
          onClick={nativeShare}
          className="ml-2"
        >
          Share
        </Button>
      )}
    </div>
  );
}

/**
 * Compact share button that shows share options on click
 */
export function ShareButton({
  url,
  title,
  description,
}: {
  url: string;
  title: string;
  description?: string;
}) {
  const { toast } = useToast();

  const handleClick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: url.startsWith("http") ? url : `${window.location.origin}${url}`,
        });
      } catch (err) {
        // Fallback to copy
        if ((err as Error).name !== "AbortError") {
          await copyToClipboard();
        }
      }
    } else {
      await copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast({
        title: "Link copied!",
        description: "Share it with your friends.",
      });
    } catch {
      toast({
        title: "Failed to copy",
        variant: "destructive",
      });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick}>
      <Link2 className="h-4 w-4 mr-2" />
      Share
    </Button>
  );
}

export default SocialShare;
