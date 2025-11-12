import { Check, ChevronDown, Search, X } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Option = { label: string; value: string; meta?: string };

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
  const [searchQuery, setSearchQuery] = useState('');

  const selectedOption = options.find((o) => o.value === value);
  const isLoading = options.length === 1 && options[0].value === '';

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        opt.meta?.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  const handleOpen = () => {
    onPress?.();
    setShowDialog(true);
    setSearchQuery('');
  };

  const handleClose = () => {
    setShowDialog(false);
    setSearchQuery('');
  };

  const handleSelect = (optionValue: string) => {
    onSelect(optionValue);
    handleClose();
  };

  return (
    <>
      <View className="mb-1">
        {label && (
          <Text className="mb-2 text-base font-medium text-gray-900">
            {label}
          </Text>
        )}
        <TouchableOpacity
          className={`flex-row items-center justify-between rounded-2xl border px-4 py-3 ${
            value
              ? 'border-primary/30 bg-primary/5'
              : 'border-gray-200 bg-gray-50'
          }`}
          onPress={handleOpen}
          activeOpacity={0.7}
        >
          <Text
            className={`flex-1 ${value ? 'font-medium text-gray-900' : 'text-gray-500'}`}
            numberOfLines={1}
          >
            {selectedOption?.label || placeholder || 'Chọn'}
          </Text>
          <ChevronDown size={20} color={value ? '#0A3D62' : '#6b7280'} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showDialog}
        transparent={true}
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View className="flex-1 items-center justify-end bg-black/50">
          <View
            className="w-full flex-1 rounded-t-3xl bg-white"
            style={{ maxHeight: '85%' }}
          >
            {/* Header */}
            <View className="border-b border-gray-100 px-6 py-5">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-sm font-medium uppercase tracking-wide text-gray-500">
                    Chọn
                  </Text>
                  <Text
                    className="text-xl font-bold text-gray-900"
                    numberOfLines={1}
                  >
                    {label || 'Tùy chọn'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleClose}
                  className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
                >
                  <X size={18} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {/* Search Bar - Only show if more than 5 options */}
              {options.length > 5 && !isLoading && (
                <View className="mt-4 flex-row items-center rounded-2xl border border-gray-200 bg-gray-50 px-4">
                  <Search size={18} color="#9ca3af" />
                  <TextInput
                    className="ml-3 flex-1 text-base text-gray-900"
                    placeholder="Tìm kiếm..."
                    placeholderTextColor="#9ca3af"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setSearchQuery('')}
                      className="ml-2"
                    >
                      <X size={18} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            {/* Options List */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {isLoading ? (
                <View className="items-center py-12">
                  <ActivityIndicator size="large" color="#0A3D62" />
                  <Text className="mt-3 text-base text-gray-500">
                    Đang tải...
                  </Text>
                </View>
              ) : filteredOptions.length === 0 ? (
                <View className="items-center py-12">
                  <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <Search size={28} color="#9ca3af" />
                  </View>
                  <Text className="text-base font-medium text-gray-900">
                    Không tìm thấy kết quả
                  </Text>
                  <Text className="mt-1 text-sm text-gray-500">
                    Thử tìm kiếm với từ khóa khác
                  </Text>
                </View>
              ) : (
                <View className="px-4 py-2">
                  {filteredOptions.map((option, index) => {
                    const isSelected = value === option.value;
                    return (
                      <TouchableOpacity
                        key={index}
                        className={`mb-2 flex-row items-center rounded-2xl border p-4 ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-100 bg-white'
                        }`}
                        onPress={() => handleSelect(option.value)}
                        activeOpacity={0.7}
                      >
                        {/* Radio Button */}
                        <View
                          className={`mr-3 h-6 w-6 items-center justify-center rounded-full border-2 ${
                            isSelected
                              ? 'border-primary bg-primary'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check size={14} color="white" />}
                        </View>

                        {/* Option Content */}
                        <View className="flex-1">
                          <Text
                            className={`text-base ${
                              isSelected
                                ? 'font-semibold text-primary'
                                : 'font-medium text-gray-900'
                            }`}
                            numberOfLines={2}
                          >
                            {option.label}
                          </Text>
                          {option.meta && (
                            <Text
                              className="mt-1 text-sm text-gray-500"
                              numberOfLines={1}
                            >
                              {option.meta}
                            </Text>
                          )}
                        </View>

                        {/* Selected Badge */}
                        {isSelected && (
                          <View className="ml-2 rounded-full bg-primary/10 px-3 py-1">
                            <Text className="text-xs font-semibold text-primary">
                              Đã chọn
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </ScrollView>

            {/* Footer */}
            <View className="border-t border-gray-100 p-4">
              <TouchableOpacity
                className="items-center justify-center rounded-2xl border border-gray-200 bg-white py-3"
                onPress={handleClose}
              >
                <Text className="text-base font-semibold text-gray-700">
                  Đóng
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
