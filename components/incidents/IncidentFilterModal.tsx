import { useGetIncidentTypes } from '@/hooks/useIncidentType';
import {
  IncidentSearchParams,
  IncidentSeverity,
  IncidentStatus,
} from '@/lib/api/services/fetchIncident';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import {
  AlertTriangle,
  Calendar,
  Filter,
  RotateCcw,
  Search,
  X,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface IncidentFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilter: (filters: IncidentSearchParams) => void;
  initialFilters?: IncidentSearchParams;
}

const severityOptions = [
  { value: IncidentSeverity.Low, label: 'Thấp', color: '#10b981' },
  { value: IncidentSeverity.Medium, label: 'Trung bình', color: '#f59e0b' },
  { value: IncidentSeverity.High, label: 'Cao', color: '#f97316' },
  { value: IncidentSeverity.Urgent, label: 'Khẩn cấp', color: '#ef4444' },
];

const statusOptions = [
  { value: IncidentStatus.Reported, label: 'Đã báo cáo', color: '#3b82f6' },
  {
    value: IncidentStatus.Investigating,
    label: 'Đang điều tra',
    color: '#f59e0b',
  },
  { value: IncidentStatus.Resolved, label: 'Đã giải quyết', color: '#10b981' },
  { value: IncidentStatus.Closed, label: 'Đã đóng', color: '#6b7280' },
  { value: IncidentStatus.Cancelled, label: 'Đã hủy', color: '#ef4444' },
];

