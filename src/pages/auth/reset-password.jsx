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
import { resetPasswordService } from "@/services";
import { Eye, EyeOff, GraduationCap } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await resetPasswordService(token, password);
      setMessage(response.message);
      setPassword("");
      setConfirmPassword("");
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to reset your password. Please request a new link."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderPasswordField({
    id,
    label,
    value,
    onChange,
    visible,
    setVisible,
  }) {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <div className="relative">
          <Input
            id={id}
            name={id}
            type={visible ? "text" : "password"}
            autoComplete="new-password"
            minLength={8}
            placeholder={label}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="pr-10"
            required
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            onClick={() => setVisible(!visible)}
          >
            {visible ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    );
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
            <CardTitle>Reset your password</CardTitle>
            <CardDescription>
              Choose a new password with at least 8 characters.
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
            {!token ? (
              <p role="alert" className="mb-4 text-sm text-destructive">
                This reset link is invalid. Request a new one to continue.
              </p>
            ) : null}
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {renderPasswordField({
                  id: "password",
                  label: "New password",
                  value: password,
                  onChange: setPassword,
                  visible: passwordVisible,
                  setVisible: setPasswordVisible,
                })}
                {renderPasswordField({
                  id: "confirmPassword",
                  label: "Confirm new password",
                  value: confirmPassword,
                  onChange: setConfirmPassword,
                  visible: confirmationVisible,
                  setVisible: setConfirmationVisible,
                })}
              </div>
              <Button
                type="submit"
                disabled={!token || isSubmitting || Boolean(message)}
                className="mt-5 w-full transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none"
              >
                {isSubmitting ? "Updating..." : "Reset password"}
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

export default ResetPasswordPage;
