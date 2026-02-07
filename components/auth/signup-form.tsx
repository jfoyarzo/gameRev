'use client';

import { handleSignUp } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useActionState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

export function SignupForm() {
    const { executeRecaptcha } = useGoogleReCaptcha();

    const [error, formAction, isPending] = useActionState<string | null, FormData>(
        async (_prevState, formData) => {
            try {
                // In E2E mode or when reCAPTCHA isn't available, bypass it
                // The test reCAPTCHA key is invalid and would throw errors
                const isE2EMocking = process.env.NEXT_PUBLIC_API_MOCKING === 'enabled';
                const shouldBypass = isE2EMocking || !executeRecaptcha;

                if (shouldBypass) {
                    formData.append('recaptchaToken', 'bypass');
                } else {
                    const token = await executeRecaptcha('signup');
                    formData.append('recaptchaToken', token);
                }

                await handleSignUp(formData);
                return null;
            } catch (err) {
                return err instanceof Error ? err.message : 'An error occurred during signup';
            }
        },
        null
    );

    return (
        <form
            action={formAction}
            className="flex flex-col gap-4 w-full"
        >
            <div className="grid w-full items-center gap-1.5">
                <label htmlFor="username" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Username</label>
                <Input type="text" name="username" id="username" placeholder="johndoe" required minLength={3} />
            </div>
            <div className="grid w-full items-center gap-1.5">
                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                <Input type="email" name="email" id="email" placeholder="test@example.com" required />
            </div>
            <div className="grid w-full items-center gap-1.5">
                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
                <Input type="password" name="password" id="password" placeholder="password123" required minLength={6} />
            </div>
            <div className="grid w-full items-center gap-1.5">
                <label htmlFor="confirmPassword" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Confirm Password</label>
                <Input type="password" name="confirmPassword" id="confirmPassword" placeholder="password123" required minLength={6} />
            </div>
            {error && (
                <div
                    data-testid="signup-error"
                    className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-md border border-red-200 dark:border-red-900"
                >
                    {error}
                </div>
            )}
            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Creating account...' : 'Sign up'}
            </Button>
            <p className="text-sm text-center text-gray-500">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline font-medium">
                    Sign in
                </Link>
            </p>
        </form>
    );
}
