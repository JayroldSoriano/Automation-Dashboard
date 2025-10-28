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
  },

  // Update patient's bot active status
  async updatePatientBotStatus(senderId, isBotActive) {
    try {
      if (!senderId) {
        throw new Error('Missing sender_id parameter');
      }

      const { data, error } = await supabase
        .from('patients')
        .update({ isbotactive: isBotActive })
        .eq('sender_id', senderId)
        .select();

      if (error) {
        console.error('Error updating patient bot status:', error);
        throw new Error(`Failed to update bot status: ${error.message}`);
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Error in updatePatientBotStatus:', error);
      throw error;
    }
  },

  // Fetch chatbot conversations grouped by sender_id
  async getConversations(limit = 50) {
    try {
      // First, get all chat messages ordered by created_at
      const { data: chatMessages, error: chatError } = await supabase
        .from('chat_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit * 10); // Get more messages to process

      if (chatError) {
        console.error('Error fetching chat messages:', chatError);
        throw new Error(`Failed to fetch chat messages: ${chatError.message}`);
      }

      if (!chatMessages || chatMessages.length === 0) {
        return [];
      }

      // Group messages by sender_id and get unique sessions
      const sessionsMap = new Map();

      chatMessages.forEach(message => {
        if (!sessionsMap.has(message.sender_id)) {
          sessionsMap.set(message.sender_id, {
            sender_id: message.sender_id,
            messages: []
          });
        }
        sessionsMap.get(message.sender_id).messages.push(message);
      });

      // Get patient names for all sender_ids
      const senderIds = Array.from(sessionsMap.keys());
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('sender_id, name, session_id')
        .in('sender_id', senderIds);

      if (patientsError) {
        console.error('Error fetching patients:', patientsError);
        // Continue without patient names
      }

      // Create a map of sender_id to patient info
      const patientsMap = new Map();
      if (patientsData) {
        patientsData.forEach(patient => {
          patientsMap.set(patient.sender_id, patient);
        });
      }

      // Process each session
      const conversations = [];
      
      sessionsMap.forEach((session, senderId) => {
        const patient = patientsMap.get(senderId);
        
        // Get the last user message
        const userMessages = session.messages.filter(m => m.role === 'user');
        const lastUserMessage = userMessages.length > 0 ? userMessages[0].text : '—';

        // Get the last bot reply
        const botMessages = session.messages.filter(m => m.role === 'bot');
        const lastBotReply = botMessages.length > 0 ? botMessages[0].text : '—';

        // Get the most recent timestamp
        const latestMessage = session.messages[0];
        const timestamp = latestMessage ? latestMessage.created_at : new Date().toISOString();

        conversations.push({
          session_id: patient?.session_id || senderId.slice(0, 8) || '—',
          patient_name: patient?.name || 'Unknown Patient',
          last_message: lastUserMessage,
          last_ai_reply: lastBotReply,
          timestamp: timestamp,
          sender_id: senderId
        });
      });

      // Sort by timestamp (most recent first) and limit
      conversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return conversations.slice(0, limit);
    } catch (error) {
      console.error('Error in getConversations:', error);
      throw error;
    }
  }
};