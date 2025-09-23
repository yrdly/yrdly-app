"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-supabase-auth";
import { StorageService } from "@/lib/storage-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImagePlus, Send } from "lucide-react";

interface ChatLayoutTestProps {
  selectedConversationId?: string;
}

export function ChatLayoutTest({ selectedConversationId }: ChatLayoutTestProps) {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    try {
      const { url, error } = await StorageService.uploadChatImage("test-conversation", selectedFile);
      
      if (error) {
        console.error('Upload error:', error);
        setUploadResult(`Error: ${error.message}`);
      } else {
        setUploadResult(`Success! URL: ${url}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult(`Error: ${error}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="m-4">
        <CardHeader>
          <CardTitle>Storage Test - Chat Image Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select an image to upload:
            </label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="mb-4"
            />
          </div>
          
          {selectedFile && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            </div>
          )}
          
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <ImagePlus className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Upload Image
              </>
            )}
          </Button>
          
          {uploadResult && (
            <div className="mt-4 p-3 bg-gray-100 rounded">
              <p className="text-sm">{uploadResult}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
