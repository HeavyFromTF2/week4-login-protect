/**
 * Auth Controller.
 * Handles user Sign Up and Log In using Supabase Auth.
 */

const supabase = require('../config/supabase');

const authController = {
  // POST /auth/signup
  async signUp(req, res) {
    try {
      const { email, password } = req.body;

      // Validate required fields (400 Bad Request)
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Call Supabase Auth SDK to create user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // 201 Created on success
      return res.status(201).json({
        message: 'User has been created successfully',
        user: data.user,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // POST /auth/login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate required fields (400 Bad Request)
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Call Supabase Auth SDK to authenticate
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // If credentials are bad or rejected -> 401 Unauthorized
      if (error) {
        return res.status(401).json({ error: 'Invalid login credentials' });
      }

      // 200 OK returning tokens
      return res.status(200).json({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        user: data.user,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // POST /auth/logout
  async logout(req, res) {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // Return HTTP 204 No Content on successful logout
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
};


module.exports = authController;