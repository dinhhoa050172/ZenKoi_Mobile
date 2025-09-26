import { router } from 'expo-router';
import {
  CheckCircle,
  Search,
  X,
  Zap
} from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ScanScreen() {
  const [code, setCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();

  // Simulate RFID scanning
  const startRFIDScan = () => {
    setIsScanning(true);
    
    // Simulate RFID scan delay
    setTimeout(() => {
      // Simulate scanned RFID code
      const scannedCode = `RF${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      setCode(scannedCode);
      setIsScanning(false);
      
      // Auto search after scan
      handleSearch(scannedCode);
    }, 2000);
  };

  const handleSearch = async (searchCode = code) => {
    if (!searchCode.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã hoặc quét RFID');
      return;
    }

    setIsLoading(true);
    Keyboard.dismiss();

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to detail page with the code
      router.push({
        pathname: '/',
        params: { code: searchCode }
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể tìm kiếm. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearInput = () => {
    setCode('');
    inputRef.current?.focus();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="bg-white shadow-sm border-b border-gray-200">
          <View className="flex-row items-center justify-between p-4 pt-2">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
            >
              <X size={20} color="red" />
            </TouchableOpacity>
            
            <Text className="text-gray-900 text-lg font-semibold">
              Quét RFID
            </Text>
            
            <View className="w-10" />
          </View>
        </View>

        <KeyboardAwareScrollView 
          className="flex-1" 
          contentContainerStyle={{ paddingBottom: insets.bottom + 60 }} 
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          extraScrollHeight={20}
          keyboardShouldPersistTaps="handled"
        >
          {/* RFID Scanner Section */}
          <View className="p-6">
            <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <View className="items-center mb-6">
                <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-4">
                  <Zap size={32} color="#0A3D62" />
                </View>
                <Text className="text-gray-900 text-xl font-semibold mb-2">
                  RFID Scanner
                </Text>
                <Text className="text-gray-600 text-center leading-5">
                  Đặt thẻ RFID gần thiết bị để quét tự động
                </Text>
              </View>

              {/* Manual Input */}
              <Text className="text-gray-700 font-medium mb-3">
                Nhập mã RFID:
              </Text>
              
              <View className="flex-row mb-4">
                <View className="flex-1 relative">
                  <TextInput
                    ref={inputRef}
                    value={code}
                    onChangeText={setCode}
                    placeholder="Nhập mã RFID..."
                    placeholderTextColor="#9ca3af"
                    className="bg-gray-50 border border-primary/30 rounded-2xl px-4 py-3 text-gray-900 text-base focus:border-primary"
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
                } rounded-2xl py-3 px-6`}
              >
                <View className="flex-row items-center justify-center">
                  {isLoading ? (
                    <>
                      <ActivityIndicator size="small" color="white" />
                      <Text className="text-white font-semibold ml-2">
                        Đang tìm kiếm...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Search size={20} color="white" />
                      <Text className="text-white font-semibold ml-2">
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
            <View className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
              <View className="flex-row items-start">
                <View className="w-6 h-6 bg-primary rounded-full items-center justify-center mt-0.5 mr-3">
                  <CheckCircle size={14} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-primary font-medium mb-2">
                    Hướng dẫn sử dụng:
                  </Text>
                  <Text className="text-primary/80 leading-5 text-sm">
                    • Nhập mã thủ công vào ô input{'\n'}
                    • Nhấn &quot;Tìm kiếm&quot; để xem thông tin chi tiết của cá Koi
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </SafeAreaView>
  );
}