"use client";

import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  isVisible: boolean;
  userName: string;
  className?: string;
}

export function TypingIndicator({ isVisible, userName, className }: TypingIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 text-muted-foreground animate-in slide-in-from-bottom-2 duration-200",
      className
    )}>
      {/* Animated dots */}
      <div className="flex gap-1">
        <div 
          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" 
          style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
        />
        <div 
          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" 
          style={{ animationDelay: '160ms', animationDuration: '1.4s' }}
        />
        <div 
          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" 
          style={{ animationDelay: '320ms', animationDuration: '1.4s' }}
        />
      </div>
      
      {/* Typing text */}
      <span className="text-sm font-medium">
        {userName} is typing...
      </span>
    </div>
  );
}

// Multiple users typing indicator
interface MultipleTypingIndicatorProps {
  isVisible: boolean;
  userNames: string[];
  className?: string;
}

export function MultipleTypingIndicator({ isVisible, userNames, className }: MultipleTypingIndicatorProps) {
  if (!isVisible || userNames.length === 0) return null;

  const getTypingText = () => {
    if (userNames.length === 1) {
      return `${userNames[0]} is typing...`;
    } else if (userNames.length === 2) {
      return `${userNames[0]} and ${userNames[1]} are typing...`;
    } else {
      return `${userNames.length} people are typing...`;
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 text-muted-foreground animate-in slide-in-from-bottom-2 duration-200",
      className
    )}>
      {/* Animated dots */}
      <div className="flex gap-1">
        <div 
          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" 
          style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
        />
        <div 
          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" 
          style={{ animationDelay: '160ms', animationDuration: '1.4s' }}
        />
        <div 
          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" 
          style={{ animationDelay: '320ms', animationDuration: '1.4s' }}
        />
      </div>
      
      {/* Typing text */}
      <span className="text-sm font-medium">
        {getTypingText()}
      </span>
    </div>
  );
}
