import useSWR from "swr";
import api from "@/lib/api/api";

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function useUser() {
  const { data, error, isLoading, mutate } = useSWR("/auth/me", fetcher);
  return {
    user: data,
    loading: isLoading,
    error,
    mutate
  };
}
