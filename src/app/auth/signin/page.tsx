import { signIn } from "~/auth";
import { env } from "~/env";

const providers = [
  env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET
    ? { id: "google", label: "Google" }
    : null,
  env.AUTH_GITHUB_ID && env.AUTH_GITHUB_SECRET
    ? { id: "github", label: "GitHub" }
    : null,
].filter(
  (provider): provider is { id: string; label: string } => provider !== null,
);

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef0f2]">
      <div className="rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-2xl font-bold text-[#153243]">Sign in</h1>
        {providers.length > 0 ? (
          <div className="flex flex-col gap-3">
            {providers.map((provider) => (
              <form
                key={provider.id}
                action={async () => {
                  "use server";
                  await signIn(provider.id, { callbackUrl: "/" });
                }}
              >
                <button
                  className="w-full rounded bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
                  type="submit"
                >
                  Continue with {provider.label}
                </button>
              </form>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">
            Configure an OAuth provider in your environment to sign in.
          </p>
        )}
      </div>
    </main>
  );
}
