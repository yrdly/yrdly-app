"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Search } from "lucide-react";

interface SearchDialogProps {
  onClose: () => void;
}

export function SearchDialog({ onClose }: SearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
      <div className="flex items-center h-16 px-4 border-b">
        <Button variant="ghost" size="icon" onClick={onClose} className="mr-2">
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>
      </div>
      <div className="flex-1 p-4 overflow-auto">
        {searchTerm ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Search results for &quot;{searchTerm}&quot;</p>
            <p className="text-sm text-muted-foreground mt-2">No results found</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Start typing to search...</p>
          </div>
        )}
      </div>
    </div>
  );
}