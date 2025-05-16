import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        {/* Preload critical scripts to prevent chunk loading errors */}
        <link rel="preload" href="/_next/static/chunks/webpack.js" as="script" />
        <link rel="preload" href="/_next/static/chunks/main.js" as="script" />
        <link rel="preload" href="/_next/static/chunks/pages/_app.js" as="script" />
        <link rel="preload" href="/_next/static/chunks/vendor.js" as="script" />
        
        {/* Prevent favicon errors */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        
        {/* Script to handle chunk loading errors */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Create a global error handler for chunk loading errors
                window.__NEXT_CHUNK_LOAD_ERRORS = [];
                window.addEventListener('error', function(event) {
                  if (event && event.target && event.target.src && event.target.src.includes('/_next/')) {
                    console.error('Chunk loading error detected:', event.target.src);
                    window.__NEXT_CHUNK_LOAD_ERRORS.push(event);
                    
                    // Prevent the default error handling
                    event.preventDefault();
                    
                    // Clear caches and reload if there are too many errors
                    if (window.__NEXT_CHUNK_LOAD_ERRORS.length > 2) {
                      console.error('Multiple chunk errors detected, clearing cache and reloading');
                      
                      // Clear browser caches
                      if ('caches' in window) {
                        caches.keys().then(function(names) {
                          for (let name of names) caches.delete(name);
                        });
                      }
                      
                      // Clear localStorage
                      try {
                        Object.keys(localStorage).forEach(key => {
                          if (key.startsWith('next-')) localStorage.removeItem(key);
                        });
                      } catch (e) {}
                      
                      // Reload after a short delay
                      setTimeout(function() {
                        window.location.reload();
                      }, 1000);
                    }
                    
                    return true;
                  }
                }, true);
              })();
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
