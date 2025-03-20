# Favicon Generation Instructions

To complete the SEO setup with favicons, follow these steps:

1. Use the existing `logo.png` file in your public directory as the source image.

2. Visit a favicon generator website like [Favicon.io](https://favicon.io/favicon-converter/) or [RealFaviconGenerator](https://realfavicongenerator.net/).

3. Upload your `logo.png` file to the generator.

4. Download the generated favicon package.

5. Extract and place the following files in your public directory:
   - favicon.ico
   - favicon-16x16.png
   - favicon-32x32.png
   - apple-touch-icon.png
   - android-chrome-192x192.png
   - android-chrome-512x512.png
   - safari-pinned-tab.svg (if available)

6. The `site.webmanifest` file has already been created for you.

7. For optimal social media sharing, create and add:
   - og-image.jpg (1200×630 pixels) - for Facebook/OpenGraph
   - twitter-image.jpg (1200×600 pixels) - for Twitter

These files are referenced in your layout.tsx metadata and will enhance your site's appearance when shared on social media and in browser tabs.
