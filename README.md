# URL Shortener

A sleek and functional **client-side URL shortener** built with pure HTML, CSS, and JavaScript. This single-page web app allows users to paste long URLs and get shortened links instantly using the [is.gd](https://is.gd) URL shortening API—without the need for any backend or server.  

## Demo

Try the live demo [here](https://jojoaarti.github.io/URL-Shortener/)

---



## How It Works 
 
This project uses the [is.gd API](https://is.gd/developers.php) for URL shortening, which supports JSONP—a technique that allows the app to perform cross-origin requests by dynamically injecting script tags.

The shortened URL is fetched by creating a unique callback function for each request, which processes the JSONP response and updates the UI accordingly.

---








