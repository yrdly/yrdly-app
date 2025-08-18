"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold font-headline mb-6">Settings</h1>
        <Card>
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                    Customize the look and feel of the app.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Theme</p>
                    <ThemeToggle />
                </div>
            </CardContent>
        </Card>
    </div>
  );
}