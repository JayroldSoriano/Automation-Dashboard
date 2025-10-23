import { supabase } from '../config/supabase';

export const chatService = {
  // Fetch chat history for a specific sender
  async getChatHistory(senderId, limit = 100) {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('sender_id', senderId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching chat history:', error);
        throw new Error(`Failed to fetch chat history: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getChatHistory:', error);
      throw error;
    }
  },

  // Add a new message to chat history
  async addMessage(senderId, text, platform, role) {
    try {
      // Validate input parameters
      if (!senderId || !text || !platform || !role) {
        throw new Error('Missing required parameters for message');
      }

      if (!['user', 'bot'].includes(role)) {
        throw new Error('Invalid role. Must be "user" or "bot"');
      }

      const messageData = {
        sender_id: senderId,
        text: text.trim(),
        platform: platform,
        role: role,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('chat_history')
        .insert([messageData])
        .select();

      if (error) {
        console.error('Error adding message:', error);
        throw new Error(`Failed to send message: ${error.message}`);
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Error in addMessage:', error);
      throw error;
    }
  }
};