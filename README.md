# URL Shortener

A sleek and functional **client-side URL shortener** built with pure HTML, CSS, and JavaScript. This single-page web app allows users to paste long URLs and get shortened links instantly using the [is.gd](https://is.gd) URL shortening API—without the need for any backend or server.

## Demo

Try the live demo [here](##https://jojoaarti.github.io/URL-Shortener/##)

---

## Features

- **Instant URL shortening** by communicating directly with the is.gd API using JSONP to bypass CORS restrictions.
- **Real-time URL validation** with helpful feedback for invalid URLs.
- **Clean and modern UI** with an intuitive single-column layout and responsive design for mobile and desktop.
- **Loading feedback** with spinner animations and button text change during API calls.
- **Copy to clipboard** functionality with user-friendly visual confirmation.
- **Robust error handling** with clear messages for invalid URLs, network errors, or API issues.
- **Accessibility**: Keyboard navigable and ARIA-compliant for screen readers.
- **Zero dependencies**: No libraries or frameworks used, pure vanilla JavaScript.
- **100% client-side**: No backend server required; easy to deploy on GitHub Pages or any static hosting platform.

---

## How It Works

This project uses the [is.gd API](https://is.gd/developers.php) for URL shortening, which supports JSONP—a technique that allows the app to perform cross-origin requests by dynamically injecting script tags.

The shortened URL is fetched by creating a unique callback function for each request, which processes the JSONP response and updates the UI accordingly.

---

## Installation & Deployment

1. Clone the repository:
git clone https://github.com/yourusername/url-shortener.git

text
2. Navigate to the project directory:
cd url-shortener

text
3. Open `index.html` in any modern web browser to use it locally.
4. To deploy, simply upload the files to any static hosting service such as [GitHub Pages](https://pages.github.com/), Netlify, Vercel, or Firebase Hosting.

---

## Usage

- Paste a long URL into the input field.
- The input field validates the URL in real-time.
- Click the **Shorten URL** button.
- The app shows a loading spinner and then displays the shortened URL.
- Click the **Copy** button to copy the shortened URL to your clipboard.
- You can shorten new URLs by entering another link.

---

## File Structure

/
├── index.html # Main HTML file
├── style.css # Stylesheet with all UI styling and animations
└── app.js # JavaScript handling UI logic, JSONP calls, validation, and clipboard

text

---

## API Details

- **Service:** is.gd URL Shortening API
- **Endpoint:** `https://is.gd/create.php`
- **Parameters:**
  - `format=json`
  - `url=[encoded_long_url]`
  - `callback=[function_name]` (for JSONP)
- No API key or authentication required.
- Successful response includes shortened URL.
- Error handling manages invalid URLs and API failures gracefully.

---

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests for improvements or bug fixes.

---

## License

This project is released under the [MIT License](LICENSE).

---

## Acknowledgments

- This project uses the [is.gd](https://is.gd) URL shortening service.
- JSONP technique inspired by best practices to bypass CORS on client-side APIs.
- Designed with accessibility and simplicity in mind.

---

## Contact

If you have any questions, feel free to reach out.

---

*Thank you for using this URL Shortener!*
