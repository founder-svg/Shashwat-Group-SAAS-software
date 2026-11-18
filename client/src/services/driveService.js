import { supabase, isConfigured, initialDemoData } from '../config/supabaseClient';

const LOCAL_DRIVE_KEY = 'shashwat_drive_cache';

function getCachedFiles() {
  const cached = localStorage.getItem(LOCAL_DRIVE_KEY);
  if (cached) {
    try { 
      const parsed = JSON.parse(cached);
      return parsed.filter(f => !['df-1', 'df-2', 'df-3'].includes(f.id));
    } catch (e) {}
  }
  return [];
}

function saveCachedFiles(files) {
  localStorage.setItem(LOCAL_DRIVE_KEY, JSON.stringify(files));
}

export const driveService = {
  async getFiles(category = null) {
    if (!isConfigured) {
      let list = getCachedFiles();
      if (category && category !== 'all') {
        list = list.filter(f => f.folder_category.toLowerCase() === category.toLowerCase());
      }
      return { data: list, error: null };
    }

    let query = supabase.from('drive_files').select('*').order('created_at', { ascending: false });
    if (category && category !== 'all') {
      query = query.eq('folder_category', category);
    }

    const { data, error } = await query;
    return { data, error };
  },

  async addFileRecord({ fileName, folderCategory, fileSizeKB, webViewLink }) {
    if (!isConfigured) {
      const files = getCachedFiles();
      const newFile = {
        id: `df-${Date.now()}`,
        file_name: fileName,
        folder_category: folderCategory || 'general',
        file_size_kb: fileSizeKB || 5.0,
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
        web_view_link: webViewLink || 'https://drive.google.com'
      };
      files.unshift(newFile);
      saveCachedFiles(files);
      return { data: newFile, error: null };
    }

    const { data, error } = await supabase
      .from('drive_files')
      .insert([{
        file_name: fileName,
        folder_category: folderCategory,
        file_size_bytes: Math.round((fileSizeKB || 5) * 1024),
        web_view_link: webViewLink,
        drive_provider: 'google_drive'
      }])
      .select()
      .single();

    return { data, error };
  },

  async updateFile(fileId, updates) {
    if (!isConfigured) {
      const files = getCachedFiles();
      const idx = files.findIndex(f => f.id === fileId);
      if (idx !== -1) {
        files[idx] = { ...files[idx], ...updates };
        saveCachedFiles(files);
        return { data: files[idx], error: null };
      }
      return { error: { message: 'File not found' } };
    }

    const { data, error } = await supabase
      .from('drive_files')
      .update(updates)
      .eq('id', fileId)
      .select()
      .single();
    return { data, error };
  },

  async deleteFile(fileId) {
    if (!isConfigured) {
      let files = getCachedFiles();
      files = files.filter(f => f.id !== fileId);
      saveCachedFiles(files);
      return { data: { success: true }, error: null };
    }

    const { data, error } = await supabase
      .from('drive_files')
      .delete()
      .eq('id', fileId);
    return { data, error };
  }
};
