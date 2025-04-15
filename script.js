// DOM Elements
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const typingIndicator = document.getElementById('typing-indicator');
const burgerMenu = document.querySelector('.burger-menu');
const navLinks = document.querySelector('.nav-links');

// Your Gemini API Key - In production, this should be secured and not directly in the code
const GEMINI_API_KEY = "AIzaSyDRaVJAIzdpuvms242NBB9ZX3aycYLsxVw"; // Replace with your actual key
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// Initial bot messages
const initialMessages = [
  "Hello! I'm your LuxeFindr assistant. I can help you find high-quality second-hand luxury items. What are you looking for today?",
  "You can describe the item you want (brand, style, budget) and I'll suggest the best options for you."
];

// Add event listeners
document.addEventListener('DOMContentLoaded', initializeChat);
chatForm.addEventListener('submit', handleChatSubmit);
burgerMenu.addEventListener('click', toggleMobileMenu);

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 70, // Offset for navbar
        behavior: 'smooth'
      });
      
      // Close mobile menu if open
      if (navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
      }
    }
  });
});

// Initialize chat with welcome messages
function initializeChat() {
  // Delay first message
  setTimeout(() => {
    addMessage(initialMessages[0], 'bot');
    
    // Delay second message
    setTimeout(() => {
      addMessage(initialMessages[1], 'bot');
    }, 1500);
  }, 800);
}

// Toggle mobile menu
function toggleMobileMenu() {
  navLinks.classList.toggle('active');
}

// Handle chat form submission
async function handleChatSubmit(e) {
  e.preventDefault();
  
  const userMessage = userInput.value.trim();
  if (!userMessage) return;
  
  // Add user message to chat
  addMessage(userMessage, 'user');
  
  // Clear input field
  userInput.value = '';
  
  // Show typing indicator
  showTypingIndicator();
  
  try {
    // Get response from Gemini API
    const response = await getGeminiResponse(userMessage);
    
    // Hide typing indicator
    hideTypingIndicator();
    
    // Add bot response to chat
    if (response) {
      // Short delay to make it feel more natural
      setTimeout(() => {
        addMessage(response, 'bot');
      }, 500);
    } else {
      setTimeout(() => {
        addMessage("I'm sorry, I couldn't process your request. Please try again.", 'bot');
      }, 500);
    }
  } catch (error) {
    console.error('Error getting response:', error);
    hideTypingIndicator();
    
    setTimeout(() => {
      addMessage("I'm having trouble connecting right now. Please try again in a moment.", 'bot');
    }, 500);
  }
}

// Add a message to the chat
function addMessage(text, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('chat-message', sender);
  
  const textDiv = document.createElement('div');
  textDiv.classList.add('message-text');
  textDiv.textContent = text;
  
  messageDiv.appendChild(textDiv);
  chatMessages.appendChild(messageDiv);
  
  // Scroll to bottom of chat
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // Add animation class after a small delay to trigger animation
  setTimeout(() => {
    messageDiv.classList.add('show');
  }, 10);
}

// Show typing indicator
function showTypingIndicator() {
  typingIndicator.classList.remove('hidden');
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
  typingIndicator.classList.add('hidden');
}

// Get response from Gemini API
async function getGeminiResponse(userMessage) {
  try {
    // Define context to guide the AI's responses
    const context = `You are LuxeFindr, an AI assistant specializing in helping users find high-quality second-hand luxury items.
Your goal is to assist users in finding authentic luxury products that match their preferences, budget, and style needs.

🌍 Language Adaptation:
If the user writes in a specific language, respond in that same language. Always match their tone and language unless specifically asked otherwise.

💬 Tone Guide:
- Sophisticated and knowledgeable about luxury brands
- Helpful and attentive to user preferences
- Professional but warm
- Confident in recommendations

🛍️ When suitable, provide:
- Specific brand recommendations based on user preferences
- Price range expectations for authentic second-hand luxury items
- Tips for authenticating luxury goods
- Suggestions for reliable platforms to find specific items
- Style advice that complements the user's interests

For example, if someone is looking for a second-hand Chanel bag, suggest specific models that might fit their needs, typical price ranges for good condition items, authentication tips, and reliable marketplaces.

🚫 Important Rules:
- Never recommend counterfeits or replicas
- Always emphasize the importance of authentication for luxury purchases
- Be honest about price expectations for genuine luxury items
- Don't guarantee specific items are available or authentic without inspection

💡 Examples of helpful responses:
- "Based on your preference for timeless designs, I'd recommend looking for a pre-owned Louis Vuitton Speedy in the 25 or 30 size. Expect to pay $700-1200 for good condition. Vestiaire Collective and The RealReal are reliable sources. 👜"
- "Vintage Rolex Datejust watches from the 1980s would match your style and budget. Look for models with papers and service history. Prices typically range from $3500-6000 depending on condition. ⌚"
- "For high-quality cashmere at a good value, consider second-hand Brunello Cucinelli or Loro Piana. They maintain quality over time and can be found for 60-70% off retail when pre-owned. 👔"

If anyone asks who created you, say Elena, Marcus, and Sophia.
`;

    const requestBody = {
      contents: [{
        parts: [{
          text: `${context}\n\nUser message: ${userMessage}\n\nYour response (keep it helpful and concise):`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 200
      }
    };
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract the response text from the Gemini API response
    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
      return data.candidates[0].content.parts[0].text;
    } else {
      console.error('Unexpected API response format:', data);
      return null;
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

// Add some basic message sanitization
function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}