import { LogOut } from "lucide-react";
import { signOut } from "~/auth";

export function SignOutButton() {
    return (
        <form
            action={async () => {
                "use server";
                await signOut({ redirectTo: "/auth/signin" });
            }}
        >
            <button
                type="submit"
                aria-label="Sign out"
                title="Sign out"
                className="rounded-md p-2 text-fg-tertiary transition-colors duration-120 ease-out hover:bg-sunken hover:text-fg-primary focus-visible:outline-2 focus-visible:outline-border-focus"
            >
                <LogOut className="size-4" />
            </button>
        </form>
    );
}