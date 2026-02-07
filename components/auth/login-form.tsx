'use client';

import { handleSignIn } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionState } from "react";

export function LoginForm() {
    const [error, formAction, isPending] = useActionState<string | null, FormData>(
        async (_prevState, formData) => {
            try {
                await handleSignIn(formData);
                return null;
            } catch (err) {
                return err instanceof Error ? err.message : 'An error occurred during sign in';
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
                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                <Input type="email" name="email" id="email" placeholder="test@example.com" required />
            </div>
            <div className="grid w-full items-center gap-1.5">
                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
                <Input type="password" name="password" id="password" placeholder="password123" required />
            </div>
            {error && (
                <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-md border border-red-200 dark:border-red-900">
                    {error}
                </div>
            )}
            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Signing in...' : 'Sign in'}
            </Button>
        </form>
    );
}
