import { router } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import AnimatedBackground from "./AnimatedBackground";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    setTimeout(() => {
      console.log("Login attempt:", { email, password });
      setIsLoading(false);
    }, 2000);
    router.push("/(home)");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={Platform.OS === "android" ? 120 : 20}
        keyboardOpeningTime={0}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
          {/* Background */}
          <AnimatedBackground />

          {/* Login Form */}
          <View className="flex-1 justify-center p-4">
            <View className="w-full max-w-md mx-auto">
              <View className="bg-white/90 backdrop-blur-md border border-blue-200/50 rounded-2xl shadow-xl p-6">
                <View className="items-center space-y-4 mb-6">
                  <Image
                    source={require("@/assets/images/Logo_ZenKoi.png")}
                    className="w-32 h-32 mb-4"
                  />
                  <Text className="text-2xl font-bold text-foreground text-center">
                    Chào mừng trở lại
                  </Text>
                  <Text className="text-muted-foreground text-center">
                    Đăng nhập vào tài khoản ZenKoi của bạn
                  </Text>
                </View>

                {/* Email */}
                <Text className="font-medium mb-2">Email</Text>
                <TextInput
                  className="bg-input border border-border rounded-lg px-4 py-3 mb-4"
                  placeholder="your@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                {/* Password */}
                <Text className="font-medium mb-2">Mật khẩu</Text>
                <View className="relative mb-4">
                  <TextInput
                    className="bg-input border border-border rounded-lg px-4 py-3 pr-12"
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    className="absolute right-3 top-3"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </TouchableOpacity>
                </View>

                {/* Remember me */}
                <View className="flex-row justify-between items-center mb-6">
                  <TouchableOpacity
                    className="flex-row items-center"
                    onPress={() => setRememberMe(!rememberMe)}
                  >
                    <View
                      className={`w-5 h-5 rounded border-2 items-center justify-center ${
                        rememberMe
                          ? "bg-primary border-primary"
                          : "border-border"
                      }`}
                    >
                      {rememberMe && <Text className="text-xs">✓</Text>}
                    </View>
                    <Text className="ml-2 text-sm">Ghi nhớ đăng nhập</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text className="text-primary text-sm">Quên mật khẩu?</Text>
                  </TouchableOpacity>
                </View>

                {/* Login button */}
                <TouchableOpacity
                  className="bg-primary rounded-lg py-4 items-center"
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-medium">Đăng nhập</Text>
                  )}
                </TouchableOpacity>

                {/* Đăng ký */}
                <View className="flex-row justify-center mt-6">
                  <Text className="text-sm text-muted-foreground">
                    Chưa có tài khoản?
                  </Text>
                  <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                    <Text className="text-primary text-sm ml-1 font-medium">
                      Đăng ký
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
