import webpush from 'web-push';
import { NextResponse } from 'next/server';

// The Daily Schedule (24-hour format)
const schedule = [
  { time: "07:00", title: "💪 Workout & Breakfast", message: "Time for strength training and a high-calorie breakfast!" },
  { time: "08:30", title: "🗣️ English Speaking", message: "Practice English speaking with an AI voice bot for 15 mins." },
  { time: "09:30", title: "💻 Income Work", message: "Start working on freelance bidding, SaaS, or Blogger themes." },
  { time: "14:30", title: "🚀 Flutter Prep", message: "Focus on Dart, Bloc, and Flutter interview questions." },
  { time: "17:30", title: "🥜 Evening Snack", message: "Take a break and have a healthy, high-calorie snack." },
  { time: "18:00", title: "🏏 Play & Relax", message: "Screen time is over. Go outside, play, and unwind!" },
  { time: "20:00", title: "🍽️ Dinner + Passive English", message: "Have dinner while listening to an English documentary." }
];

export async function GET(request) {
  // 1. Secure Cron Route in Production
  if (process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }

  try {
    // 2. Fetch current time formatted to Asia/Kolkata (IST)
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const currentIST = formatter.format(now);
    console.log(`[Cron Trigger] Checked at IST: ${currentIST}`);

    // Helper to calculate minutes from midnight
    const getMinutes = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const currentMinutes = getMinutes(currentIST);

    // 3. Match closest task within a +/- 5 minute window
    // This solves any minor cron startup latency delays
    const task = schedule.find(item => {
      const taskMinutes = getMinutes(item.time);
      const diff = Math.abs(currentMinutes - taskMinutes);
      return diff <= 5;
    });

    if (!task) {
      console.log(`[Cron Trigger] No active schedule matching IST ${currentIST}. Done.`);
      return NextResponse.json({ success: true, message: "No active routine matches current time." });
    }

    console.log(`[Cron Trigger] Matched Routine: ${task.title}. Sending push notification...`);

    // 4. Retrieve push subscription from env variables
    const subscriptionJson = process.env.PUSH_SUBSCRIPTION_JSON;
    if (!subscriptionJson) {
      return NextResponse.json(
        { error: "PUSH_SUBSCRIPTION_JSON is not configured in Vercel environment variables." }, 
        { status: 400 }
      );
    }

    const subscription = JSON.parse(subscriptionJson);

    // 5. Authenticate with VAPID credentials
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
      return NextResponse.json(
        { error: "VAPID key credentials are not configured in environment variables." }, 
        { status: 500 }
      );
    }

    webpush.setVapidDetails(
      'mailto:your-email@example.com', // Contact email for push service operators
      publicKey,
      privateKey
    );

    // 6. Dispatch Web Push
    const payload = JSON.stringify({
      title: task.title,
      message: task.message,
      url: '/'
    });

    await webpush.sendNotification(subscription, payload);
    console.log(`[Cron Trigger] Push notification successfully sent to client.`);

    return NextResponse.json({ success: true, message: `Notification dispatched for ${task.title}` });
  } catch (error) {
    console.error("[Cron Trigger] Error sending push:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
