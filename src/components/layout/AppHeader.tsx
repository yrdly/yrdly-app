
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Search, Map, MessageCircle, Bell } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-supabase-auth';
import { NotificationsPanel } from '@/components/layout/NotificationsPanel';
import { useUnreadMessages } from '@/hooks/use-unread-messages';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { SearchDialog } from '@/components/SearchDialog';

export function AppHeader() {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const unreadMessagesCount = useUnreadMessages();

  const handleProfileAction = (action: string) => {
    setShowProfile(false);
    if (action === "profile") {
      window.location.href = "/profile";
    } else if (action === "settings") {
      window.location.href = "/settings";
    }
  };

  // Check if we're on the home page
  const isHomePage = pathname === "/home" || pathname === "/";

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || `https://placehold.co/100x100.png`;
  const displayName = profile?.name || user?.user_metadata?.name || 'User';

  return (
    <>
      {/* Fixed Header */}
      <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-border z-50">
        <div className="flex items-center justify-between p-4">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full yrdly-gradient flex items-center justify-center">
              <span className="text-white font-bold text-sm">Y</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">Yrdly</h1>
          </Link>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {isHomePage && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setShowSearch(true)}
              >
                <Search className="w-5 h-5" />
              </Button>
            )}
            <Link href="/map">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Map className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/messages">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground relative">
                <MessageCircle className="w-5 h-5" />
                {unreadMessagesCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">{unreadMessagesCount}</span>
                  </div>
                )}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground relative"
              onClick={() => setShowNotifications(true)}
            >
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </Button>
            <Button variant="ghost" size="sm" className="p-0" onClick={() => setShowProfile(!showProfile)}>
              <Avatar className="w-8 h-8">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {displayName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSearch && <SearchDialog onClose={() => setShowSearch(false)} />}
      {showNotifications && <NotificationsPanel onClose={() => setShowNotifications(false)} />}
      {showProfile && <ProfileDropdown onClose={() => setShowProfile(false)} onAction={handleProfileAction} />}
    </>
  );
}
