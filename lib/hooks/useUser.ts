import useSWR from "swr";
import api from "@/lib/api/api";

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function useUser() {
  const { data, error, isLoading, mutate } = useSWR("/auth/me", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  // Check if user is logged in
  const isLoggedIn = typeof window !== "undefined" && localStorage.getItem("isLoggedIn") === "true";

  return {
    user: data,
    loading: isLoading,
    error,
    isLoggedIn,
    mutate,
  };
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("isLoggedIn");
  window.location.href = "/login";
}