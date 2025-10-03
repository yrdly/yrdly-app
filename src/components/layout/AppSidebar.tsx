
'use client';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Home, ShoppingCart, Calendar, Briefcase, MessageSquare, Settings, Users, Map, User as UserIcon, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-supabase-auth';
import { AuthService } from '@/lib/auth-service';
import { useFriendRequests } from '@/hooks/use-friend-requests';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

export function AppSidebar({ onProfileClick }: { onProfileClick: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { pendingCount } = useFriendRequests();

  const handleLogout = async () => {
    const { error } = await AuthService.signOut();
    if (!error) {
      router.push('/login');
    }
  };

  const menuItems = [
    { href: '/home', label: 'Newsfeed', icon: Home },
    { href: '/map', label: 'Map', icon: Map },
    { href: '/events', label: 'Events', icon: Calendar },
    { href: '/marketplace', label: 'Marketplace', icon: ShoppingCart },
    { href: '/businesses', label: 'Businesses', icon: Briefcase },
    { href: '/neighbors', label: 'Community', icon: Users, badge: pendingCount > 0 ? pendingCount : null },
    { href: '/messages', label: 'Messages', icon: MessageSquare },
  ];

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="p-6 border-b border-border/50">
        <Link href="/home" className="flex items-center gap-3 group">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Image src="/yrdly-logo.png" alt="Yrdly Logo" width={24} height={24} style={{ width: "auto", height: "auto" }} />
            </div>
            <span className="font-bold text-xl font-headline bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Yrdly</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-4 space-y-2">
        <SidebarMenu className="space-y-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith('/settings/profile')}
              tooltip={{ children: 'My Profile', side: 'right' }}
              className="group hover:bg-primary/10 transition-colors"
            >
              <Link href="/settings/profile" className="flex items-center gap-3">
                <div className="p-1.5 rounded-md bg-muted group-hover:bg-primary/20 transition-colors">
                  <UserIcon className="h-4 w-4" />
                </div>
                <span className="font-medium">My Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={{ children: item.label, side: 'right' }}
                className="group hover:bg-primary/10 transition-colors"
              >
                <Link href={item.href} className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-muted group-hover:bg-primary/20 transition-colors">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge != null && item.badge > 0 && (
                    <Badge className="h-5 w-5 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border/50">
         <SidebarMenu className="space-y-1">
          <SidebarMenuItem>
             <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/settings') && !pathname.startsWith('/settings/profile')}
                 tooltip={{ children: 'Settings', side: 'right' }}
                 className="group hover:bg-primary/10 transition-colors"
              >
                <Link href="/settings" className="flex items-center gap-3">
                  <div className="p-1.5 rounded-md bg-muted group-hover:bg-primary/20 transition-colors">
                    <Settings className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Settings</span>
                </Link>
              </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
             <SidebarMenuButton
                onClick={handleLogout}
                tooltip={{ children: 'Log out', side: 'right' }}
                className="group hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
              >
                <div className="p-1.5 rounded-md bg-muted group-hover:bg-destructive/20 transition-colors">
                  <LogOut className="h-4 w-4" />
                </div>
                <span className="font-medium">Log out</span>
              </SidebarMenuButton>
          </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
