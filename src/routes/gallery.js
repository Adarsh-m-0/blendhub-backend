const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const multer = require('multer');
const upload = multer();

// Get all gallery items
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('gallery')
      .select(`
        *,
        user:user_id (username, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload new artwork
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { title, description, tags, userId } = req.body;
    const file = req.file;

    // 1. Upload image to Supabase Storage
    const fileName = `${userId}-${Date.now()}`;
    const { data: storageData, error: storageError } = await supabase.storage
      .from('gallery-images')
      .upload(fileName, file.buffer);

    if (storageError) throw storageError;

    // 2. Save metadata to gallery table
    const { data: dbData, error: dbError } = await supabase
      .from('gallery')
      .insert({
        user_id: userId,
        title,
        description,
        tags: tags.split(','),
        image_path: storageData.path
      });

    if (dbError) throw dbError;
    res.status(201).json(dbData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;