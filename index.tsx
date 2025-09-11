
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeApi } from './services/geminiService';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const isApiInitialized = initializeApi();

if (isApiInitialized) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  // If the API key is missing, render a helpful guide instead of a blank page.
  rootElement.innerHTML = `
    <div style="font-family: 'Roboto', sans-serif; padding: 20px; text-align: center; color: #1c1c1e; background-color: #f4f6f8; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; box-sizing: border-box;">
      <h1 style="color: #00579b; font-size: 2.2em; margin-bottom: 16px;">Configuration Needed</h1>
      <p style="font-size: 1.1em; max-width: 600px; line-height: 1.6;">
        Welcome to your Dude AI Assistant! To get started, you need to connect the app to the Gemini API.
      </p>
      <div style="background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 25px; margin-top: 20px; max-width: 600px; text-align: left; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <h2 style="margin-top: 0; color: #00306c;">Action Required</h2>
        <p>This app requires a Google Gemini API Key to function. It seems it hasn't been configured for this deployed version.</p>
        <p><strong>Please follow these steps:</strong></p>
        <ol style="padding-left: 20px; line-height: 1.7;">
          <li>Go to your project's dashboard on your hosting provider (e.g., Netlify, Vercel).</li>
          <li>Find the settings for <strong>"Environment Variables"</strong> (it might be under "Build & deploy" or "Site settings").</li>
          <li>Create a <strong>new variable</strong>.</li>
          <li>Set the <strong>Key</strong> to: <code>API_KEY</code></li>
          <li>Paste your Google Gemini API key as the <strong>Value</strong>.</li>
          <li><strong>Redeploy</strong> the application to apply the new variable. The app should then load correctly.</li>
        </ol>
        <p style="margin-top: 20px; font-size: 0.9em; color: #5a5a5e;">This is a one-time setup for your hosted version of the app.</p>
      </div>
    </div>
  `;
}
