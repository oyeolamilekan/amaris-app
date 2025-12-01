import type { Route } from "./+types/terms";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Terms of Service — Amaris" },
    {
      name: "description",
      content: "Terms of Service for Amaris AI image generation platform.",
    },
  ];
}

export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              Amaris
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Home
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-8 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using Amaris ("the Service"), you accept and
              agree to be bound by the terms and provision of this agreement. If
              you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              2. Description of Service
            </h2>
            <p>
              Amaris provides AI-powered image generation services. We use
              artificial intelligence to create professional-looking images
              based on user-uploaded photos and text prompts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Content</h2>
            <p className="mb-4">
              You retain all rights to the photos you upload. By uploading
              content, you grant us a license to process, store, and display
              your images for the purpose of providing the Service.
            </p>
            <p className="mb-2">
              You are responsible for ensuring you have the right to upload any
              images you submit to the Service. You must not upload images that:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights of others</li>
              <li>Contain explicit, offensive, or inappropriate content</li>
              <li>Depict minors without proper consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              4. Generated Content
            </h2>
            <p>
              AI-generated images created through our Service are provided to
              you for your personal or commercial use. While we strive for
              quality, we cannot guarantee the accuracy or suitability of
              generated images for any specific purpose.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              5. Credits and Payment
            </h2>
            <p className="mb-4">
              Our Service operates on a credit-based system. Credits are
              purchased through our payment provider and are non-refundable
              except as required by law. Credits do not expire.
            </p>
            <p>
              All payments are processed securely through our payment providers.
              We do not store your payment information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Prohibited Uses</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use the Service for any illegal purpose</li>
              <li>Attempt to reverse engineer or extract the AI models</li>
              <li>Upload images of other people without their consent</li>
              <li>Use the Service to create misleading or deceptive content</li>
              <li>
                Resell or redistribute generated images as your own service
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              7. Service Availability
            </h2>
            <p>
              We strive to maintain high availability but do not guarantee
              uninterrupted service. We reserve the right to modify, suspend, or
              discontinue the Service at any time with or without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              8. Limitation of Liability
            </h2>
            <p>
              Amaris shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages resulting from your use or
              inability to use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will
              notify users of any material changes by updating the "Last
              updated" date at the top of this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
            <p>
              If you have any questions about these Terms, please contact us at{" "}
              <a
                href="mailto:support@useamaris.xyz"
                className="text-primary hover:underline"
              >
                support@useamaris.xyz
              </a>
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t py-12 bg-muted/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-lg">
            Amaris
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Amaris AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
