"use client";

import { cn } from "@/lib/utils";
import { userAuthSchema } from "@/lib/validations/auth";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Label } from "./ui/label";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

type FormData = z.infer<typeof userAuthSchema>;

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(userAuthSchema),
  });
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    const signInResult = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
      callbackUrl: searchParams?.get("callbackUrl") || "/",
    });

    setIsLoading(false);

    if (signInResult?.ok) {
      router.push(signInResult.url || "/home");
    } else {
    //   Set error for password field
      setError("password", {
        type: "manual",
        message: "Invalid email or password",
      });
      toast({
        title: "Authentication Error",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });

    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="johndoe@example.com"
              type="email"
              {...register("email")}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              type="password"
              {...register("password")}
              required
            />
          </div>

          <Button
            onClick={() => console.log(errors)}
            type="submit"
            disabled={isLoading}
          >
            Sign In with Email
          </Button>
        </div>
      </form>
    </div>
  );
}