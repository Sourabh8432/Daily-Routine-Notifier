'use client';

import { useState, useEffect } from 'react';

// The Daily Schedule (24-hour format) for displaying on frontend
const schedule = [
  { time: "07:00", title: "💪 Workout & Breakfast", message: "Time for strength training and a high-calorie breakfast!" },
  { time: "08:30", title: "🗣️ English Speaking", message: "Practice English speaking with an AI voice bot for 15 mins." },
  { time: "09:30", title: "💻 Income Work", message: "Start working on freelance bidding, SaaS, or Blogger themes." },
  { time: "14:30", title: "🚀 Flutter Prep", message: "Focus on Dart, Bloc, and Flutter interview questions." },
  { time: "17:30", title: "🥜 Evening Snack", message: "Take a break and have a healthy, high-calorie snack." },
  { time: "18:00", title: "🏏 Play & Relax", message: "Screen time is over. Go outside, play, and unwind!" },
  { time: "20:00", title: "🍽️ Dinner + Passive English", message: "Have dinner while listening to an English documentary." }
];

// Helper to convert VAPID public key from URL Safe Base64 to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function Home() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    // Check if service workers and push notifications are supported
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window
    ) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      // Check if there is an existing subscription
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((existingSub) => {
          if (existingSub) {
            setSubscription(existingSub);
          }
        });
      });
    }
  }, []);

  const handleSubscribe = async () => {
    if (!vapidPublicKey) {
      setError("VAPID Public Key is missing! Please configure NEXT_PUBLIC_VAPID_PUBLIC_KEY in your env variables.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Request notification permission
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== 'granted') {
        throw new Error("Notification permission was denied by the browser.");
      }

      // 2. Register/activate the service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);

      // 3. Subscribe to push notifications
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      setSubscription(sub);
      console.log('Successfully subscribed to Web Push:', sub);
    } catch (err) {
      console.error('Subscription failed:', err);
      setError(err.message || 'An unexpected error occurred during subscription.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!subscription) return;
    const jsonStr = JSON.stringify(subscription, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="glass-panel app-header">
        <div class="logo-container">
          <div class="logo-glow"></div>
          <img src="/icon.png" class="logo-img" alt="Branding Bell Logo" />
        </div>
        <div className="header-info">
          <h1>Routine Push Notifier</h1>
          <p className="subtitle">Database-free personal web push alerts powered by Next.js & Vercel Cron</p>
        </div>
      </header>

      {/* Check setup alerts */}
      {!vapidPublicKey && (
        <div className="info-box" style={{ border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.04)' }}>
          <div className="info-title" style={{ color: '#ef4444' }}>⚠️ VAPID KEYS MISSING</div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            To subscribe, you need to generate VAPID keys. Run <code className="code-inline">npx web-push generate-vapid-keys</code>, then create a <code className="code-inline">.env.local</code> file in the project root containing:
          </p>
          <pre className="json-block" style={{ color: '#ef4444', marginTop: '8px', maxHeight: '100px' }}>
{`NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key`}
          </pre>
        </div>
      )}

      {/* Main glass panel */}
      <main className="glass-panel">
        {!isSupported ? (
          <div className="action-card">
            <h3>❌ Browser Unsupported</h3>
            <p>Your current browser does not support HTML5 Service Workers or Push Notifications. Please try Chrome, Firefox, or Edge on Desktop.</p>
          </div>
        ) : (
          <div className={`action-card ${subscription ? 'active' : ''}`}>
            <h3>{subscription ? '🟢 Device Subscribed' : '⚡ Push Registration'}</h3>
            <p>
              {subscription 
                ? "This device is registered! Copy the Push Subscription JSON below and add it to your Vercel Environment Variables."
                : "Grant notifications permissions to generate your browser's push credentials. You will manually connect this to Vercel."}
            </p>

            <button 
              onClick={handleSubscribe} 
              disabled={loading}
              className={`btn-primary ${subscription ? 'subscribed' : ''}`}
            >
              {loading ? 'Registering...' : subscription ? '✓ Subscription Active' : 'Subscribe to Web Push'}
            </button>

            {error && (
              <p style={{ color: '#f87171', fontSize: '13px', marginTop: '10px' }}>{error}</p>
            )}

            {subscription && (
              <div className="result-panel">
                <div className="result-header">
                  <h4>Push Subscription JSON</h4>
                  <button onClick={handleCopy} className="btn-copy">
                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                  </button>
                </div>
                <pre className="json-block">
                  {JSON.stringify(subscription, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Routine Schedule */}
      <section className="glass-panel schedule-section">
        <h2>Your Daily Routine</h2>
        <div className="schedule-grid">
          {schedule.map((task, idx) => (
            <div key={idx} className="schedule-card">
              <div className="time-badge">{task.time}</div>
              <div className="task-info">
                <span className="task-title">{task.title}</span>
                <span className="task-message">{task.message}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Manual & Setup Guide */}
      <section className="info-box">
        <div className="info-title">🚀 Vercel Deployment Instructions</div>
        <ul>
          <li><strong>Step 1</strong>: Deploy this project to Vercel.</li>
          <li>
            <strong>Step 2</strong>: Configure the following 3 Environment Variables in your Vercel project settings:
            <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
              <li><code className="code-inline">NEXT_PUBLIC_VAPID_PUBLIC_KEY</code>: Your generated public VAPID key.</li>
              <li><code className="code-inline">VAPID_PRIVATE_KEY</code>: Your generated private VAPID key.</li>
              <li><code className="code-inline">PUSH_SUBSCRIPTION_JSON</code>: Copy the exact green JSON block from above and paste it here.</li>
            </ul>
          </li>
          <li><strong>Step 3</strong>: Vercel Cron will trigger your route automatically according to <code className="code-inline">vercel.json</code>.</li>
        </ul>
      </section>
    </div>
  );
}
