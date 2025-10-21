import { useLogin } from '@/hooks/useAuth';
import type { LoginCredentials } from '@/lib/api/services/fetchAuth';
import { Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedBackground from './AnimatedBackground';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const { login, isLoading } = useLogin();
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async () => {
    const creds: LoginCredentials = { userNameOrEmail: email.trim(), password };

    setEmailError(null);
    setPasswordError(null);

    let hasError = false;
    if (!creds.userNameOrEmail) {
      setEmailError('Vui lòng nhập email hoặc username');
      hasError = true;
    }
    if (!creds.password) {
      setPasswordError('Vui lòng nhập mật khẩu');
      hasError = true;
    }
    if (hasError) return;

    try {
      login(creds);
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={Platform.OS === 'android' ? 120 : 20}
        keyboardOpeningTime={0}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Background */}
        <AnimatedBackground />

        {/* Login Form */}
        <View className="flex-1 justify-center p-4">
          <View className="mx-auto w-full max-w-md">
            <View className="rounded-2xl border border-blue-200/50 bg-white/90 p-6 shadow-xl backdrop-blur-md">
              <View className="mb-6 items-center space-y-4">
                <Image
                  source={require('@/assets/images/Logo_ZenKoi.png')}
                  className="mb-4 h-32 w-32"
                />
                <Text className="text-center text-2xl font-bold text-foreground">
                  Chào mừng trở lại
                </Text>
                <Text className="text-center text-muted-foreground">
                  Đăng nhập vào tài khoản ZenKoi của bạn
                </Text>
              </View>

              {/* Email */}
              <Text className="mb-2 font-medium">Email/UserName</Text>
              <TextInput
                className="mb-1 rounded-lg border border-border bg-input px-4 py-3"
                placeholder="your@email.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {emailError ? (
                <Text className="mb-2 text-sm text-red-600">{emailError}</Text>
              ) : null}

              {/* Password */}
              <Text className="mb-2 font-medium">Mật khẩu</Text>
              <View className="relative mb-1">
                <TextInput
                  className="rounded-lg border border-border bg-input px-4 py-3 pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError(null);
                  }}
                  secureTextEntry={!showPassword}
                />
                {passwordError ? (
                  <Text className="mt-1 text-sm text-red-600">
                    {passwordError}
                  </Text>
                ) : null}
                <TouchableOpacity
                  className="absolute right-3 top-3"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </TouchableOpacity>
              </View>

              {/* Remember me */}
              <View className="mb-6 mt-2 flex-row items-center justify-between">
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View
                    className={`h-5 w-5 items-center justify-center rounded border-2 ${
                      rememberMe ? 'border-primary bg-primary' : 'border-border'
                    }`}
                  >
                    {rememberMe && <Text className="text-xs">✓</Text>}
                  </View>
                  <Text className="ml-2 text-sm">Ghi nhớ đăng nhập</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text className="text-sm text-primary">Quên mật khẩu?</Text>
                </TouchableOpacity>
              </View>

              {/* Login button */}
              <TouchableOpacity
                className="items-center rounded-lg bg-primary py-4"
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="font-medium text-white">Đăng nhập</Text>
                )}
              </TouchableOpacity>

              {/* Đăng ký */}
              {/* <View className="flex-row justify-center mt-6">
                  <Text className="text-sm text-muted-foreground">
                    Chưa có tài khoản?
                  </Text>
                  <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                    <Text className="text-primary text-sm ml-1 font-medium">
                      Đăng ký
                    </Text>
                  </TouchableOpacity>
                </View> */}
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
