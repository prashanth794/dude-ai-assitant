const CACHE_NAME = 'dude-ai-cache-v9';
// This list includes all the crucial files for the app shell and its dependencies.
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/services/geminiService.ts',
  '/components/Header.tsx',
  '/components/ChatWindow.tsx',
  '/components/Message.tsx',
  '/components/MessageInput.tsx',
  '/components/LoadingIndicator.tsx',
  '/components/ConversationDrawer.tsx',
  '/components/CodeCopyButton.tsx',
  '/maskable-icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap',
  'https://esm.sh/react@18.2.0',
  'https://esm.sh/react-dom@18.2.0/client',
  'https://esm.sh/@google/genai@0.14.0',
  'https://esm.sh/react-markdown@9.0.1?external=react',
  'https://esm.sh/remark-gfm@4.0.0',
  'https://esm.sh/react-syntax-highlighter@15.5.0?external=react',
  'https://esm.sh/react-syntax-highlighter@15.5.0/dist/esm/styles/prism/one-dark',
  'https://esm.sh/@mui/material@5.15.20/styles?external=react,react-dom',
  'https://esm.sh/@mui/material@5.15.20/CssBaseline?external=react,react-dom',
  'https://esm.sh/@mui/material@5.15.20/Container?external=react,react-dom',
  'https://esm.sh/@mui/material@5.15.20/Box?external=react,react-dom',
  'https://esm.sh/@mui/material@5.15.20/AppBar?external=react,react-dom',
  'https://esm.sh/@mui/material@5.15.20/Toolbar?external=react,react-dom',
  'https://esm.sh/@mui/material@5.15.20/Avatar?external=react,react-dom',
  'https://esm.sh/@mui/material@5.15.20/Typography?external=react,react-dom',
  'https://esm.sh/@mui/material@5.15.20/Paper?external=react,react-dom',
  'https://esm.sh/@mui/material@5.15.20/FormControl?external=react,react-dom',
  'https://esm.sh/@mui/material@5.15.20/OutlinedInput?external=react,react-dom',
  'https://esm.sh/@mui/material@5.15.20/IconButton?external=react,react-dom',
  'https://esm.sh/@mui/material@5.15.20/Link?external=react,react-dom',
  'https://esm.sh/@mui/material@5.15.20/Drawer?external=react,react-dom',
  'https://esm.sh/@mui/material@5.15.20/List?external=react,react-dom',
  'https://esm.sh/@mui/material@5.15.20/ListItem?external=react,react-dom',
  'https://esm.sh/@mui/material@5.15.20/ListItemButton?external=react,react-dom',
  'https://esm.sh/@mui/material@5.15.20/ListItemText?external=react,react-dom',
  'https://esm.sh/@mui/material@5.15.20/Divider?external=react,react-dom',
  'https://esm.sh/@mui/material@5.15.20/Button?external=react,react-dom',
  'https://esm.sh/@mui/material@5.15.20/Dialog?external=react,react-dom',
  'https://esm.sh/@mui/material@5.15.20/DialogActions?external=react,react-dom',
  'https://esm.sh/@mui/material@5.15.20/DialogContent?external=react,react-dom',
  'https://esm.sh/@mui/material@5.15.20/DialogContentText?external=react,react-dom',
  'https://esm.sh/@mui/material@5.15.20/DialogTitle?external=react,react-dom',
  'https://esm.sh/@mui/material@5.15.20/TextField?external=react,react-dom',
  'https://esm.sh/@mui/material@5.15.20/InputAdornment?external=react,react-dom',
  'https://esm.sh/@mui/material@5.15.20/Tooltip?external=react,react-dom',
  'https://esm.sh/@mui/icons-material@5.15.20/Send?external=react,react-dom',
  'https://esm.sh/@mui/icons-material@5.15.20/Menu?external=react,react-dom',
  'https://esm.sh/@mui/icons-material@5.15.20/Delete?external=react,react-dom',
  'https://esm.sh/@mui/icons-material@5.15.20/AddComment?external=react,react-dom',
  'https://esm.sh/@mui/icons-material@5.15.20/Edit?external=react,react-dom',
  'https://esm.sh/@mui/icons-material@5.15.20/Search?external=react,react-dom',
  'https://esm.sh/@mui/icons-material@5.15.20/AttachFile?external=react,react-dom',
  'https://esm.sh/@mui/icons-material@5.15.20/Close?external=react,react-dom',
  'https://esm.sh/@mui/icons-material@5.15.20/DeleteSweep?external=react,react-dom',
  'https://esm.sh/@mui/icons-material@5.15.20/ContentCopy?external=react,react-dom',
  'https://esm.sh/@mui/icons-material@5.15.20/Check?external=react,react-dom',
  'https://esm.sh/@emotion/react@11.11.4?external=react',
  'https://esm.sh/@emotion/styled@11.11.5?external=react,@emotion/react',
];

self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        const cachePromises = URLS_TO_CACHE.map(url => {
          return cache.add(url).catch(err => {
            console.warn(`Failed to cache ${url}:`, err);
          });
        });
        return Promise.all(cachePromises);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete old caches
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
    // We only want to handle GET requests.
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
        .then(cachedResponse => {
            if (cachedResponse) {
                // Return the cached response if found.
                return cachedResponse;
            }

            // If not in cache, fetch from the network.
            return fetch(event.request);
        })
    );
});