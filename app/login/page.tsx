import { LoginForm } from "@/components/auth/login-form"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function LoginPage() {
    const session = await auth()

    if (session?.user) {
        redirect('/')
    }
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-lg border p-10 shadow-lg">
                <h1 className="text-2xl font-bold">Login</h1>
                <p className="text-sm text-gray-500">
                    Sign in to access your account
                </p>
                <LoginForm />
            </div>
        </div>
    )
}
