// // app/api/cron/route.js
// import { NextResponse } from 'next/server';

// export async function GET(req) {
//   if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
//     return new Response('Unauthorized', { status: 401 });
//   }

//   // Example: MongoDB warm-up logic or console log
//   console.log("✅ Cron job ran at", new Date().toISOString());

//   return NextResponse.json({ ok: true });
// }
