import { Button } from '@/components/ui/button';
import { handleSignOut } from '@/app/actions/auth';

export function SignOut() {
    return (
        <form action={handleSignOut}>
            <Button variant="ghost" type="submit">
                Sign Out
            </Button>
        </form>
    );
}