export default function IncidentFilterModal({
  visible,
  onClose,
  onApplyFilter,
  initialFilters = {},
}: IncidentFilterModalProps) {
  const [filters, setFilters] = useState<IncidentSearchParams>(initialFilters);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  const { data: incidentTypesData } = useGetIncidentTypes();
  const incidentTypes = incidentTypesData?.data || [];

  useEffect(() => {
    if (visible) {
      setFilters(initialFilters);
    }
  }, [visible, initialFilters]);

  const handleApplyFilter = () => {
    onApplyFilter(filters);
    onClose();
  };

  const handleResetFilter = () => {
    const resetFilters: IncidentSearchParams = {};
    setFilters(resetFilters);
  };

  const updateFilter = (key: keyof IncidentSearchParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const removeFilter = (key: keyof IncidentSearchParams) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getFilterCount = () => {
    let count = 0;
    if (filters.Search) count++;
    if (filters.Status) count++;
    if (filters.Severity) count++;
    if (filters.IncidentTypeId) count++;
    if (filters.OccurredFrom) count++;
    if (filters.OccurredTo) count++;
    return count;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-black/60">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1} // Sửa từ 2 thành 1
            onPress={onClose}
          >
            {/* SỬA LỖI: Đổi justify-center thành justify-end */}
            <View className="flex-1 justify-end">
              <TouchableOpacity activeOpacity={1}>
                <View className="max-h-[90%] rounded-t-3xl bg-white">
                  {/* Header */}
                  <LinearGradient
                    colors={['#3b82f6', '#1d4ed8']}
                    className="rounded-t-3xl px-6 py-4" // Thêm rounded-t-3xl
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <View className="mr-3 rounded-full bg-white/20 p-2">
                          <Filter size={20} color="white" />
                        </View>
                        <View>
                          <Text className="text-lg font-bold text-white">
                            Lọc sự cố
                          </Text>
                          {getFilterCount() > 0 && (
                            <Text className="text-sm text-blue-100">
                              {getFilterCount()} bộ lọc đang áp dụng
                            </Text>
                          )}
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={onClose}
                        className="rounded-full bg-white/20 p-2"
                      >
                        <X size={20} color="white" />
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>

                  {/* Content */}
                  <ScrollView
                    className="px-6" // Xóa padding y
                    showsVerticalScrollIndicator={false}
                  >
                    {/* CẢI TIỆN: Thêm View wrapper và padding cho từng section */}
                    <View>
                      {/* Search Section */}
                      <View className="py-6">
                        <Text className="mb-3 text-sm font-medium text-slate-600">
                          Tìm kiếm theo tiêu đề
                        </Text>
                        <View className="flex-row items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-1">
                          <Search size={20} color="#94a3b8" />
                          <TextInput
                            className="ml-3 flex-1 py-3 text-base text-slate-900"
                            placeholder="Nhập tiêu đề sự cố..."
                            placeholderTextColor="#94a3b8"
                            value={filters.Search || ''}
                            onChangeText={(text) =>
                              updateFilter('Search', text)
                            }
                          />
                          {filters.Search && (
                            <TouchableOpacity
                              onPress={() => removeFilter('Search')}
                              className="ml-2 rounded-full bg-slate-200 p-1"
                            >
                              <X size={14} color="#64748b" />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>

                      {/* Divider */}
                      <View className="h-px bg-slate-100" />

                      {/* Status Filter Section */}
                      <View className="py-6">
                        <Text className="mb-3 text-sm font-medium text-slate-600">
                          Trạng thái
                        </Text>
                        <View className="flex-row flex-wrap gap-4">
                          {statusOptions.map((status) => (
                            <TouchableOpacity
                              key={status.value}
                              onPress={() =>
                                filters.Status === status.value
                                  ? removeFilter('Status')
                                  : updateFilter('Status', status.value)
                              }
                              className={`rounded-2xl border px-4 py-2 ${
                                filters.Status === status.value
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-slate-200 bg-white'
                              }`}
                            >
                              <View className="flex-row items-center">
                                <View
                                  className="mr-2 h-3 w-3 rounded-full"
                                  style={{ backgroundColor: status.color }}
                                />
                                <Text
                                  className={`text-sm font-medium ${
                                    filters.Status === status.value
                                      ? 'text-blue-700'
                                      : 'text-slate-700'
                                  }`}
                                >
                                  {status.label}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      {/* Divider */}
                      <View className="h-px bg-slate-100" />

                      {/* Severity Filter Section */}
                      <View className="py-6">
                        <Text className="mb-3 text-sm font-medium text-slate-600">
                          Mức độ nghiêm trọng
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                          {severityOptions.map((severity) => (
                            <TouchableOpacity
                              key={severity.value}
                              onPress={() =>
                                filters.Severity === severity.value
                                  ? removeFilter('Severity')
                                  : updateFilter('Severity', severity.value)
                              }
                              className={`rounded-2xl border px-4 py-2 ${
                                filters.Severity === severity.value
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-slate-200 bg-white'
                              }`}
                            >
                              <View className="flex-row items-center">
                                <AlertTriangle
                                  size={16}
                                  color={severity.color}
                                />
                                <Text
                                  className={`ml-2 text-sm font-medium ${
                                    filters.Severity === severity.value
                                      ? 'text-blue-700'
                                      : 'text-slate-700'
                                  }`}
                                >
                                  {severity.label}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      {/* Divider */}
                      <View className="h-px bg-slate-100" />

                      {/* CẢI TIỆN: Incident Type Filter (Vertical List) */}
                      <View className="py-6">
                        <Text className="mb-3 text-sm font-medium text-slate-600">
                          Loại sự cố
                        </Text>
                        <View className="flex-col gap-4">
                          {incidentTypes.map((type) => (
                            <TouchableOpacity
                              key={type.id}
                              onPress={() =>
                                filters.IncidentTypeId === type.id
                                  ? removeFilter('IncidentTypeId')
                                  : updateFilter('IncidentTypeId', type.id)
                              }
                              className={`rounded-2xl border p-3 ${
                                filters.IncidentTypeId === type.id
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-slate-200 bg-white'
                              }`}
                            >
                              <Text
                                className={`text-sm font-medium ${
                                  filters.IncidentTypeId === type.id
                                    ? 'text-blue-700'
                                    : 'text-slate-700'
                                }`}
                              >
                                {type.name}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      {/* Divider */}
                      <View className="h-px bg-slate-100" />

                      {/* Date Range Filter Section */}
                      <View className="py-6">
                        <Text className="mb-3 text-sm font-medium text-slate-600">
                          Thời gian xảy ra
                        </Text>
                        <View className="flex-row gap-3">
                          {/* From Date */}
                          <View className="flex-1">
                            <Text className="mb-2 text-xs font-medium text-slate-500">
                              Từ ngày
                            </Text>
                            {/* CẢI TIỆN: Đổi bg-white -> bg-slate-50 */}
                            <TouchableOpacity
                              onPress={() => setShowFromDatePicker(true)}
                              className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                            >
                              <View className="flex-row items-center justify-between">
                                <Text
                                  className={`text-sm ${
                                    filters.OccurredFrom
                                      ? 'text-slate-900'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {formatDate(filters.OccurredFrom) ||
                                    'Chọn ngày'}
                                </Text>
                                {/* CẢI TIỆN: Hiển thị X thay vì Calendar nếu có date */}
                                {filters.OccurredFrom ? (
                                  <TouchableOpacity
                                    onPress={() => removeFilter('OccurredFrom')}
                                    className="p-1"
                                  >
                                    <X size={16} color="#64748b" />
                                  </TouchableOpacity>
                                ) : (
                                  <Calendar size={16} color="#94a3b8" />
                                )}
                              </View>
                            </TouchableOpacity>
                            {/* Bỏ text "Xóa" bên dưới */}
                          </View>

                          {/* To Date */}
                          <View className="flex-1">
                            <Text className="mb-2 text-xs font-medium text-slate-500">
                              Đến ngày
                            </Text>
                            {/* CẢI TIỆN: Đổi bg-white -> bg-slate-50 */}
                            <TouchableOpacity
                              onPress={() => setShowToDatePicker(true)}
                              className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                            >
                              <View className="flex-row items-center justify-between">
                                <Text
                                  className={`text-sm ${
                                    filters.OccurredTo
                                      ? 'text-slate-900'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {formatDate(filters.OccurredTo) ||
                                    'Chọn ngày'}
                                </Text>
                                {/* CẢI TIỆN: Hiển thị X thay vì Calendar nếu có date */}
                                {filters.OccurredTo ? (
                                  <TouchableOpacity
                                    onPress={() => removeFilter('OccurredTo')}
                                    className="p-1"
                                  >
                                    <X size={16} color="#64748b" />
                                  </TouchableOpacity>
                                ) : (
                                  <Calendar size={16} color="#94a3b8" />
                                )}
                              </View>
                            </TouchableOpacity>
                            {/* Bỏ text "Xóa" bên dưới */}
                          </View>
                        </View>
                      </View>
                    </View>
                  </ScrollView>

                  {/* Footer Actions */}
                  <View className="border-t border-slate-100 px-6 py-4">
                    <View className="flex-row gap-4">
                      {/* Reset Button */}
                      <TouchableOpacity
                        onPress={handleResetFilter}
                        className="flex-1 items-center rounded-2xl border border-slate-200 bg-slate-50 py-4"
                      >
                        <View className="flex-row items-center">
                          <RotateCcw size={18} color="#64748b" />
                          <Text className="ml-2 text-base font-semibold text-slate-700">
                            Đặt lại
                          </Text>
                        </View>
                      </TouchableOpacity>

                      {/* Apply Button */}
                      <TouchableOpacity
                        onPress={handleApplyFilter}
                        className="flex-1 overflow-hidden rounded-2xl"
                      >
                        <LinearGradient
                          colors={['#3b82f6', '#1d4ed8']}
                          className="py-4"
                        >
                          <Text className="text-center text-base font-bold text-white">
                            Áp dụng{' '}
                            {getFilterCount() > 0 && `(${getFilterCount()})`}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>

        {/* Date Pickers */}
        {showFromDatePicker && (
          <DateTimePicker
            value={
              filters.OccurredFrom ? new Date(filters.OccurredFrom) : new Date()
            }
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowFromDatePicker(false);
              if (selectedDate) {
                updateFilter('OccurredFrom', selectedDate.toISOString());
              }
            }}
          />
        )}

        {showToDatePicker && (
          <DateTimePicker
            value={
              filters.OccurredTo ? new Date(filters.OccurredTo) : new Date()
            }
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowToDatePicker(false);
              if (selectedDate) {
                updateFilter('OccurredTo', selectedDate.toISOString());
              }
            }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}
