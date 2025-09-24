import { supabase } from '@/lib/supabase';

// Generic fetcher for Supabase tables
export const supabaseFetcher = async (key: string) => {
  try {
    // Parse the key to extract table and options
    const [tableName, ...options] = key.split('|');
    
    if (options.length === 0) {
      // Simple table fetch
      const { data, error } = await supabase
        .from(tableName)
        .select('*');
      
      if (error) throw error;
      return data;
    }
    
    // For now, just do a simple fetch with basic options
    let query = supabase.from(tableName).select('*');
    
    // Apply basic limit if specified
    const limitOption = options.find(opt => opt.startsWith('limit:'));
    if (limitOption) {
      const limit = parseInt(limitOption.split(':')[1]);
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// Legacy alias for backward compatibility
export const firestoreFetcher = supabaseFetcher;