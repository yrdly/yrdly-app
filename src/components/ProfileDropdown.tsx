"use client";

import { Button } from "@/components/ui/button";
import { User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-supabase-auth";
import { AuthService } from "@/lib/auth-service";
import { useRouter } from "next/navigation";

interface ProfileDropdownProps {
  onClose: () => void;
  onAction: (action: string) => void;
}

export function ProfileDropdown({ onClose, onAction }: ProfileDropdownProps) {
  const { user, profile } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await AuthService.signOut();
    if (!error) {
      router.push('/login');
    }
    onClose();
  };

  const displayName = profile?.name || user?.user_metadata?.name || 'User';

  return (
    <div className="fixed inset-0 z-50 bg-black/20" onClick={onClose}>
      <div className="absolute top-16 right-4 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-border min-w-48">
        <div className="p-2">
          <div className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">
            {displayName}
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start px-3 py-2 text-sm"
            onClick={() => onAction("profile")}
          >
            <User className="w-4 h-4 mr-2" />
            My Profile
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start px-3 py-2 text-sm"
            onClick={() => onAction("settings")}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start px-3 py-2 text-sm text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
