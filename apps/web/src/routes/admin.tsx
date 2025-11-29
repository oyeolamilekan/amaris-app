import { authClient } from "@/lib/auth-client";
import { Outlet, useNavigate } from "react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AdminLayout() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      navigate("/login");
      return;
    }

    // Cast user to any because the type inference might not pick up the new 'role' field immediately
    // without running codegen or updating the client types manually, but it exists in the DB/API response.
    const user = session.user as any;

    console.log(user);

    if (user.role !== "admin") {
      navigate("/dashboard");
    }
  }, [session, isPending, navigate]);

  if (isPending) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Double check render condition to avoid flashing content before redirect
  const user = session?.user as any;
  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
        </div>
      </header>
      <main className="container py-6">
        <Outlet />
      </main>
    </div>
  );
}
