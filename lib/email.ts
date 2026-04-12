// import { PasswordResetEmailTemplate } from "@/components/PasswordResetEmailTemplate";
// import resend from "@/lib/resend";
// import { generateUniqueId } from "@/lib/utils";

// export async function sendPasswordResetEmail(email: string, resetLink: string) {
//   try {
//     const emailContent = await PasswordResetEmailTemplate({ resetLink });
//     const { data, error } = await resend.emails.send({
//       from: "Minigame <noreply@omrawat.xyz>",
//       to: [email],
//       subject: "Minigame - Reset Your Password",
//       react: emailContent,
//       headers: {
//       "X-Entity-Ref-ID": generateUniqueId(),
//       },
//     });

//     if (error) {
//       console.error("Error sending password reset email:", error);
//       return false;
//     }

//     return true;
//   } catch (error) {
//     console.error("Error sending password reset email:", error);
//     return false;
//   }
// }