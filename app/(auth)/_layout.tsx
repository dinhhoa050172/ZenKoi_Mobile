import { useAuthStore } from "@/store/authStore";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";

export default function AuthLayout() {
  const { token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      // Nếu đã login thì không được vào auth nữa
      router.push("/(home)");
    }
  }, [token]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
