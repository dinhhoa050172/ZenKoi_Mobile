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
  Check,
  Edit3,
  Heart,
  Shield,
  Sparkles,
  X,
  Zap,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Modal,
  Switch,
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
        color: '#dc2626',
        bgColor: '#fef2f2',
        label: 'Nghiêm trọng',
        icon: AlertTriangle,
      };
    case IncidentSeverity.HIGH:
      return {
        color: '#ea580c',
        bgColor: '#fff7ed',
        label: 'Cao',
        icon: Zap,
      };
    case IncidentSeverity.MEDIUM:
      return {
        color: '#d97706',
        bgColor: '#fffbeb',
        label: 'Trung bình',
        icon: Shield,
      };
    default:
      return {
        color: '#059669',
        bgColor: '#f0fdf4',
        label: 'Thấp',
        icon: Check,
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
  const [showPreview, setShowPreview] = useState(false);

  const { data: incidentType, isLoading: isLoadingType } =
    useGetIncidentTypeById(incidentTypeId || 0, !!incidentTypeId && visible);

  const updateMutation = useUpdateIncidentType();

  const {
    control,
    handleSubmit,
    watch,
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

  const watchedValues = watch();
  const severityInfo = getSeverityInfo(watchedValues.defaultSeverity);

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
    setShowPreview(false);
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
      <View className="flex-1 bg-white">
        {/* Header với Glass Effect */}
        <View className="relative overflow-hidden">
          <LinearGradient
            colors={['#7c3aed', '#5b21b6', '#4c1d95']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="px-6 pb-8 pt-12"
          >
            {/* Background Pattern */}
            <View className="absolute inset-0 opacity-10">
              <View className="h-full w-full bg-white/5" />
            </View>

            <View className="relative flex-row items-center justify-between">
              <TouchableOpacity
                onPress={handleClose}
                className="rounded-full bg-white/20 p-2"
                activeOpacity={0.8}
              >
                <X size={20} color="white" />
              </TouchableOpacity>

              <View className="flex-1 items-center">
                <Text className="text-sm font-medium text-purple-100">
                  Chỉnh sửa
                </Text>
                <Text className="text-xl font-bold text-white">Loại sự cố</Text>
              </View>

              <TouchableOpacity
                onPress={() => setShowPreview(!showPreview)}
                className="rounded-full bg-white/20 p-2"
                activeOpacity={0.8}
              >
                <Sparkles size={20} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {isLoadingType ? (
          <View className="flex-1 items-center justify-center">
            <Loading />
            <Text className="mt-4 text-base text-gray-600">
              Đang tải thông tin...
            </Text>
          </View>
        ) : (
          <>
            <KeyboardAwareScrollView
              //   className="flex-1"
              contentContainerStyle={{
                paddingBottom: 120,
              }}
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View className="px-6 py-6">
                {/* Form Container */}
                <View className="rounded-3xl border border-gray-100 bg-white p-6 shadow-lg">
                  <View className="mb-6 flex-row items-center">
                    <View className="rounded-2xl bg-purple-50 p-3">
                      <Edit3 size={24} color="#7c3aed" />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="text-lg font-bold text-gray-900">
                        Thông tin cơ bản
                      </Text>
                      <Text className="text-sm text-gray-500">
                        Cập nhật thông tin loại sự cố
                      </Text>
                    </View>
                  </View>

                  {/* Tên loại sự cố */}
                  <View className="mb-6">
                    <Text className="mb-2 text-base font-medium text-gray-900">
                      Tên loại sự cố *
                    </Text>
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
                        <TextInput
                          value={value}
                          onChangeText={onChange}
                          placeholder="VD: Bệnh nấm, Chất lượng nước kém..."
                          className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-base text-gray-900"
                          placeholderTextColor="#9ca3af"
                          returnKeyType="next"
                          autoCapitalize="sentences"
                          autoCorrect={true}
                        />
                      )}
                    />
                    {errors.name && (
                      <Text className="mt-1 text-sm text-red-500">
                        {errors.name.message}
                      </Text>
                    )}
                  </View>

                  {/* Mô tả */}
                  <View className="mb-6">
                    <Text className="mb-2 text-base font-medium text-gray-900">
                      Mô tả chi tiết
                    </Text>
                    <Controller
                      control={control}
                      name="description"
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          value={value}
                          onChangeText={onChange}
                          placeholder="Mô tả chi tiết về loại sự cố này, cách nhận biết và xử lý..."
                          className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-base text-gray-900"
                          placeholderTextColor="#9ca3af"
                          multiline
                          numberOfLines={4}
                          textAlignVertical="top"
                          returnKeyType="done"
                          blurOnSubmit={true}
                          autoCapitalize="sentences"
                          autoCorrect={true}
                        />
                      )}
                    />
                  </View>

                  {/* Mức độ nghiêm trọng */}
                  <View className="mb-6">
                    <Controller
                      control={control}
                      name="defaultSeverity"
                      render={({ field: { onChange, value } }) => (
                        <ContextMenuField
                          label="Mức độ nghiêm trọng mặc định *"
                          value={value}
                          options={severityOptions}
                          onSelect={onChange}
                          placeholder="Chọn mức độ nghiêm trọng"
                        />
                      )}
                    />
                  </View>
                </View>

                {/* Advanced Options */}
                <View className="mt-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-lg">
                  <View className="mb-6 flex-row items-center">
                    <View className="rounded-2xl bg-pink-50 p-3">
                      <Heart size={24} color="#ec4899" />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="text-lg font-bold text-gray-900">
                        Tùy chọn nâng cao
                      </Text>
                      <Text className="text-sm text-gray-500">
                        Cấu hình tác động của sự cố
                      </Text>
                    </View>
                  </View>

                  {/* Yêu cầu cách ly */}
                  <Controller
                    control={control}
                    name="requiresQuarantine"
                    render={({ field: { onChange, value } }) => (
                      <View className="mb-4 flex-row items-center justify-between rounded-2xl bg-red-50 p-4">
                        <View className="flex-1 flex-row items-center">
                          <Shield size={20} color="#dc2626" />
                          <View className="ml-3 flex-1">
                            <Text className="font-medium text-gray-900">
                              Yêu cầu cách ly
                            </Text>
                            <Text className="text-sm text-gray-500">
                              Cá bị ảnh hưởng cần được cách ly
                            </Text>
                          </View>
                        </View>
                        <Switch
                          value={value}
                          onValueChange={onChange}
                          trackColor={{ false: '#f3f4f6', true: '#fecaca' }}
                          thumbColor={value ? '#dc2626' : '#9ca3af'}
                        />
                      </View>
                    )}
                  />

                  {/* Ảnh hưởng sinh sản */}
                  <Controller
                    control={control}
                    name="affectsBreeding"
                    render={({ field: { onChange, value } }) => (
                      <View className="flex-row items-center justify-between rounded-2xl bg-pink-50 p-4">
                        <View className="flex-1 flex-row items-center">
                          <Heart size={20} color="#ec4899" />
                          <View className="ml-3 flex-1">
                            <Text className="font-medium text-gray-900">
                              Ảnh hưởng sinh sản
                            </Text>
                            <Text className="text-sm text-gray-500">
                              Tác động đến quá trình sinh sản
                            </Text>
                          </View>
                        </View>
                        <Switch
                          value={value}
                          onValueChange={onChange}
                          trackColor={{ false: '#f3f4f6', true: '#fbcfe8' }}
                          thumbColor={value ? '#ec4899' : '#9ca3af'}
                        />
                      </View>
                    )}
                  />
                </View>

                {/* Preview Card */}
                {showPreview && (
                  <View className="mt-6 rounded-3xl bg-gradient-to-r from-purple-50 to-pink-50 p-6">
                    <Text className="mb-4 text-lg font-bold text-gray-900">
                      🎯 Xem trước
                    </Text>

                    <View className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                      <View className="mb-3 flex-row items-start justify-between">
                        <View className="flex-1 flex-row items-start">
                          <View
                            className="mr-3 rounded-2xl p-2.5"
                            style={{ backgroundColor: severityInfo.bgColor }}
                          >
                            <severityInfo.icon
                              size={20}
                              color={severityInfo.color}
                            />
                          </View>
                          <View className="flex-1">
                            <Text className="mb-1 text-lg font-bold text-gray-900">
                              {watchedValues.name || 'Tên loại sự cố'}
                            </Text>
                            <Text
                              className="text-sm text-gray-600"
                              numberOfLines={2}
                            >
                              {watchedValues.description || 'Mô tả chi tiết...'}
                            </Text>
                          </View>
                        </View>
                        <View
                          className="rounded-full px-3 py-1.5"
                          style={{ backgroundColor: severityInfo.bgColor }}
                        >
                          <Text
                            className="text-xs font-semibold"
                            style={{ color: severityInfo.color }}
                          >
                            {severityInfo.label}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row flex-wrap gap-2">
                        {watchedValues.requiresQuarantine && (
                          <View className="flex-row items-center rounded-lg bg-red-50 px-2.5 py-1">
                            <Shield size={12} color="#dc2626" />
                            <Text className="ml-1 text-xs font-medium text-red-700">
                              Cách ly
                            </Text>
                          </View>
                        )}
                        {watchedValues.affectsBreeding && (
                          <View className="flex-row items-center rounded-lg bg-pink-50 px-2.5 py-1">
                            <Heart size={12} color="#ec4899" />
                            <Text className="ml-1 text-xs font-medium text-pink-700">
                              Sinh sản
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </KeyboardAwareScrollView>

            {/* Action Buttons */}
            <View className="border-t border-gray-100 bg-white px-6 py-4">
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleClose}
                  className="flex-1 rounded-2xl border border-gray-200 py-4"
                  activeOpacity={0.8}
                >
                  <Text className="text-center text-base font-semibold text-gray-700">
                    Hủy
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmit(onSubmit)}
                  disabled={!isValid || updateMutation.isPending}
                  activeOpacity={0.8}
                  className={`flex-1 overflow-hidden rounded-2xl ${
                    !isValid || updateMutation.isPending ? 'bg-gray-300' : ''
                  }`}
                >
                  <LinearGradient
                    colors={
                      !isValid || updateMutation.isPending
                        ? ['#d1d5db', '#9ca3af']
                        : ['#7c3aed', '#5b21b6']
                    }
                    className="flex-row items-center justify-center py-4"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <ActivityIndicator color="#fff" size="small" />
                        <Text className="ml-2 text-lg font-semibold text-white">
                          Đang lưu...
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text className="ml-2 text-base font-bold text-white">
                          Cập nhật
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}
