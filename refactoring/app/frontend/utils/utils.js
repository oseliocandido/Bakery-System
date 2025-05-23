/**
 * Show a message at the top of the body with success or error styling.
 * @param {string} message - The message to display.
 * @param {boolean} isError - If true, shows error styling; otherwise, success.
 */
export function showMessage(message, isError = false) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${isError ? 'error' : 'success'}`;
  msgDiv.textContent = message;

  // Insert at the top of the body (or change to another container if needed)
  document.body.insertBefore(msgDiv, document.body.lastChild);

  setTimeout(() => {
    msgDiv.remove();
  }, 5000);
}