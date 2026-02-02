
import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function LoginForm() {
    return (
        <form
            action={async (formData) => {
                "use server"
                await signIn("credentials", formData)
            }}
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
            <Button type="submit" className="w-full">Sign in</Button>
        </form>
    )
}
