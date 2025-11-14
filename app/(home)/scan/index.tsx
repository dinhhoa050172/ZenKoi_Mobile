import { CustomAlert } from '@/components/CustomAlert';
import { useGetKoiFishByRFID } from '@/hooks/useKoiFish';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { CheckCircle, Search, X, Zap } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

export default function ScanScreen() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();
  const [rfidToSearch, setRfidToSearch] = useState('');
  const koiQuery = useGetKoiFishByRFID(rfidToSearch, !!rfidToSearch);

  // Reset search input each time screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setCode('');
      setRfidToSearch('');
      setIsLoading(false);
      return () => {};
    }, [])
  );

  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [customAlertTitle, setCustomAlertTitle] = useState('');
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const [customAlertType, setCustomAlertType] = useState<
    'danger' | 'warning' | 'info'
  >('danger');
  const [customAlertOnConfirm, setCustomAlertOnConfirm] = useState<
    (() => void) | undefined
  >(() => undefined);

  const showCustomAlert = (opts: {
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm?: () => void;
  }) => {
    setCustomAlertTitle(opts.title);
    setCustomAlertMessage(opts.message);
    setCustomAlertType(opts.type ?? 'danger');
    setCustomAlertOnConfirm(
      () => opts.onConfirm ?? (() => setCustomAlertVisible(false))
    );
    setCustomAlertVisible(true);
  };

  const handleSearch = async (searchCode = code) => {
    if (!searchCode.trim()) {
      showCustomAlert({
        title: 'Lỗi',
        message: 'Vui lòng nhập mã hoặc quét RFID',
        type: 'warning',
      });
      return;
    }
    setIsLoading(true);
    Keyboard.dismiss();
    setRfidToSearch(searchCode.trim());
  };

  useEffect(() => {
    if (koiQuery.isFetching) {
      setIsLoading(true);
      return;
    }

    if (koiQuery.data) {
      setIsLoading(false);
      const koi = koiQuery.data as any;
      const id = koi?.id;
      if (id) {
        router.push({
          pathname: '/koi/[id]',
          params: { id: String(id), redirect: '/scan' },
        });
        setRfidToSearch('');
      }
    } else if (koiQuery.isError) {
      setIsLoading(false);
      showCustomAlert({
        title: 'Lỗi',
        message: 'Không tìm thấy cá Koi hoặc có lỗi khi tìm kiếm.',
        type: 'danger',
      });
    }
  }, [koiQuery.data, koiQuery.isFetching, koiQuery.isError]);

  const clearInput = () => {
    setCode('');
    inputRef.current?.focus();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="border-b border-gray-200 bg-white shadow-sm">
          <View className="flex-row items-center justify-between p-4 pt-2">
            <View className="w-10" />

            <Text className="text-lg font-semibold text-gray-900">
              Quét RFID
            </Text>

            <TouchableOpacity
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
            >
              <X size={20} color="red" />
            </TouchableOpacity>
          </View>
        </View>

        <KeyboardAwareScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
          showsVerticalScrollIndicator={false}
          bottomOffset={20}
          keyboardShouldPersistTaps="handled"
        >
          {/* RFID Scanner Section */}
          <View className="p-6">
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <View className="mb-6 items-center">
                <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Zap size={32} color="#0A3D62" />
                </View>
                <Text className="mb-2 text-xl font-semibold text-gray-900">
                  RFID Scanner
                </Text>
                <Text className="text-center leading-5 text-gray-600">
                  Đặt thẻ RFID gần thiết bị để quét tự động
                </Text>
              </View>

              {/* Manual Input */}
              <Text className="mb-3 font-medium text-gray-700">
                Nhập mã RFID:
              </Text>

              <View className="mb-4 flex-row">
                <View className="relative flex-1">
                  <TextInput
                    ref={inputRef}
                    value={code}
                    onChangeText={setCode}
                    placeholder="Nhập mã RFID..."
                    placeholderTextColor="#9ca3af"
                    className="rounded-2xl border border-primary/30 bg-gray-50 px-4 py-3 text-base text-gray-900 focus:border-primary"
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                  {code.length > 0 && (
                    <TouchableOpacity
                      onPress={clearInput}
                      className="absolute right-3 top-3"
                    >
                      <X size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Search Button */}
              <TouchableOpacity
                onPress={() => handleSearch()}
                disabled={!code.trim() || isLoading}
                className={`${
                  !code.trim() || isLoading
                    ? 'bg-gray-300'
                    : 'bg-primary active:bg-primary/90'
                } rounded-2xl px-6 py-3`}
              >
                <View className="flex-row items-center justify-center">
                  {isLoading ? (
                    <>
                      <ActivityIndicator size="small" color="white" />
                      <Text className="ml-2 font-semibold text-white">
                        Đang tìm kiếm...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Search size={20} color="white" />
                      <Text className="ml-2 font-semibold text-white">
                        Tìm kiếm
                      </Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Instructions */}
          <View className="px-6">
            <View className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <View className="flex-row items-start">
                <View className="mr-3 mt-0.5 h-6 w-6 items-center justify-center rounded-full bg-primary">
                  <CheckCircle size={14} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="mb-2 font-medium text-primary">
                    Hướng dẫn sử dụng:
                  </Text>
                  <Text className="text-sm leading-5 text-primary/80">
                    • Nhập mã thủ công vào ô tìm kiếm{'\n'}• Nhấn &quot;Tìm
                    kiếm&quot; để xem thông tin chi tiết của cá Koi
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </View>

      <CustomAlert
        visible={customAlertVisible}
        title={customAlertTitle}
        message={customAlertMessage}
        type={customAlertType}
        onCancel={() => setCustomAlertVisible(false)}
        onConfirm={() => {
          setCustomAlertVisible(false);
          if (customAlertOnConfirm) customAlertOnConfirm();
        }}
      />
    </SafeAreaView>
  );
}
