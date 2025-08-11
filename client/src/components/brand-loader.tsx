import { cn } from "@/lib/utils";
import logo5 from "@assets/MyNeedfully_1754922279088.png";
import logo6 from "@assets/MyNeedfully_1754922279088.png";

interface BrandLoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "coral" | "dark" | "dual";
  className?: string;
}

export function BrandLoader({ size = "md", variant = "coral", className }: BrandLoaderProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  if (variant === "dual") {
    return (
      <div className={cn("relative flex items-center justify-center", className)}>
        <div className="relative">
          <img 
            src={logo5} 
            alt="Loading..." 
            className={cn(sizeClasses[size], "brand-loader-spin")}
          />
          <img 
            src={logo6} 
            alt="Loading..." 
            className={cn(sizeClasses[size], "absolute inset-0 brand-loader-pulse opacity-30")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <img 
        src={variant === "coral" ? logo5 : logo6} 
        alt="Loading..." 
        className={cn(sizeClasses[size], "brand-loader-spin")}
      />
    </div>
  );
}

export function BrandLoaderWithText({ 
  text = "Searching...", 
  size = "md", 
  variant = "coral",
  className 
}: BrandLoaderProps & { text?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
      <BrandLoader size={size} variant={variant} />
      <p className="text-sm text-gray-600 font-medium">{text}</p>
    </div>
  );
}