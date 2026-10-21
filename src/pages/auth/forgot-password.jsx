import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordResetService } from "@/services";
import { GraduationCap } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

function ForgotPasswordPage() {
  const [userEmail, setUserEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      const response = await requestPasswordResetService(userEmail.trim());
      setMessage(response.message);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to send a reset link right now. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center border-b px-4 lg:px-6">
        <Link to="/" className="flex items-center">
          <GraduationCap className="mr-4 h-8 w-8" />
          <span className="text-xl font-extrabold">LMS LEARN</span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center bg-background px-4 py-10">
        <Card className="w-full max-w-md p-6">
          <CardHeader>
            <CardTitle>Forgot your password?</CardTitle>
            <CardDescription>
              Enter your account email and we&apos;ll send you a password reset
              link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {message ? (
              <p role="status" className="mb-4 text-sm text-primary">
                {message}
              </p>
            ) : null}
            {error ? (
              <p role="alert" className="mb-4 text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <form onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="userEmail">Email</Label>
                <Input
                  id="userEmail"
                  name="userEmail"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your account email"
                  value={userEmail}
                  onChange={(event) => setUserEmail(event.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={!userEmail.trim() || isSubmitting}
                className="mt-5 w-full transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none"
              >
                {isSubmitting ? "Sending..." : "Send reset link"}
              </Button>
            </form>
            <Link
              to="/auth"
              className="mt-4 inline-block text-sm text-primary underline-offset-4 hover:underline"
            >
              Back to sign in
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default ForgotPasswordPage;
