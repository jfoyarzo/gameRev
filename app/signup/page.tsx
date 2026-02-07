import { SignupForm } from "@/components/auth/signup-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ReCaptchaProvider } from "@/components/providers/recaptcha-provider";
import { appConfig } from "@/lib/dal/config";

export default async function SignupPage() {
    const session = await auth();

    if (session?.user) {
        redirect('/');
    }

    return (
        <ReCaptchaProvider siteKey={appConfig.recaptcha.siteKey}>
            <div className="flex h-screen w-full items-center justify-center">
                <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-lg border p-10 shadow-lg">
                    <h1 className="text-2xl font-bold">Sign Up</h1>
                    <p className="text-sm text-gray-500">
                        Create an account to start reviewing games
                    </p>
                    <SignupForm />
                </div>
            </div>
        </ReCaptchaProvider>
    );
}
