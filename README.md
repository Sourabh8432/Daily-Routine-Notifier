# Daily Routine Web Push Notifier ⏰

A database-less personal Web Push Notification system built using **Next.js (App Router)**, the **`web-push` NPM library**, and **Vercel Cron Jobs**. 

This application is designed specifically for personal daily routine tracking and alerts.

## 🚀 Features

- **No Database Architecture**: Uses browser-generated `PushSubscription` JSON saved in your Vercel Environment Variables.
- **Glassmorphic Obsidian Dashboard**: Sleek, modern interface displaying your routine list, real-time clock, and configuration guides.
- **Vercel Cron powered**: Mapped automatically from India Standard Time (IST) schedules to combined UTC cron expressions in `vercel.json`.
- **Deduplication & Clock Drift Robustness**: Fits in a +/- 5 minute window calculation to make sure notifications fire accurately even with Vercel cold-starts.
- **Persistent Desktop Alerts**: Notification parameters are configured with `requireInteraction: true` to persist until you actively dismiss them.

---

## 🛠️ Local Setup

1. **Clone & Install Dependencies**:
   ```bash
   npm install
   ```

2. **Generate VAPID Keys**:
   To secure connection between your server and browser push service, run:
   ```bash
   npx web-push generate-vapid-keys
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in your root folder:
   ```text
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
   VAPID_PRIVATE_KEY=your_private_key
   ```

4. **Run the App**:
   ```bash
   npm run dev
   ```

---

## 📡 Vercel Deployment & Keys Setup

1. **Deploy your project to Vercel**.
2. Go to your **Vercel Project Dashboard -> Settings -> Environment Variables**.
3. Add the following **3 variables**:
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`: Your generated VAPID **Public Key**.
   - `VAPID_PRIVATE_KEY`: Your generated VAPID **Private Key**.
   - `PUSH_SUBSCRIPTION_JSON`: 
     - Open your deployed Next.js URL in your browser.
     - Click **Subscribe to Web Push** on the dashboard.
     - Copy the green JSON block that generates on the screen.
     - Paste it as the value of this environment variable.
4. **Save and Redeploy** the Vercel project to apply changes.
