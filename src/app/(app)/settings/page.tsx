
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, UserCircle, Bell, Palette } from "lucide-react";
import Link from "next/link";

const settingsItems = [
    {
        href: "/settings/profile",
        icon: UserCircle,
        title: "Edit Profile",
        description: "Update your name, bio, and location."
    },
    {
        href: "/settings/notifications",
        icon: Bell,
        title: "Notifications",
        description: "Manage how you receive notifications."
    },
    {
        href: "/settings/appearance",
        icon: Palette,
        title: "Appearance",
        description: "Customize the look and feel of the app."
    }
]

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold font-headline mb-6">Settings</h1>
        <Card>
            <CardContent className="p-0">
                <ul className="divide-y">
                    {settingsItems.map((item) => (
                        <li key={item.href}>
                            <Link href={item.href} className="flex items-center gap-4 p-4 hover:bg-muted/50">
                                <item.icon className="h-6 w-6 text-muted-foreground" />
                                <div className="flex-1">
                                    <h3 className="font-semibold">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </Link>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    </div>
  );
}
