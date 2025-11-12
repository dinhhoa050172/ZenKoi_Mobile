import AnimatedBackground from '@/components/AnimatedBackground';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as z from 'zod';

const registerSchema = z
  .object({
    email: z.preprocess(
      (val) => (typeof val === 'string' ? val : ''),
      z.string().nonempty('Không được để trống').email('Email không hợp lệ')
    ),
    username: z.preprocess(
      (val) => (typeof val === 'string' ? val : ''),
      z
        .string()
        .nonempty('Không được để trống')
        .min(3, 'Tên người dùng phải có ít nhất 3 ký tự')
    ),
    password: z.preprocess(
      (val) => (typeof val === 'string' ? val : ''),
      z
        .string()
        .nonempty('Không được để trống')
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    ),
    confirmPassword: z.preprocess(
      (val) => (typeof val === 'string' ? val : ''),
      z.string().nonempty('Không được để trống')
    ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema) as any,
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      console.log('Register data:', data);
      // 👉 gọi API thật ở đây
      setTimeout(() => {
        alert('Đăng ký thành công! Chào mừng bạn đến với ZenKoi.');
        router.replace('/');
      }, 1000);
    } catch (error) {
      console.error('Registration error:', error);
      alert('Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={40}
      >
        <View style={{ flex: 1 }}>
          {/* Place background absolutely so content can be centered vertically */}
          <View
            style={{ ...StyleSheet.absoluteFillObject }}
            pointerEvents="none"
          >
            <AnimatedBackground />
          </View>

          {/* Content container - center vertically on tall screens */}
          <View style={{ flex: 1, justifyContent: 'center' }} className="p-4">
            <View className="mx-auto w-full max-w-md">
              <View className="rounded-2xl border border-blue-200/50 bg-white/90 px-6 pb-4 shadow-xl backdrop-blur-md">
                <View className="mb-2 items-center space-y-4">
                  <Image
                    source={require('@/assets/images/Logo_ZenKoi.png')}
                    className="h-32 w-32"
                  />
                  <Text className="text-center text-2xl font-bold text-foreground">
                    Tạo tài khoản
                  </Text>
                  <Text className="text-center text-muted-foreground">
                    Đăng ký tài khoản ZenKoi để bắt đầu quản lý trang trại
                  </Text>
                </View>

                {/* Email */}
                <Text className="mb-2 font-medium">Email</Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, value } }) => (
                    <>
                      <TextInput
                        className="mb-1 rounded-lg border border-border bg-input px-4 py-3"
                        placeholder="your@email.com"
                        value={value}
                        onChangeText={onChange}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                      {errors.email && (
                        <Text className="text-sm text-red-500">
                          {errors.email.message}
                        </Text>
                      )}
                    </>
                  )}
                />

                {/* Username */}
                <Text className="mb-2 font-medium">Họ và tên</Text>
                <Controller
                  control={control}
                  name="username"
                  render={({ field: { onChange, value } }) => (
                    <>
                      <TextInput
                        className="mb-1 rounded-lg border border-border bg-input px-4 py-3"
                        placeholder="Họ và tên"
                        value={value}
                        onChangeText={onChange}
                      />
                      {errors.username && (
                        <Text className="text-sm text-red-500">
                          {errors.username.message}
                        </Text>
                      )}
                    </>
                  )}
                />

                {/* Password */}
                <Text className="mb-2 font-medium">Mật khẩu</Text>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <>
                      <View className="relative mb-1">
                        <TextInput
                          className="rounded-lg border border-border bg-input px-4 py-3 pr-12"
                          placeholder="••••••••"
                          value={value}
                          onChangeText={onChange}
                          secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                          className="absolute right-3 top-3"
                          onPress={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </TouchableOpacity>
                      </View>
                      {errors.password && (
                        <Text className="text-sm text-red-500">
                          {errors.password.message}
                        </Text>
                      )}
                    </>
                  )}
                />

                {/* Confirm Password */}
                <Text className="mb-2 font-medium">Xác nhận mật khẩu</Text>
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, value } }) => (
                    <>
                      <View className="relative mb-1">
                        <TextInput
                          className="rounded-lg border border-border bg-input px-4 py-3 pr-12"
                          placeholder="••••••••"
                          value={value}
                          onChangeText={onChange}
                          secureTextEntry={!showConfirmPassword}
                        />
                        <TouchableOpacity
                          className="absolute right-3 top-3"
                          onPress={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </TouchableOpacity>
                      </View>
                      {errors.confirmPassword && (
                        <Text className="text-sm text-red-500">
                          {errors.confirmPassword.message}
                        </Text>
                      )}
                    </>
                  )}
                />

                {/* Submit Button */}
                <TouchableOpacity
                  className="mt-1 items-center rounded-lg bg-primary py-4"
                  onPress={handleSubmit(onSubmit)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="font-medium text-white">Đăng ký</Text>
                  )}
                </TouchableOpacity>

                {/* Link Sign in */}
                <View className="mt-4 flex-row justify-center">
                  <Text className="text-sm text-muted-foreground">
                    Đã có tài khoản?
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push('/(auth)/login')}
                  >
                    <Text className="ml-1 text-sm font-medium text-primary">
                      Đăng nhập
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
