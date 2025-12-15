/**
 * Message Utility Functions
 * Utilities for processing and cleaning message content
 */

/**
 * Check if a message is a system-generated message
 * System messages typically have:
 * - No sender (from is null or undefined)
 * - systemEventMessage in content
 * - contentType of 'systemEventMessage'
 */
export function isSystemMessage(msg: any): boolean {
  // Check if message has no sender
  if (!msg.sender && !msg.from?.user && !msg.from) {
    return true;
  }

  // Check if content contains system event message
  const content = msg.text || msg.body?.content || msg.content || '';
  if (content.includes('<systemEventMessage') || content.includes('systemEventMessage')) {
    return true;
  }

  // Check contentType
  if (msg.contentType === 'systemEventMessage' || msg.body?.contentType === 'systemEventMessage') {
    return true;
  }

  // Check if message type is system
  if (msg.messageType === 'system' || msg.type === 'system') {
    return true;
  }

  return false;
}

/**
 * Strip HTML tags from text
 * Works in both browser and server environments
 */
export function stripHtmlTags(html: string): string {
  if (!html) return '';
  
  // Use regex for server-side compatibility
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .trim();
}

/**
 * Decode HTML entities (like &nbsp;, &amp;, etc.)
 * Works in both browser and server environments
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  
  // Use regex replacements for common HTML entities
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#x60;/g, '`')
    .replace(/&#x3D;/g, '=');
}

/**
 * Clean message text by:
 * 1. Stripping HTML tags
 * 2. Decoding HTML entities
 * 3. Trimming whitespace
 */
export function cleanMessageText(text: string): string {
  if (!text) return '';
  
  // First decode HTML entities
  let cleaned = decodeHtmlEntities(text);
  
  // Then strip HTML tags
  cleaned = stripHtmlTags(cleaned);
  
  // Trim whitespace and normalize spaces
  cleaned = cleaned.trim().replace(/\s+/g, ' ');
  
  return cleaned;
}

/**
 * Process and clean a message object
 * Returns null if message should be filtered out (system message)
 */
export function processMessage(msg: any): any | null {
  // Filter out system messages
  if (isSystemMessage(msg)) {
    return null;
  }

  // Clean the message text
  const cleanedText = cleanMessageText(msg.text || msg.body?.content || msg.content || '');
  
  // If message has no content after cleaning, filter it out
  if (!cleanedText || cleanedText.trim().length === 0) {
    return null;
  }

  // Return message with cleaned text
  return {
    ...msg,
    text: cleanedText,
    // Also update body content if it exists
    body: msg.body ? {
      ...msg.body,
      content: cleanedText,
    } : undefined,
  };
}

