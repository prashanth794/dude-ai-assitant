const CACHE_NAME = 'dude-ai-assistant-cache-v3';
// Add all files and assets that are essential for the app's shell to function.
// This now includes remote dependencies from the importmap.
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/index.tsx',
  '/icon-192.png',
  '/icon-512.png',
  '/maskable-icon.svg',
  'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap',
  "https://esm.sh/react@18.2.0",
  "https://esm.sh/react-dom@18.2.0/client",
  "https://esm.sh/@google/genai@0.14.0",
  "https://esm.sh/react-markdown@9.0.1?external=react",
  "https://esm.sh/remark-gfm@4.0.0",
  "https://esm.sh/react-syntax-highlighter@15.5.0?external=react",
  "https://esm.sh/react-syntax-highlighter@15.5.0/dist/esm/styles/prism/one-dark",
  "https://esm.sh/@mui/material@5.15.20/styles?external=react,react-dom",
  "https://esm.sh/@mui/material@5.15.20/CssBaseline?external=react,react-dom",
  "https://esm.sh/@mui/material@5.15.20/Container?external=react,react-dom",
  "https://esm.sh/@mui/material@5.15.20/Box?external=react,react-dom",
  "https://esm.sh/@mui/material@5.15.20/AppBar?external=react,react-dom",
  "https://esm.sh/@mui/material@5.15.20/Toolbar?external=react,react-dom",
  "https://esm.sh/@mui/material@5.15.20/Avatar?external=react,react-dom",
  "https://esm.sh/@mui/material@5.15.20/Typography?external=react,react-dom",
  "https://esm.sh/@mui/material@5.15.20/Paper?external=react,react-dom",
  "https://esm.sh/@mui/material@5.15.20/FormControl?external=react,react-dom",
  "https://esm.sh/@mui/material@5.15.20/OutlinedInput?external=react,react-dom",
  "https://esm.sh/@mui/material@5.15.20/IconButton?external=react,react-dom",
  "https://esm.sh/@mui/material@5.15.20/Link?external=react,react-dom",
  "https://esm.sh/@mui/material@5.15.20/Menu?external=react,react-dom",
  "https://esm.sh/@mui/material@5.15.20/MenuItem?external=react,react-dom",
  "https://esm.sh/@mui/material@5.15.20/Drawer?external=react,react-dom",
  "https://esm.sh/@mui/material@5.15.20/List?external=react,react-dom",
  "https://esm.sh/@mui/material@5.15.20/ListItem?external=react,react-dom",
  "https://esm.sh/@mui/material@5.15.20/ListItemButton?external=react,react-dom",
  "https://esm.sh/@mui/material@5.15.20/ListItemText?external=react,react-dom",
  "https://esm.sh/@mui/material@5.15.20/Divider?external=react,react-dom",
  "https://esm.sh/@mui/material@5.15.20/Button?external=react,react-dom",
  "https://esm.sh/@mui/material@5.15.20/Dialog?external=react,react-dom",
  "https://esm.sh/@mui/material@5.15.20/DialogActions?external=react,react-dom",
  "https://esm.sh/@mui/material@5.15.20/DialogContent?external=react,react-dom",
  "https://esm.sh/@mui/material@5.15.20/DialogContentText?external=react,react-dom",
  "https://esm.sh/@mui/material@5.15.20/DialogTitle?external=react,react-dom",
  "https://esm.sh/@mui/material@5.15.20/TextField?external=react,react-dom",
  "https://esm.sh/@mui/material@5.15.20/InputAdornment?external=react,react-dom",
  "https://esm.sh/@mui/material@5.15.20/Tooltip?external=react,react-dom",
  "https://esm.sh/@mui/material@5.15.20/CircularProgress?external=react,react-dom",
  "https://esm.sh/@mui/icons-material@5.15.20/Send?external=react,react-dom",
  "https://esm.sh/@mui/icons-material@5.15.20/Menu?external=react,react-dom",
  "https://esm.sh/@mui/icons-material@5.15.20/Delete?external=react,react-dom",
  "https://esm.sh/@mui/icons-material@5.15.20/AddComment?external=react,react-dom",
  "https://esm.sh/@mui/icons-material@5.15.20/Edit?external=react,react-dom",
  "https://esm.sh/@mui/icons-material@5.15.20/Search?external=react,react-dom",
  "https://esm.sh/@mui/icons-material@5.15.20/AttachFile?external=react,react-dom",
  "https://esm.sh/@mui/icons-material@5.15.20/Close?external=react,react-dom",
  "https://esm.sh/@mui/icons-material@5.15.20/DeleteSweep?external=react,react-dom",
  "https://esm.sh/@mui/icons-material@5.15.20/ContentCopy?external=react,react-dom",
  "https://esm.sh/@mui/icons-material@5.15.20/Check?external=react,react-dom",
  "https://esm.sh/@mui/icons-material@5.15.20/AutoAwesome?external=react,react-dom",
  "https://esm.sh/@emotion/react@11.11.4?external=react",
  "https://esm.sh/@emotion/styled@11.11.5?external=react,@emotion/react",
];

// Install event: Cache the application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching app shell');
        // Use a Set to avoid duplicates and handle potential fetch errors gracefully
        const uniqueUrls = [...new Set(URLS_TO_CACHE)];
        const promises = uniqueUrls.map(url => {
            return cache.add(url).catch(err => {
                console.warn(`Failed to cache ${url}:`, err);
            });
        });
        return Promise.all(promises);
      })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: Serve from cache, fall back to network (stale-while-revalidate strategy)
self.addEventListener('fetch', (event) => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }
  
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((response) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // If we got a valid response, update the cache.
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(err => {
            // Fetch failed, maybe offline? We don't have to do anything here
            // since we've already returned the cached response (if any).
        });

        // Return the cached response immediately, while the network request runs in the background.
        return response || fetchPromise;
      });
    })
  );
});