'use server';

import { BrevoEmailService } from './brevo-service';

export async function sendEventConfirmationEmail(data: {
  attendeeEmail: string;
  attendeeName: string;
  eventName: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  eventDescription?: string;
  eventLink?: string;
}) {
  try {
    await BrevoEmailService.sendEventConfirmationEmail(data);
    return { success: true };
  } catch (error) {
    console.error('Failed to send event confirmation email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
