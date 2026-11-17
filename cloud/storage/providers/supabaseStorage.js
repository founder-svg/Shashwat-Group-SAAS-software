/**
 * Supabase Storage Provider
 * Free Tier: 1 GB Storage, 2 GB Bandwidth / month
 */

const { createClient } = require('@supabase/supabase-js');

let supabase = null;

function getClient() {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials (SUPABASE_URL and SUPABASE_ANON_KEY) are missing in .env');
    }

    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

module.exports = {
  name: 'supabase',

  async upload(file, folder = 'general') {
    try {
      const client = getClient();
      const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'crm-documents';

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${folder}/${uniqueSuffix}-${sanitizedFilename}`;

      const { data, error } = await client.storage
        .from(bucketName)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        });

      if (error) {
        throw error;
      }

      const { data: publicUrlData } = client.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return {
        success: true,
        provider: 'supabase',
        key: filePath,
        url: publicUrlData.publicUrl,
        size: file.size,
        mimeType: file.mimetype,
        originalName: file.originalname
      };
    } catch (err) {
      console.error('[Supabase Storage Error]:', err.message);
      throw err;
    }
  },

  async delete(fileKey) {
    const client = getClient();
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'crm-documents';
    const { error } = await client.storage.from(bucketName).remove([fileKey]);
    if (error) throw error;
    return { success: true };
  },

  async getUrl(fileKey) {
    const client = getClient();
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'crm-documents';
    const { data } = client.storage.from(bucketName).getPublicUrl(fileKey);
    return data.publicUrl;
  }
};
