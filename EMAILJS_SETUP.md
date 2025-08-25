# EmailJS Setup Guide for Event Confirmation Emails

This guide explains how to set up EmailJS to send event confirmation emails when users tap the "Attend" button.

## Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

## Step 2: Create Email Service

1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the authentication steps
5. Note down your **Service ID**

## Step 3: Create Email Template

1. Go to "Email Templates"
2. Click "Create New Template"
3. Use this sample template:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Event Confirmation</title>
</head>
<body>
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #333;">Event Confirmation</h2>
        
        <p>Hi {{to_name}},</p>
        
        <p>You're confirmed to attend <strong>{{event_name}}</strong>!</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Event Details</h3>
            <p><strong>Date:</strong> {{event_date}}</p>
            <p><strong>Time:</strong> {{event_time}}</p>
            <p><strong>Location:</strong> {{event_location}}</p>
            <p><strong>Description:</strong> {{event_description}}</p>
            
            {{#if event_link}}
            <p><strong>Event Link:</strong> <a href="{{event_link}}" style="color: #007bff;">{{event_link}}</a></p>
            {{/if}}
        </div>
        
        <p>We look forward to seeing you there!</p>
        
        <p>Best regards,<br>Your Neighborhood App Team</p>
    </div>
</body>
</html>
```

4. Save the template and note down your **Template ID**

## Step 4: Get Your Public Key

1. Go to "Account" → "API Keys"
2. Copy your **Public Key**

## Step 5: Configure Environment Variables

Create a `.env.local` file in your project root and add:

```bash
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key_here
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id_here
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id_here
```

Replace the placeholder values with your actual EmailJS credentials.

## Step 6: Test the Setup

1. Restart your development server
2. Create an event in your app
3. Tap the "Attend" button
4. Check your email for the confirmation

## Troubleshooting

- **"EmailJS configuration missing"**: Check that all environment variables are set correctly
- **"Failed to send email"**: Verify your EmailJS credentials and template syntax
- **Emails not received**: Check spam folder and verify email service configuration

## EmailJS Free Plan Limits

- 200 emails per month
- Basic templates
- Standard support

For production use, consider upgrading to a paid plan for higher limits and better features.

## Security Notes

- The public key is safe to expose in the frontend
- EmailJS handles authentication server-side
- No sensitive credentials are stored in your app
