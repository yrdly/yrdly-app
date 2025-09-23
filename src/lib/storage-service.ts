import { supabase } from './supabase';

export class StorageService {
  // Upload a file to Supabase Storage
  static async uploadFile(
    bucket: string,
    path: string,
    file: File,
    options?: {
      cacheControl?: string;
      contentType?: string;
    }
  ): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: options?.cacheControl || '3600',
          upsert: false,
          contentType: options?.contentType || file.type,
        });

      if (error) {
        console.error('Storage upload error:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Storage upload error:', error);
      return { data: null, error };
    }
  }

  // Get public URL for a file
  static getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  // Get signed URL for a file (for private files)
  static async getSignedUrl(
    bucket: string,
    path: string,
    expiresIn: number = 3600
  ): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        console.error('Storage signed URL error:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Storage signed URL error:', error);
      return { data: null, error };
    }
  }

  // Delete a file
  static async deleteFile(
    bucket: string,
    path: string
  ): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.error('Storage delete error:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Storage delete error:', error);
      return { data: null, error };
    }
  }

  // List files in a bucket
  static async listFiles(
    bucket: string,
    path?: string
  ): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path || '');

      if (error) {
        console.error('Storage list error:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Storage list error:', error);
      return { data: null, error };
    }
  }

  // Upload post image
  static async uploadPostImage(
    postId: string,
    file: File
  ): Promise<{ url: string | null; error: any }> {
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const path = `posts/${postId}/${fileName}`;

      const { data, error } = await this.uploadFile('post-images', path, file);
      
      if (error) {
        return { url: null, error };
      }

      const publicUrl = this.getPublicUrl('post-images', path);
      return { url: publicUrl, error: null };
    } catch (error) {
      console.error('Upload post image error:', error);
      return { url: null, error };
    }
  }

  // Upload chat image
  static async uploadChatImage(
    conversationId: string,
    file: File
  ): Promise<{ url: string | null; error: any }> {
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const path = `chat_images/${conversationId}/${fileName}`;

      const { data, error } = await this.uploadFile('chat-images', path, file);
      
      if (error) {
        return { url: null, error };
      }

      const publicUrl = this.getPublicUrl('chat-images', path);
      return { url: publicUrl, error: null };
    } catch (error) {
      console.error('Upload chat image error:', error);
      return { url: null, error };
    }
  }

  // Upload user avatar
  static async uploadUserAvatar(
    userId: string,
    file: File
  ): Promise<{ url: string | null; error: any }> {
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const path = `avatars/${userId}/${fileName}`;

      const { data, error } = await this.uploadFile('user-avatars', path, file);
      
      if (error) {
        return { url: null, error };
      }

      const publicUrl = this.getPublicUrl('user-avatars', path);
      return { url: publicUrl, error: null };
    } catch (error) {
      console.error('Upload user avatar error:', error);
      return { url: null, error };
    }
  }
}
