import type { Route } from "./+types/privacy";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Privacy Policy — Amaris" },
    {
      name: "description",
      content: "Privacy Policy for Amaris AI image generation platform.",
    },
  ];
}

export default function Privacy() {
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
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-8 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              At Amaris ("we," "our," or "us"), we respect your privacy and are
              committed to protecting your personal data. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you use our AI image generation service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              2. Information We Collect
            </h2>
            <p className="mb-4">
              We collect information that you provide directly to us when you:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Create an account or sign in via third-party providers</li>
              <li>Upload images or provide text prompts for generation</li>
              <li>Purchase credits or subscriptions</li>
              <li>Contact our support team</li>
            </ul>
            <p>
              This information may include your name, email address, payment
              information (processed by our secure payment providers), and the
              content you upload or generate.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              3. How We Use Your Information
            </h2>
            <p className="mb-2">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your transactions and manage your account</li>
              <li>Generate images based on your inputs</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              4. Data Storage and Security
            </h2>
            <p>
              We implement appropriate technical and organizational measures to
              protect your personal data against unauthorized access,
              alteration, disclosure, or destruction. Your uploaded images and
              generated content are stored securely. We do not use your private
              data to train our public AI models without your explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              5. Sharing of Information
            </h2>
            <p>
              We do not sell your personal data. We may share your information
              with:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                Service providers who assist in our operations (e.g., payment
                processing, cloud hosting)
              </li>
              <li>Law enforcement or other authorities if required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding
              your personal data, including the right to access, correct, or
              delete your data. You can manage most of your data directly within
              your account settings or by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Cookies</h2>
            <p>
              We use cookies and similar tracking technologies to track the
              activity on our service and hold certain information. You can
              instruct your browser to refuse all cookies or to indicate when a
              cookie is being sent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              8. Changes to This Policy
            </h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page
              and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at{" "}
              <a
                href="mailto:privacy@useamaris.xyz"
                className="text-primary hover:underline"
              >
                privacy@useamaris.xyz
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
