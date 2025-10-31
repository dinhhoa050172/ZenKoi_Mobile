import { ChevronDown } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Option = { label: string; value: string };

export default function ContextMenuField({
  label,
  value,
  options,
  onSelect,
  placeholder,
  onPress,
}: {
  label: string;
  value?: string | undefined;
  options: Option[];
  onSelect: (v: string) => void;
  placeholder?: string;
  onPress?: () => void;
}) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <View className="mb-1">
        <Text className="mb-2 text-base font-medium text-gray-900">
          {label}
        </Text>
        <TouchableOpacity
          className="flex-row items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
          onPress={() => {
            onPress?.();
            setShowDialog(true);
          }}
        >
          <Text className={`${value ? 'text-gray-900' : 'text-gray-500'}`}>
            {options.find((o) => o.value === value)?.label ||
              placeholder ||
              'Chọn'}
          </Text>
          <ChevronDown size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDialog(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 p-4">
          <View className="w-full max-w-sm rounded-2xl bg-white">
            <View className="border-b border-gray-200 p-4">
              <Text className="text-center text-lg font-semibold text-gray-900">
                Chọn {label.toLowerCase()}
              </Text>
            </View>

            <ScrollView className="max-h-80">
              {options.length === 1 && options[0].value === '' ? (
                <View className="items-center py-8">
                  <ActivityIndicator size="small" color="#0A3D62" />
                  <Text className="mt-2 text-gray-500">Đang tải...</Text>
                </View>
              ) : (
                options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    className={`flex-row items-center px-4 py-4 ${index < options.length - 1 ? 'border-b border-gray-100' : ''}`}
                    onPress={() => {
                      onSelect(option.value);
                      setShowDialog(false);
                    }}
                  >
                    <View
                      className={`mr-3 h-5 w-5 rounded-full border-2 ${value === option.value ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}
                    >
                      {value === option.value && (
                        <View className="h-full w-full rounded-full border-2 border-blue-500 bg-white" />
                      )}
                    </View>
                    <Text
                      className={`flex-1 ${value === option.value ? 'font-medium text-blue-600' : 'text-gray-900'}`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <View className="border-t border-gray-200 p-4">
              <TouchableOpacity
                className="rounded-lg bg-gray-100 py-3"
                onPress={() => setShowDialog(false)}
              >
                <Text className="text-center font-medium text-gray-700">
                  Hủy
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
