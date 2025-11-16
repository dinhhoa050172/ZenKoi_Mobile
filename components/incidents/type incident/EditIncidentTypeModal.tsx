import ContextMenuField from '@/components/ContextMenuField';
import Loading from '@/components/Loading';
import {
  useGetIncidentTypeById,
  useUpdateIncidentType,
} from '@/hooks/useIncidentType';
import { IncidentSeverity } from '@/lib/api/services/fetchIncidentType';
import { LinearGradient } from 'expo-linear-gradient';
import {
  AlertTriangle,
  CircleAlert,
  Edit3,
  FileText,
  Heart,
  OctagonAlert,
  Save,
  Settings,
  Shield,
  TriangleAlert,
  X,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

interface EditIncidentTypeForm {
  name: string;
  description: string;
  defaultSeverity: IncidentSeverity;
  requiresQuarantine: boolean;
  affectsBreeding: boolean;
}

const severityOptions = [
  {
    label: 'Thấp - Vấn đề nhỏ, không ảnh hưởng nhiều',
    value: IncidentSeverity.LOW,
    meta: 'Có thể xử lý sau, không cần can thiệp gấp',
  },
  {
    label: 'Trung bình - Cần theo dõi và xử lý',
    value: IncidentSeverity.MEDIUM,
    meta: 'Ảnh hưởng vừa phải, cần xử lý trong vài ngày',
  },
  {
    label: 'Cao - Cần xử lý nhanh chóng',
    value: IncidentSeverity.HIGH,
    meta: 'Ảnh hưởng lớn, cần xử lý trong 24h',
  },
  {
    label: 'Nghiêm trọng - Khẩn cấp, cần can thiệp ngay',
    value: IncidentSeverity.CRITICAL,
    meta: 'Có thể gây thiệt hại lớn, xử lý ngay lập tức',
  },
];

const getSeverityInfo = (severity: IncidentSeverity) => {
  switch (severity) {
    case IncidentSeverity.CRITICAL:
      return {
        gradient: ['#ef4444', '#dc2626'] as const,
        color: '#dc2626',
        bgColor: '#fef2f2',
        label: 'Nghiêm trọng',
        icon: OctagonAlert,
        emoji: '🔴',
      };
    case IncidentSeverity.HIGH:
      return {
        gradient: ['#f97316', '#ea580c'] as const,
        color: '#ea580c',
        bgColor: '#fff7ed',
        label: 'Cao',
        icon: CircleAlert,
        emoji: '🟠',
      };
    case IncidentSeverity.MEDIUM:
      return {
        gradient: ['#f59e0b', '#d97706'] as const,
        color: '#d97706',
        bgColor: '#fffbeb',
        label: 'Trung bình',
        icon: TriangleAlert,
        emoji: '🟡',
      };
    default:
      return {
        gradient: ['#10b981', '#059669'] as const,
        color: '#059669',
        bgColor: '#f0fdf4',
        label: 'Thấp',
        icon: Shield,
        emoji: '🟢',
      };
  }
};

interface EditIncidentTypeModalProps {
  visible: boolean;
  onClose: () => void;
  incidentTypeId: number | null;
}

export default function EditIncidentTypeModal({
  visible,
  onClose,
  incidentTypeId,
}: EditIncidentTypeModalProps) {
  const [fadeAnim] = useState(new Animated.Value(0));

  const { data: incidentType, isLoading: isLoadingType } =
    useGetIncidentTypeById(incidentTypeId || 0, !!incidentTypeId && visible);

  const updateMutation = useUpdateIncidentType();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<EditIncidentTypeForm>({
    defaultValues: {
      name: '',
      description: '',
      defaultSeverity: IncidentSeverity.MEDIUM,
      requiresQuarantine: false,
      affectsBreeding: false,
    },
  });

  const watchedValues = {
    name: useWatch({ control, name: 'name', defaultValue: '' }),
  };

  const defaultSeverity = useWatch({
    control,
    name: 'defaultSeverity',
    defaultValue: IncidentSeverity.MEDIUM,
  });

  const severityInfo = getSeverityInfo(defaultSeverity);

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible, fadeAnim]);

  // Reset form khi có dữ liệu mới
  useEffect(() => {
    if (incidentType) {
      reset({
        name: incidentType.name,
        description: incidentType.description,
        defaultSeverity: incidentType.defaultSeverity,
        requiresQuarantine: incidentType.requiresQuarantine,
        affectsBreeding: incidentType.affectsBreeding,
      });
    }
  }, [incidentType, reset]);

  const onSubmit = useCallback(
    (data: EditIncidentTypeForm) => {
      if (!incidentTypeId) return;

      updateMutation.mutate(
        { id: incidentTypeId, data },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    },
    [incidentTypeId, updateMutation, onClose]
  );

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50">
        {/* Header - Same as Create */}
        <View
          className="overflow-hidden rounded-t-2xl shadow-xl"
          style={{ elevation: 6 }}
        >
          <LinearGradient
            colors={['#6366f1', '#4f46e5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="px-4 py-4"
          >
            <View className="flex-row items-center justify-between">
              <View className="h-9 w-9" />

              <View className="flex-1 items-center">
                <Text className="text-lg font-black text-white">
                  Chỉnh sửa loại sự cố
                </Text>
                <Text className="mt-1 text-sm text-white/90">
                  Cập nhật thông tin loại sự cố
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleClose}
                className="bg-white/14 h-9 w-9 items-center justify-center rounded-md"
                activeOpacity={0.7}
              >
                <X size={18} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {isLoadingType ? (
          <View className="flex-1 items-center justify-center">
            <View
              className="items-center rounded-3xl bg-white p-8 shadow-2xl"
              style={{ elevation: 8 }}
            >
              <Loading />
              <Text className="mt-6 text-lg font-bold text-gray-900">
                Đang tải thông tin...
              </Text>
              <Text className="mt-2 text-sm text-gray-500">
                Vui lòng chờ trong giây lát
              </Text>
            </View>
          </View>
        ) : (
          <>
            <KeyboardAwareScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Animated.View
                style={{ opacity: fadeAnim }}
                className="px-6 py-6"
              >
                {/* Basic Info Section - Same as Create */}
                <View
                  className="mb-6 overflow-hidden rounded-3xl bg-white shadow-xl"
                  style={{ elevation: 8 }}
                >
                  <LinearGradient
                    colors={['#f0f9ff', '#ffffff']}
                    className="p-6"
                  >
                    <View className="mb-6 flex-row items-center">
                      <View className="mr-4 h-14 w-14 items-center justify-center rounded-2xl">
                        <Edit3 size={24} color="gray" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xl font-black text-gray-900">
                          Thông tin cơ bản
                        </Text>
                        <Text className="mt-1 text-sm text-gray-500">
                          Cập nhật thông tin loại sự cố
                        </Text>
                      </View>
                    </View>

                    {/* Name Field */}
                    <View className="mb-6">
                      <View className="mb-3 flex-row items-center">
                        <FileText size={16} color="#6b7280" />
                        <Text className="ml-2 text-base font-bold uppercase tracking-wide text-gray-600">
                          Tên loại sự cố
                        </Text>
                        <View className="ml-2 rounded-full bg-red-100 px-2 py-0.5">
                          <Text className="text-sm font-bold text-red-600">
                            Bắt buộc
                          </Text>
                        </View>
                      </View>
                      <Controller
                        control={control}
                        name="name"
                        rules={{
                          required: 'Tên loại sự cố là bắt buộc',
                          minLength: {
                            value: 3,
                            message: 'Tên phải có ít nhất 3 ký tự',
                          },
                        }}
                        render={({ field: { onChange, value } }) => (
                          <View
                            className="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-sm"
                            style={{ elevation: 2 }}
                          >
                            <TextInput
                              value={value}
                              onChangeText={onChange}
                              placeholder="VD: Bệnh nấm, Chất lượng nước kém..."
                              className="px-5 py-4 text-base font-semibold text-gray-900"
                              placeholderTextColor="#9ca3af"
                              returnKeyType="next"
                              autoCapitalize="sentences"
                              autoCorrect={true}
                            />
                            {value.length > 0 && (
                              <View className="border-t border-gray-100 bg-gray-50 px-4 py-2">
                                <Text className="text-xs text-gray-500">
                                  {value.length} ký tự
                                </Text>
                              </View>
                            )}
                          </View>
                        )}
                      />
                      {errors.name && (
                        <View className="mt-2 flex-row items-center">
                          <AlertTriangle size={14} color="#ef4444" />
                          <Text className="ml-1 text-sm font-medium text-red-500">
                            {errors.name.message}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Description Field */}
                    <View className="mb-6">
                      <View className="mb-3 flex-row items-center">
                        <FileText size={16} color="#6b7280" />
                        <Text className="ml-2 text-base font-bold uppercase tracking-wide text-gray-600">
                          Mô tả chi tiết
                        </Text>
                      </View>
                      <Controller
                        control={control}
                        name="description"
                        render={({ field: { onChange, value } }) => (
                          <View
                            className="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-sm"
                            style={{ elevation: 2 }}
                          >
                            <TextInput
                              value={value}
                              onChangeText={onChange}
                              placeholder="Mô tả chi tiết về loại sự cố, cách nhận biết và xử lý..."
                              className="px-5 py-4 text-base text-gray-900"
                              placeholderTextColor="#9ca3af"
                              multiline
                              numberOfLines={4}
                              textAlignVertical="top"
                              style={{ minHeight: 100 }}
                              returnKeyType="done"
                              blurOnSubmit={true}
                              autoCapitalize="sentences"
                              autoCorrect={true}
                            />
                            {value.length > 0 && (
                              <View className="border-t border-gray-100 bg-gray-50 px-4 py-2">
                                <Text className="text-xs text-gray-500">
                                  {value.length} ký tự
                                </Text>
                              </View>
                            )}
                          </View>
                        )}
                      />
                    </View>

                    {/* Severity Field */}
                    <View>
                      <View className="mb-3 flex-row items-center">
                        <AlertTriangle size={16} color="#6b7280" />
                        <Text className="ml-2 text-base font-bold uppercase tracking-wide text-gray-600">
                          Mức độ nghiêm trọng
                        </Text>
                        <View className="ml-2 rounded-full bg-red-100 px-2 py-0.5">
                          <Text className="text-sm font-bold text-red-600">
                            Bắt buộc
                          </Text>
                        </View>
                      </View>
                      <Controller
                        control={control}
                        name="defaultSeverity"
                        render={({ field: { onChange, value } }) => (
                          <ContextMenuField
                            label=""
                            value={value}
                            options={severityOptions}
                            onSelect={onChange}
                            placeholder="Chọn mức độ nghiêm trọng"
                          />
                        )}
                      />

                      {/* Current Severity Display */}
                      <View
                        className="mt-3 overflow-hidden rounded-2xl shadow-md"
                        style={{ elevation: 3 }}
                      >
                        <LinearGradient
                          colors={severityInfo.gradient}
                          className="flex-row items-center p-4"
                        >
                          <Text className="mr-3 text-2xl">
                            {severityInfo.emoji}
                          </Text>
                          <View className="flex-1">
                            <Text className="text-sm font-semibold uppercase tracking-wide text-white/80">
                              Mức độ hiện tại
                            </Text>
                            <Text className="text-lg font-black text-white">
                              {severityInfo.label}
                            </Text>
                          </View>
                          <severityInfo.icon size={24} color="white" />
                        </LinearGradient>
                      </View>
                    </View>
                  </LinearGradient>
                </View>

                {/* Advanced Options - Same as Create */}
                <View
                  className="mb-6 overflow-hidden rounded-3xl bg-white shadow-xl"
                  style={{ elevation: 8 }}
                >
                  <LinearGradient
                    colors={['#fef3f2', '#ffffff']}
                    className="p-6"
                  >
                    <View className="mb-6 flex-row items-center">
                      <View className="mr-4 h-14 w-14 items-center justify-center rounded-2xl">
                        <Settings size={24} color="gray" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xl font-black text-gray-900">
                          Tùy chọn nâng cao
                        </Text>
                        <Text className="mt-1 text-sm text-gray-500">
                          Cấu hình tác động của sự cố
                        </Text>
                      </View>
                    </View>

                    {/* Quarantine Toggle */}
                    <Controller
                      control={control}
                      name="requiresQuarantine"
                      render={({ field: { onChange, value } }) => (
                        <View
                          className="mb-4 overflow-hidden rounded-2xl shadow-md"
                          style={{ elevation: 3 }}
                        >
                          <LinearGradient
                            colors={
                              value
                                ? ['#fecaca', '#fee2e2']
                                : ['#f3f4f6', '#ffffff']
                            }
                            className="flex-row items-center p-5"
                          >
                            <View
                              className={`mr-4 h-12 w-12 items-center justify-center rounded-2xl ${value ? 'bg-red-500' : 'bg-gray-300'} shadow-lg`}
                              style={{ elevation: 4 }}
                            >
                              <Shield size={24} color="white" />
                            </View>
                            <View className="flex-1">
                              <Text className="text-base font-bold text-gray-900">
                                Yêu cầu cách ly
                              </Text>
                              <Text className="mt-1 text-sm text-gray-600">
                                Cá bị ảnh hưởng cần được cách ly ngay
                              </Text>
                            </View>
                            <View className="ml-3">
                              <TouchableOpacity
                                onPress={() => onChange(!value)}
                                className={`h-8 w-14 items-center justify-center rounded-full ${value ? 'bg-red-500' : 'bg-gray-300'}`}
                                activeOpacity={0.8}
                              >
                                <View
                                  className={`h-6 w-6 rounded-full bg-white shadow-md ${value ? 'self-end' : 'self-start'}`}
                                />
                              </TouchableOpacity>
                            </View>
                          </LinearGradient>
                        </View>
                      )}
                    />

                    {/* Breeding Toggle */}
                    <Controller
                      control={control}
                      name="affectsBreeding"
                      render={({ field: { onChange, value } }) => (
                        <View
                          className="overflow-hidden rounded-2xl shadow-md"
                          style={{ elevation: 3 }}
                        >
                          <LinearGradient
                            colors={
                              value
                                ? ['#fbcfe8', '#fce7f3']
                                : ['#f3f4f6', '#ffffff']
                            }
                            className="flex-row items-center p-5"
                          >
                            <View
                              className={`mr-4 h-12 w-12 items-center justify-center rounded-2xl ${value ? 'bg-pink-500' : 'bg-gray-300'} shadow-lg`}
                              style={{ elevation: 4 }}
                            >
                              <Heart size={24} color="white" />
                            </View>
                            <View className="flex-1">
                              <Text className="text-base font-bold text-gray-900">
                                Ảnh hưởng sinh sản
                              </Text>
                              <Text className="mt-1 text-sm text-gray-600">
                                Tác động đến khả năng sinh sản của cá
                              </Text>
                            </View>
                            <View className="ml-3">
                              <TouchableOpacity
                                onPress={() => onChange(!value)}
                                className={`h-8 w-14 items-center justify-center rounded-full ${value ? 'bg-pink-500' : 'bg-gray-300'}`}
                                activeOpacity={0.8}
                              >
                                <View
                                  className={`h-6 w-6 rounded-full bg-white shadow-md ${value ? 'self-end' : 'self-start'}`}
                                />
                              </TouchableOpacity>
                            </View>
                          </LinearGradient>
                        </View>
                      )}
                    />
                  </LinearGradient>
                </View>
              </Animated.View>
            </KeyboardAwareScrollView>

            {/* Bottom Action Bar - Same as Create but "Cập nhật" instead of "Tạo mới" */}
            <View
              className="border-t border-gray-200 bg-white px-6 py-4 shadow-2xl"
              style={{ elevation: 10 }}
            >
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleClose}
                  className="flex-1 items-center justify-center rounded-2xl border-2 border-gray-300 bg-white py-4 shadow-sm"
                  style={{ elevation: 2 }}
                  activeOpacity={0.7}
                >
                  <Text className="text-base font-bold text-gray-700">
                    Hủy bỏ
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmit(onSubmit)}
                  disabled={!isValid || updateMutation.isPending}
                  activeOpacity={0.8}
                  className="flex-1 overflow-hidden rounded-2xl shadow-lg"
                  style={{ elevation: 4 }}
                >
                  <LinearGradient
                    colors={
                      !isValid || updateMutation.isPending
                        ? ['#d1d5db', '#9ca3af']
                        : ['#6366f1', '#4f46e5']
                    }
                    className="flex-row items-center justify-center py-4"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <ActivityIndicator color="#fff" size="small" />
                        <Text className="ml-3 text-base font-black text-white">
                          Đang lưu...
                        </Text>
                      </>
                    ) : (
                      <>
                        <Save size={20} color="white" />
                        <Text className="ml-2 text-base font-black text-white">
                          Cập nhật
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {!isValid && watchedValues.name && (
                <View className="mt-3 flex-row items-center justify-center">
                  <AlertTriangle size={14} color="#ef4444" />
                  <Text className="ml-2 text-xs font-medium text-red-600">
                    Vui lòng điền đầy đủ thông tin bắt buộc
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}
