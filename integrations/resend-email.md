# Resend + React Email

Transactional email with React components. Resend for delivery, React Email for templates.

## Installation

```bash
pnpm add resend @react-email/components
```

## Environment Variables

```bash
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=hello@yourdomain.com
```

## Basic Setup

### Client

```ts
// lib/email.ts
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);
```

### Send an Email

```ts
import { resend } from "@/lib/email";
import WelcomeEmail from "@/emails/welcome";

await resend.emails.send({
  from: "App <hello@yourdomain.com>",
  to: user.email,
  subject: "Welcome to the app",
  react: WelcomeEmail({ name: user.name }),
});
```

## React Email Templates

### Basic Template

```tsx
// emails/welcome.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface WelcomeEmailProps {
  name: string;
}

export default function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to the app, {name}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Welcome, {name}!</Heading>
          <Section>
            <Text style={text}>
              Thanks for signing up. We're excited to have you.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const body = {
  backgroundColor: "#f6f9fc",
  fontFamily: "-apple-system, sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px",
  maxWidth: "600px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#1a1a1a",
};

const text = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#4a4a4a",
};
```

### With Layout

```tsx
// emails/components/layout.tsx
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          {children}
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this because you signed up at ourapp.com
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#f6f9fc",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "40px auto",
  padding: "40px",
  maxWidth: "600px",
  borderRadius: "8px",
};

const footer = {
  marginTop: "32px",
  paddingTop: "16px",
  borderTop: "1px solid #e6e6e6",
};

const footerText = {
  fontSize: "12px",
  color: "#8898aa",
  textAlign: "center" as const,
};
```

```tsx
// emails/password-reset.tsx
import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout } from "./components/layout";

interface PasswordResetProps {
  resetUrl: string;
}

export default function PasswordResetEmail({ resetUrl }: PasswordResetProps) {
  return (
    <EmailLayout preview="Reset your password">
      <Heading style={heading}>Reset Your Password</Heading>
      <Section>
        <Text style={text}>
          Click the button below to reset your password. This link expires in 1 hour.
        </Text>
        <Button href={resetUrl} style={button}>
          Reset Password
        </Button>
      </Section>
    </EmailLayout>
  );
}

const heading = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginBottom: "24px",
};

const text = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#4a4a4a",
};

const button = {
  backgroundColor: "#000",
  color: "#fff",
  padding: "12px 24px",
  borderRadius: "6px",
  fontWeight: "600",
  textDecoration: "none",
  display: "inline-block",
  marginTop: "16px",
};
```

## Batch Sending

```ts
import { resend } from "@/lib/email";

const emails = users.map((user) => ({
  from: "App <hello@yourdomain.com>",
  to: user.email,
  subject: "Weekly digest",
  react: DigestEmail({ user }),
}));

// Send up to 100 emails per batch
await resend.batch.send(emails);
```

## From Server Actions

```ts
// actions/invite.ts
"use server";

import { resend } from "@/lib/email";
import InviteEmail from "@/emails/invite";

export async function sendInvite(email: string, inviterName: string) {
  const inviteUrl = await createInviteUrl(email);

  await resend.emails.send({
    from: "App <invites@yourdomain.com>",
    to: email,
    subject: `${inviterName} invited you to join`,
    react: InviteEmail({ inviterName, inviteUrl }),
  });
}
```

## With Attachments

```ts
await resend.emails.send({
  from: "App <reports@yourdomain.com>",
  to: user.email,
  subject: "Your export is ready",
  react: ExportReadyEmail({ filename }),
  attachments: [
    {
      filename: "export.csv",
      content: csvBuffer,
    },
  ],
});
```

## File Structure

```
emails/
├── components/
│   ├── layout.tsx
│   ├── button.tsx
│   └── footer.tsx
├── welcome.tsx
├── password-reset.tsx
├── invite.tsx
└── digest.tsx

lib/
└── email.ts           # Resend client
```

### Monorepo Structure

```
packages/
└── email/
    ├── src/
    │   ├── client.ts       # Resend client
    │   ├── render.ts       # Render utilities
    │   ├── components/
    │   │   └── layout.tsx
    │   └── templates/
    │       ├── welcome.tsx
    │       └── invite.tsx
    └── package.json
```

```json
// packages/email/package.json
{
  "name": "@project/email",
  "exports": {
    ".": "./src/client.ts",
    "./templates/*": "./src/templates/*.tsx"
  }
}
```

## Preview During Development

```bash
# Add dev script
pnpm add -D @react-email/dev

# package.json
{
  "scripts": {
    "email:dev": "email dev --dir emails"
  }
}
```

This starts a preview server at `localhost:3001` where you can view and test templates.

## Common Patterns

### Reply-To

```ts
await resend.emails.send({
  from: "App <noreply@yourdomain.com>",
  replyTo: "support@yourdomain.com",
  // ...
});
```

### Personalized From

```ts
await resend.emails.send({
  from: `${senderName} via App <notifications@yourdomain.com>`,
  // ...
});
```

### Conditional Content

```tsx
export default function NotificationEmail({ events }: { events: Event[] }) {
  return (
    <EmailLayout preview={`${events.length} new notifications`}>
      <Heading>Your notifications</Heading>
      {events.map((event) => (
        <Section key={event.id} style={eventRow}>
          <Text>{event.title}</Text>
          {event.imageUrl && (
            <Img src={event.imageUrl} width="100" alt="" />
          )}
        </Section>
      ))}
    </EmailLayout>
  );
}
```

## Testing

Mock Resend in tests:

```ts
// vitest.setup.ts
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ id: "test-id" }),
    },
  })),
}));
```

## What NOT to Do

```tsx
// Don't: Complex CSS (email clients don't support it)
<div className="flex gap-4 grid-cols-2">

// Do: Inline styles with safe properties
<table><tr><td style={{ padding: "16px" }}>
```

```tsx
// Don't: External fonts (unreliable)
fontFamily: "'Custom Font', sans-serif"

// Do: System font stack
fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
```

```tsx
// Don't: Dark mode CSS (limited support)
@media (prefers-color-scheme: dark)

// Do: Light theme only, or use Resend's dark mode support
```
