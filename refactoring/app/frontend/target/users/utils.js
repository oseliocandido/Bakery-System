// Helper functions for messages
export function showMessage(message, isError = false) {
  const messageContainer = document.createElement('div');
  messageContainer.className = `message ${isError ? 'error' : 'success'}`;
  messageContainer.textContent = message;
  
  // Insert at the top of the content area
  const contentArea = document.querySelector('.content');
  contentArea.insertBefore(messageContainer, contentArea.firstChild);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    messageContainer.remove();
  }, 5000);
}