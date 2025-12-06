import { authClient } from "@/lib/auth-client";
import { Outlet, useNavigate, useLocation, Link } from "react-router";
import { useEffect } from "react";
import {
  Loader2,
  LayoutDashboard,
  Package,
  Users,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function AdminLayout() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      navigate("/");
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

  const navItems = [
    {
      title: "Overview",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Packages",
      href: "/admin/packages",
      icon: Package,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-muted/10 md:flex">
        <div className="flex h-16 items-center border-b px-6">
          <Link to="/admin" className="flex items-center gap-2 font-semibold">
            <span className="text-xl font-bold">Amaris Admin</span>
          </Link>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <nav className="grid gap-1">
            {navItems.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
                  location.pathname === item.href
                    ? "bg-muted text-primary"
                    : "text-muted-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t p-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => authClient.signOut()}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 w-64">
              <div className="flex h-16 items-center border-b px-6">
                <Link
                  to="/admin"
                  className="flex items-center gap-2 font-semibold"
                >
                  <span className="text-xl font-bold">Amaris Admin</span>
                </Link>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <nav className="grid gap-1">
                  {navItems.map((item, index) => (
                    <Link
                      key={index}
                      to={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
                        location.pathname === item.href
                          ? "bg-muted text-primary"
                          : "text-muted-foreground",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="border-t p-4">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => authClient.signOut()}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold">
            {navItems.find((item) => item.href === location.pathname)?.title ||
              "Dashboard"}
          </h1>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
        </header>
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
