"use client";

import { productIdentity } from "@/config/product";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  email: z.string().min(1, "メールアドレスを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

type FormValues = z.infer<typeof schema>;

export default function SignInPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSubmit = handleSubmit(async (values) => {
    setIsLoading(true);
    setError(null);
    const result = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
    });
    setIsLoading(false);

    if (result?.error) {
      setError("メールアドレスまたはパスワードが違います。");
      return;
    }

    router.replace("/dashboard");
  });

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-xl">
      <div className="space-y-2 text-center">
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          {productIdentity.tagline}
        </p>
        <h1 className="text-2xl font-bold text-slate-900">
          {productIdentity.name} ログイン
        </h1>
        <p className="text-sm text-slate-500">
          デモユーザー: akira@circus.agency / password123
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div>
          <label className="text-sm font-medium text-slate-700">
            メールアドレス
          </label>
          <input
            type="email"
            className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none"
            placeholder="you@example.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-rose-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            パスワード
          </label>
          <input
            type="password"
            className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none"
            placeholder="••••••••"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-rose-600">
              {errors.password.message}
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-blue-600 py-2.5 text-white font-semibold transition hover:bg-blue-500 disabled:opacity-50"
        >
          {isLoading ? "サインイン中..." : "サインイン"}
        </button>
      </form>
    </div>
  );
}
