import type { Route } from "./+types/_index";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import { authClient } from "@/lib/auth-client";

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Amaris — AI Image Studio" },
    {
      name: "description",
      content: "Create professional AI images with a single prompt.",
    },
  ];
}

export default function Home() {
  const { data: session } = authClient.useSession();
  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}/dashboard`,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            Amaris
          </div>
          <nav className="flex items-center gap-4">
            {session ? (
              <Link to="/dashboard">
                <Button size="sm">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={handleGoogleSignIn}>
                  Sign In
                </Button>
                <Button size="sm" onClick={handleGoogleSignIn}>
                  Get Started
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 px-4 text-center space-y-8 max-w-4xl mx-auto">
          <Badge variant="secondary" className="rounded-full px-4 py-1 text-sm">
            New: Style Reference V2 is live
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
            Turn Your Ideas <br className="hidden md:block" />
            <span className="text-muted-foreground">Into Reality.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Create stunning visuals for your projects in seconds. Upload a style
            reference, describe your vision, and let Amaris handle the rest.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 pt-4">
            {session ? (
              <Link to="/dashboard">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 text-base gap-2"
                >
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 text-base gap-2"
                  onClick={handleGoogleSignIn}
                >
                  <GoogleIcon className="h-5 w-5" />
                  Continue with Google
                </Button>
              </>
            )}
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold">Lightning Fast</h3>
                <p className="text-muted-foreground">
                  Generate variations in seconds. Iterate quickly to find the
                  perfect image.
                </p>
              </div>
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold">Private & Secure</h3>
                <p className="text-muted-foreground">
                  Your images and references are private. We don't train on your
                  personal data.
                </p>
              </div>
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold">High Quality</h3>
                <p className="text-muted-foreground">
                  State-of-the-art models ensure crisp, professional results
                  every time.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-muted/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center text-primary-foreground text-xs">
              A
            </div>
            Amaris
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/terms" className="hover:underline">
              Terms of Service
            </Link>
            <Link to="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <span>
              © {new Date().getFullYear()} Amaris AI. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
