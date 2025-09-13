class URLShortener {
    constructor() {
        this.urlInput = document.getElementById('url-input');
        this.shortenBtn = document.getElementById('shorten-btn');
        this.btnText = document.querySelector('.btn-text');
        this.btnSpinner = document.querySelector('.btn-spinner'); 
        this.errorSection = document.getElementById('error-section');
        this.errorMessage = document.getElementById('error-message'); 
        this.errorText = document.querySelector('.error-text');
        this.successSection = document.getElementById('success-section');
        this.shortenedUrlInput = document.getElementById('shortened-url');
        this.copyBtn = document.getElementById('copy-btn');
        this.copyText = document.querySelector('.copy-text');
        this.copySuccess = document.getElementById('copy-success');
        this.newUrlBtn = document.getElementById('new-url-btn');

        this.isLoading = false;
        this.currentCallbackName = null;

        this.init();
    }

    init() {
        this.bindEvents();
        this.focusInput();
        
        this.cleanupGlobalCallbacks();
    }

 
    bindEvents() {
        this.urlInput.addEventListener('input', () => this.handleInputChange());
        this.urlInput.addEventListener('paste', () => {
            setTimeout(() => this.handleInputChange(), 10);
        });

        this.shortenBtn.addEventListener('click', () => this.handleShortenClick());
        this.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleShortenClick();
            }
        });

        this.copyBtn.addEventListener('click', () => this.handleCopyClick());

        this.newUrlBtn.addEventListener('click', () => this.handleNewUrlClick());

        this.shortenedUrlInput.addEventListener('click', () => {
            this.shortenedUrlInput.select();
        });
    }

 
    focusInput() {
        this.urlInput.focus();
    }

  
    handleInputChange() {
        this.hideError();
        this.validateInput();
    }

 
    validateInput() {
        const url = this.urlInput.value.trim();
        
        if (!url) {
            this.urlInput.classList.remove('valid', 'invalid');
            return true;
        }

        const isValid = this.isValidURL(url);
        
        if (isValid) {
            this.urlInput.classList.add('valid');
            this.urlInput.classList.remove('invalid');
        } else {
            this.urlInput.classList.add('invalid');
            this.urlInput.classList.remove('valid');
        }

        return isValid;
    }

  
    isValidURL(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (e) {
            // Try adding https:// if it looks like a domain
            if (string.includes('.') && !string.includes(' ') && !string.startsWith('http')) {
                try {
                    new URL('https://' + string);
                    return true;
                } catch (e2) {
                    return false;
                }
            }
            return false;
        }
    }

 
    normalizeURL(url) {
        url = url.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        return url;
    }


    async handleShortenClick() {
        if (this.isLoading) return;

        const url = this.urlInput.value.trim();
        
        if (!url) {
            this.showError('Please enter a URL to shorten.');
            this.urlInput.focus();
            return;
        }

        if (!this.validateInput()) {
            this.showError('Please enter a valid URL starting with http:// or https://');
            this.urlInput.focus();
            return;
        }

        const normalizedUrl = this.normalizeURL(url);
        
        try {
            this.setLoadingState(true);
            this.hideError();
            
            const shortUrl = await this.shortenURL(normalizedUrl);
            this.showSuccess(shortUrl);
            
        } catch (error) {
            console.error('Error shortening URL:', error);
            this.showError(error.message || 'Failed to shorten URL. Please try again.');
        } finally {
            this.setLoadingState(false);
        }
    }


    shortenURL(url) {
        return new Promise((resolve, reject) => {
            const callbackName = `urlShortenerCallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.currentCallbackName = callbackName;

            window[callbackName] = (response) => {
                try {
                    this.cleanup(callbackName);
                    
                    if (response.shorturl) {
                        // Success response
                        resolve(response.shorturl);
                    } else if (response.errorcode) {
                        // Error response from API
                        const errorMessage = this.getErrorMessage(response.errorcode, response.errormessage);
                        reject(new Error(errorMessage));
                    } else {
                        // Unexpected response format
                        reject(new Error('Unexpected response from URL shortening service.'));
                    }
                } catch (error) {
                    reject(new Error('Failed to process response from URL shortening service.'));
                }
            };

            // Create script element for JSONP request
            const script = document.createElement('script');
            script.id = `jsonp_${callbackName}`;
            
            // Build API URL with encoded parameters
            const encodedUrl = encodeURIComponent(url);
            const apiUrl = `https://is.gd/create.php?format=json&url=${encodedUrl}&callback=${callbackName}`;
            
            script.src = apiUrl;
            
            // Handle script loading errors
            script.onerror = () => {
                this.cleanup(callbackName);
                reject(new Error('Network error. Please check your connection and try again.'));
            };

            // Timeout handling
            const timeout = setTimeout(() => {
                this.cleanup(callbackName);
                reject(new Error('Request timed out. Please try again.'));
            }, 10000); // 10 second timeout

            // Store timeout ID for cleanup
            window[callbackName + '_timeout'] = timeout;

            // Add script to document to trigger the request
            document.head.appendChild(script);
        });
    }

    /**
     * Clean up JSONP resources
     */
    cleanup(callbackName) {
        // Clear timeout
        const timeoutId = window[callbackName + '_timeout'];
        if (timeoutId) {
            clearTimeout(timeoutId);
            delete window[callbackName + '_timeout'];
        }

        // Remove script element
        const script = document.getElementById(`jsonp_${callbackName}`);
        if (script) {
            document.head.removeChild(script);
        }

        // Remove global callback
        if (window[callbackName]) {
            delete window[callbackName];
        }
    }

    /**
     * Clean up any remaining global callbacks (for page refresh scenarios)
     */
    cleanupGlobalCallbacks() {
        Object.keys(window).forEach(key => {
            if (key.startsWith('urlShortenerCallback_')) {
                delete window[key];
            }
        });
    }

    /**
     * Get user-friendly error message based on error code
     */
    getErrorMessage(errorCode, originalMessage) {
        const errorMessages = {
            1: 'The URL you entered is not valid. Please check and try again.',
            2: 'The URL you entered has been blocked by our security filters.',
            3: 'The URL you entered is on our blacklist.',
            4: 'The IP address has been blocked due to abuse.',
            5: 'The URL you entered is too long.',
            6: 'The URL you entered contains invalid characters.'
        };

        return errorMessages[errorCode] || originalMessage || 'An error occurred while shortening the URL.';
    }

    /**
     * Set loading state for the button
     */
    setLoadingState(loading) {
        this.isLoading = loading;
        
        if (loading) {
            this.btnText.classList.add('hidden');
            this.btnSpinner.classList.remove('hidden');
            this.shortenBtn.disabled = true;
            this.shortenBtn.setAttribute('aria-label', 'Shortening URL, please wait...');
        } else {
            this.btnText.classList.remove('hidden');
            this.btnSpinner.classList.add('hidden');
            this.shortenBtn.disabled = false;
            this.shortenBtn.removeAttribute('aria-label');
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        this.errorText.textContent = message;
        this.errorMessage.classList.remove('hidden');
        this.errorSection.classList.remove('hidden');
        this.successSection.classList.add('hidden');
        
        // Scroll error into view if needed
        this.errorSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Hide error message
     */
    hideError() {
        this.errorMessage.classList.add('hidden');
        this.errorSection.classList.add('hidden');
    }

    /**
     * Show success state with shortened URL
     */
    showSuccess(shortUrl) {
        this.shortenedUrlInput.value = shortUrl;
        this.successSection.classList.remove('hidden');
        this.hideError();
        
        // Reset copy button state
        this.resetCopyButton();
        this.hideCopySuccess();
        
        // Scroll success section into view
        this.successSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Handle copy button click
     */
    async handleCopyClick() {
        const url = this.shortenedUrlInput.value;
        
        try {
            await this.copyToClipboard(url);
            this.showCopySuccess();
            this.updateCopyButton(true);
        } catch (error) {
            console.error('Copy failed:', error);
            // Fallback: select the text for manual copying
            this.shortenedUrlInput.select();
            this.shortenedUrlInput.setSelectionRange(0, 99999); // For mobile devices
            
            // Try execCommand as fallback
            try {
                document.execCommand('copy');
                this.showCopySuccess();
                this.updateCopyButton(true);
            } catch (fallbackError) {
                console.error('Fallback copy failed:', fallbackError);
                alert('Unable to copy automatically. The URL has been selected - please copy it manually (Ctrl+C or Cmd+C).');
            }
        }
    }

    /**
     * Copy text to clipboard using modern Clipboard API with fallback
     */
    async copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            // Use modern Clipboard API
            await navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            throw new Error('Clipboard API not available');
        }
    }

    /**
     * Update copy button appearance
     */
    updateCopyButton(copied) {
        if (copied) {
            this.copyText.textContent = 'Copied!';
            this.copyBtn.classList.add('btn--success');
            
            // Reset after 2 seconds
            setTimeout(() => {
                this.resetCopyButton();
            }, 2000);
        }
    }

    resetCopyButton() {
        this.copyText.textContent = 'Copy';
        this.copyBtn.classList.remove('btn--success');
    }

 
    showCopySuccess() {
        this.copySuccess.classList.remove('hidden');
        
        setTimeout(() => {
            this.hideCopySuccess();
        }, 3000);
    }

 
    hideCopySuccess() {
        this.copySuccess.classList.add('hidden');
    }

    
    handleNewUrlClick() {
        this.urlInput.value = '';
        this.urlInput.classList.remove('valid', 'invalid');
        this.successSection.classList.add('hidden');
        this.hideError();
        this.hideCopySuccess();
        
        this.urlInput.focus();
        
        this.urlInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new URLShortener();
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        Object.keys(window).forEach(key => {
            if (key.startsWith('urlShortenerCallback_')) {
                const timeoutId = window[key + '_timeout'];
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    delete window[key + '_timeout'];
                }
                delete window[key];
            }
        });
    }
});

