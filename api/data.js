import { put, list, head } from '@vercel/blob';

// In-memory fallback if Vercel Blob is not yet linked
let memoryStorage = null;

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  // GET: Fetch shared team records (users, tasks, projects, reminderConfig)
  if (req.method === 'GET') {
    if (hasBlobToken) {
      try {
        const { blobs } = await list({ prefix: 'work-tracker-data.json' });
        const existingBlob = blobs.find(b => b.pathname === 'work-tracker-data.json');
        
        if (existingBlob) {
          const response = await fetch(existingBlob.url, { cache: 'no-store' });
          if (response.ok) {
            const data = await response.json();
            return res.status(200).json({ success: true, source: 'vercel-blob', data });
          }
        }
      } catch (error) {
        console.warn('Vercel Blob GET error, falling back:', error.message);
      }
    }

    if (memoryStorage) {
      return res.status(200).json({ success: true, source: 'memory-cache', data: memoryStorage });
    }

    return res.status(200).json({ success: true, source: 'none', data: null });
  }

  // POST: Save shared team records
  if (req.method === 'POST') {
    try {
      const payload = req.body;
      if (!payload) {
        return res.status(400).json({ success: false, error: 'Empty payload' });
      }

      memoryStorage = payload;

      if (hasBlobToken) {
        try {
          const blob = await put('work-tracker-data.json', JSON.stringify(payload, null, 2), {
            access: 'public',
            addRandomSuffix: false,
            contentType: 'application/json'
          });

          return res.status(200).json({
            success: true,
            storage: 'vercel-blob',
            url: blob.url,
            timestamp: new Date().toISOString()
          });
        } catch (blobErr) {
          console.error('Vercel Blob PUT error:', blobErr);
          return res.status(200).json({
            success: true,
            storage: 'memory-fallback',
            warning: 'Blob upload failed: ' + blobErr.message,
            timestamp: new Date().toISOString()
          });
        }
      }

      return res.status(200).json({
        success: true,
        storage: 'local-memory',
        note: 'Add BLOB_READ_WRITE_TOKEN in Vercel settings for permanent cloud storage across restarts.',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
