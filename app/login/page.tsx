"use client";
import { useForm } from "react-hook-form";
import { loginPatient } from "@/lib/auth/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    try {
      await loginPatient(data.email, data.password);
      router.push("/dashboard");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 border rounded p-6">
      <h1 className="text-xl mb-4">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register("email")} placeholder="Email" className="border w-full p-2 mt-2"/>
        <input {...register("password")} type="password" placeholder="Password" className="border w-full p-2 mt-2" />
        <button className="bg-blue-600 text-white w-full p-2 mt-4" type="submit">
          Login
        </button>
      </form>
    </div>
  );
}
