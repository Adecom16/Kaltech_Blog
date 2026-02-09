// Simple email logger (no external dependencies)
// In production, integrate with your preferred email service

export default async function mail(to: string, subject: string, body: string) {
  try {
    // Log email details (replace with actual email service in production)
    console.log("=== EMAIL SENT ===");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Body:", body);
    console.log("==================");

    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    // Example:
    // await sendgrid.send({ to, subject, html: body });

    return { success: true, messageId: Date.now().toString() };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
