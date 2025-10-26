/**
 * ROLE: Backend Lead
 * Chatbot controller - Handles AI chat interactions
 * - POST /api/chat - Send message and get AI response
 * - GET /api/chat/history/:sessionId - Get conversation history
 * - DELETE /api/chat/history/:sessionId - Clear conversation
 */

const chatbotService = require('../services/chatbotService');

/**
 * POST /api/chat
 * Send message to AI chatbot and get response
 */
const sendMessage = async (req, res) => {
  try {
    const { message, sessionId, jobId } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({
        error: 'Message and sessionId are required'
      });
    }

    // Build context from job data if available
    let context = { jobId };
    
    if (jobId) {
      // In a real implementation, you'd fetch this from your database
      // For now, we'll use mock data or could call other services
      context = {
        jobId,
        cashBalance: 85000,
        monthlyBurn: 45000,
        runway: 1.9,
        revenue: 125000
      };
    }

    // Generate AI response
    const result = await chatbotService.generateResponse(message, sessionId, context);

    res.json({
      success: true,
      message: result.response,
      suggestions: result.suggestions,
      sessionId: result.sessionId,
      timestamp: result.timestamp,
      error: result.error || false
    });

  } catch (error) {
    console.error('Chat controller error:', error);
    res.status(500).json({
      error: 'Failed to process chat message',
      message: 'Estoy experimentando problemas técnicos. Intenta de nuevo en un momento.'
    });
  }
};

/**
 * GET /api/chat/history/:sessionId
 * Get conversation history for a session
 */
const getHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const history = chatbotService.getHistory(sessionId);

    res.json({
      success: true,
      history: history,
      sessionId: sessionId
    });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      error: 'Failed to retrieve chat history'
    });
  }
};

/**
 * DELETE /api/chat/history/:sessionId
 * Clear conversation history for a session
 */
const clearHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    chatbotService.clearHistory(sessionId);

    res.json({
      success: true,
      message: 'Chat history cleared',
      sessionId: sessionId
    });

  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({
      error: 'Failed to clear chat history'
    });
  }
};

module.exports = {
  sendMessage,
  getHistory,
  clearHistory
};