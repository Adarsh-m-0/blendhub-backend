const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');

// User signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    // 1. Create auth user
    const { user, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) throw authError;

    // 2. Create profile in users table
    const { error: dbError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        username,
        avatar_url: `https://ui-avatars.com/api/?name=${username}`
      });

    if (dbError) throw dbError;
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, error } = await supabase.auth.signIn({
      email,
      password
    });

    if (error) throw error;
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

module.exports = router;