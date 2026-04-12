// import { auth } from "@/auth"; // 👈 CORRECT: Import the configured auth object
// import { NextResponse } from "next/server";

// export default auth((req) => {
//   const { nextUrl } = req;
//   const session = req.auth;

//   // Now this log will show the complete user object
//   console.log("Session in middleware:", session);

//   const isGamesRoute = nextUrl.pathname.startsWith("/games");

//   if (isGamesRoute) {
//     if (!session?.user) {
//       console.log("❌ Middleware: No session found. Redirecting to /sign-in.");
//       return NextResponse.redirect(new URL("/sign-in", nextUrl));
//     }

//     if (session.user.subscriptionStatus !== "active") {
//       console.log(`❌ Middleware: Subscription not active (${session.user.subscriptionStatus}). Redirecting to /pricing.`);
//       return NextResponse.redirect(new URL("/pricing", nextUrl));
//     }

//     console.log("✅ Middleware: Access granted.");
//   }

//   return NextResponse.next();
// });

// export const config = {
//   matcher: ["/games/:path*"],
// };