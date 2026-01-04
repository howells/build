# Forms

Two patterns depending on complexity: native forms with Zod for simple cases, react-hook-form for complex forms.

## Installation

```bash
# For complex forms
pnpm add react-hook-form @hookform/resolvers

# Zod is already in your stack
```

## Pattern 1: Native Forms + Zod (Simple)

For straightforward forms, use native HTML forms with Zod validation:

```tsx
"use client";

import { useState } from "react";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    const result = contactSchema.safeParse(data);

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    setErrors({});
    setIsPending(true);

    try {
      await submitContact(result.data);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" />
        {errors.name && <p className="text-red-500 text-sm">{errors.name[0]}</p>}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" />
        {errors.email && <p className="text-red-500 text-sm">{errors.email[0]}</p>}
      </div>

      <div>
        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" rows={4} />
        {errors.message && <p className="text-red-500 text-sm">{errors.message[0]}</p>}
      </div>

      <button type="submit" disabled={isPending}>
        {isPending ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
```

## Pattern 2: Server Actions + useTransition

For forms that call server actions directly:

```tsx
"use client";

import { useTransition } from "react";
import { updateProfile } from "./actions";

export function ProfileForm({ initialName }: { initialName: string }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateProfile(formData);
    });
  }

  return (
    <form action={handleSubmit}>
      <input name="name" defaultValue={initialName} />
      <button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
```

```ts
// actions.ts
"use server";

import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1),
});

export async function updateProfile(formData: FormData) {
  const data = Object.fromEntries(formData);
  const validated = profileSchema.parse(data);

  // Update database
  await db.update(users).set(validated).where(eq(users.id, userId));
}
```

## Pattern 3: react-hook-form (Complex Forms)

For forms with many fields, dynamic validation, or complex state:

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const signupSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[0-9]/, "Must contain number"),
  acceptTerms: z.boolean().refine((val) => val, "Must accept terms"),
});

type SignupForm = z.infer<typeof signupSchema>;

export function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(data: SignupForm) {
    await createAccount(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>First Name</label>
          <input {...register("firstName")} />
          {errors.firstName && (
            <p className="text-red-500 text-sm">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label>Last Name</label>
          <input {...register("lastName")} />
          {errors.lastName && (
            <p className="text-red-500 text-sm">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label>Email</label>
        <input {...register("email")} type="email" />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label>Password</label>
        <input {...register("password")} type="password" />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input {...register("acceptTerms")} type="checkbox" id="terms" />
        <label htmlFor="terms">I accept the terms</label>
      </div>
      {errors.acceptTerms && (
        <p className="text-red-500 text-sm">{errors.acceptTerms.message}</p>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Sign up"}
      </button>
    </form>
  );
}
```

## Validation Schemas

Keep schemas in a separate file for reuse:

```ts
// features/auth/lib/schemas.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Required").email("Invalid email"),
  password: z.string().min(1, "Required"),
});

export const signupSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type LoginForm = z.infer<typeof loginSchema>;
export type SignupForm = z.infer<typeof signupSchema>;
```

## Common Patterns

### Dependent Validation

```ts
const orderSchema = z
  .object({
    deliveryMethod: z.enum(["pickup", "delivery"]),
    address: z.string().optional(),
  })
  .refine(
    (data) => data.deliveryMethod !== "delivery" || data.address,
    {
      message: "Address required for delivery",
      path: ["address"],
    }
  );
```

### URL Validation (Optional)

```ts
const profileSchema = z.object({
  website: z
    .string()
    .url("Invalid URL")
    .optional()
    .or(z.literal("")), // Allow empty string
});
```

### Phone Number (Coerced)

```ts
const contactSchema = z.object({
  phone: z.string().regex(/^\+?[0-9]{10,14}$/, "Invalid phone number"),
});
```

### Trimmed Strings

```ts
const formSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  email: z.string().trim().email(),
});
```

## Error Display Component

```tsx
interface FieldErrorProps {
  error?: string;
}

function FieldError({ error }: FieldErrorProps) {
  if (!error) return null;
  return <p className="mt-1 text-sm text-red-500">{error}</p>;
}

// Usage
<FieldError error={errors.email?.message} />
```

## Loading Button

```tsx
interface SubmitButtonProps {
  isPending: boolean;
  children: React.ReactNode;
  pendingText?: string;
}

function SubmitButton({
  isPending,
  children,
  pendingText = "Saving...",
}: SubmitButtonProps) {
  return (
    <button type="submit" disabled={isPending}>
      {isPending ? (
        <>
          <Spinner className="mr-2 h-4 w-4" />
          {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
```

## Decision Guide

| Situation | Pattern |
|-----------|---------|
| Simple contact form | Native + Zod |
| Server action mutation | useTransition |
| Multi-step wizard | react-hook-form |
| Many conditional fields | react-hook-form |
| Real-time validation | react-hook-form |
| File uploads | Native (FormData) |
| Search/filter inputs | Controlled + debounce |

## What NOT to Do

```tsx
// Don't: Controlled inputs for everything
const [name, setName] = useState("");
const [email, setEmail] = useState("");
// 10 more useState calls...

// Do: Uncontrolled with FormData or react-hook-form
<input name="name" defaultValue={initialName} />
```

```tsx
// Don't: Validate on every keystroke
onChange={(e) => {
  setValue(e.target.value);
  validateField(e.target.value); // Expensive
}}

// Do: Validate on blur or submit
onBlur={(e) => validateField(e.target.value)}
```
