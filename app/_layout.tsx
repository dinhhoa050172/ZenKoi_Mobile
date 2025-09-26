import Loading from "@/components/Loading";
import { useAuthStore } from "@/store/authStore";
import { Stack, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import "../global.css";

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const { setToken } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("access_token");
        console.log("Stored token:", storedToken);
        if (storedToken) {
          setToken(storedToken);
          router.replace("/(home)");
        } else {
          router.replace("/(auth)/login");
        }
      } catch (err) {
        console.error("Error loading token:", err);
        router.replace("/(auth)/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      {isLoading && <Loading />}
    </>
  );
}
