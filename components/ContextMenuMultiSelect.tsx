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

type Props = {
  options: Option[];
  values?: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  onPress?: () => void;
  label?: string;
  disabled?: boolean;
};

const ContextMenuMultiSelect: React.FC<Props> = ({
  options,
  values = [],
  onChange,
  placeholder = 'Chọn',
  onPress,
  label,
  disabled = false,
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedSet = useMemo(() => new Set(values), [values]);
  const isLoading = options.length === 1 && options[0].value === '';

  // Get selected labels
  const selectedLabels = useMemo(() => {
    return options.filter((o) => values.includes(o.value)).map((o) => o.label);
  }, [options, values]);

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
    if (disabled) return;
    onPress?.();
    setShowDialog(true);
    setSearchQuery('');
  };

  const handleClose = () => {
    setShowDialog(false);
    setSearchQuery('');
  };

  const toggle = (val: string) => {
    const next = new Set(values);
    if (next.has(val)) next.delete(val);
    else next.add(val);
    onChange(Array.from(next));
  };

  const handleSelectAll = () => {
    onChange(filteredOptions.map((o) => o.value));
  };

  const handleClearAll = () => {
    onChange([]);
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
            values.length > 0
              ? 'border-primary/30 bg-primary/5'
              : 'border-gray-200 bg-gray-50'
          } ${disabled ? 'opacity-60' : ''}`}
          onPress={handleOpen}
          activeOpacity={0.7}
          disabled={disabled}
        >
          <View className="flex-1 flex-row items-center">
            <Text
              className={`flex-1 ${
                values.length > 0
                  ? 'font-medium text-gray-900'
                  : 'text-gray-500'
              }`}
              numberOfLines={1}
            >
              {selectedLabels.length > 0
                ? selectedLabels.join(', ')
                : placeholder}
            </Text>
            {values.length > 0 && (
              <View className="ml-2 rounded-full bg-primary px-2 py-0.5">
                <Text className="text-xs font-bold text-white">
                  {values.length}
                </Text>
              </View>
            )}
          </View>
          <ChevronDown
            size={20}
            color={values.length > 0 ? '#0A3D62' : '#6b7280'}
          />
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
                    Chọn nhiều
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

              {/* Action Buttons */}
              {!isLoading && options.length > 0 && (
                <View className="mt-4 flex-row gap-2">
                  <TouchableOpacity
                    onPress={handleSelectAll}
                    className="flex-1 rounded-2xl border border-gray-300 py-2"
                    activeOpacity={0.7}
                  >
                    <Text className="text-center text-sm font-semibold text-primary">
                      Chọn tất cả ({options.length})
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleClearAll}
                    className="flex-1 rounded-2xl border border-gray-300 bg-white py-2"
                    activeOpacity={0.7}
                    disabled={values.length === 0}
                  >
                    <Text
                      className={`text-center text-sm font-semibold ${
                        values.length === 0 ? 'text-gray-400' : 'text-primary'
                      }`}
                    >
                      Bỏ chọn tất cả
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Search Bar - Only show if more than 5 options */}
              {options.length > 5 && !isLoading && (
                <View className="mt-4 flex-row items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
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

              {/* Selection Summary */}
              {values.length > 0 && (
                <View className="mt-4 rounded-2xl bg-primary/5 px-4 py-3">
                  <Text className="text-sm font-semibold text-primary">
                    Đã chọn {values.length} / {options.length} tùy chọn
                  </Text>
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
                    const isSelected = selectedSet.has(option.value);
                    return (
                      <TouchableOpacity
                        key={index}
                        className={`mb-2 flex-row items-center rounded-2xl border p-4 ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-100 bg-white'
                        }`}
                        onPress={() => toggle(option.value)}
                        activeOpacity={0.7}
                      >
                        {/* Checkbox */}
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
                            <Text className="mt-1 text-sm text-gray-500">
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
            <View className="border-t border-gray-100 px-4 py-4">
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 items-center justify-center rounded-2xl border border-gray-200 bg-white py-3"
                  onPress={handleClose}
                  activeOpacity={0.7}
                >
                  <Text className="text-base font-semibold text-gray-700">
                    Đóng
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 items-center justify-center rounded-2xl bg-primary py-3"
                  onPress={handleClose}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    <Check size={18} color="white" />
                    <Text className="ml-2 text-base font-semibold text-white">
                      Xong ({values.length})
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ContextMenuMultiSelect;
