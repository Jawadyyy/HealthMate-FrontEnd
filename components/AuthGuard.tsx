"use client";
import { useRouter } from "next/navigation";
import useUser from "@/lib/hooks/useUser";
import { useEffect } from "react";

export default function AuthGuard({ children }: any) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  if (loading) return <div>Loading...</div>;

  return children;
}
