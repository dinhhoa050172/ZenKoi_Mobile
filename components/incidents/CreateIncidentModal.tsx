import ContextMenuField from '@/components/ContextMenuField';
import { useCreateIncident } from '@/hooks/useIncident';
import { useGetIncidentTypes } from '@/hooks/useIncidentType';
import {
  IncidentSeverity,
  RequestIncident,
} from '@/lib/api/services/fetchIncident';
import { AlertTriangle, Calendar, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface CreateIncidentModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CreateIncidentModal({
  visible,
  onClose,
}: CreateIncidentModalProps) {
  const [formData, setFormData] = useState<Partial<RequestIncident>>({
    incidentTypeId: undefined,
    incidentTitle: '',
    description: '',
    severity: IncidentSeverity.Low,
    occurredAt: new Date().toISOString(),
  });

  const createMutation = useCreateIncident();

  // Get incident types
  const { data: incidentTypesData } = useGetIncidentTypes();
  const incidentTypes = incidentTypesData?.data || [];

  const severityOptions = [
    { label: 'Thấp', value: IncidentSeverity.Low },
    { label: 'Trung bình', value: IncidentSeverity.Medium },
    { label: 'Cao', value: IncidentSeverity.High },
    { label: 'Khẩn cấp', value: IncidentSeverity.Urgent },
  ];

  const incidentTypeOptions = incidentTypes.map((type) => ({
    label: type.name,
    value: type.id.toString(),
    meta: type.description,
  }));

  const handleSubmit = async () => {
    if (
      !formData.incidentTypeId ||
      !formData.incidentTitle?.trim() ||
      !formData.description?.trim()
    ) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        incidentTypeId: formData.incidentTypeId,
        incidentTitle: formData.incidentTitle.trim(),
        description: formData.description.trim(),
        severity: formData.severity!,
        occurredAt: formData.occurredAt!,
      });

      // Reset form
      setFormData({
        incidentTypeId: undefined,
        incidentTitle: '',
        description: '',
        severity: IncidentSeverity.Low,
        occurredAt: new Date().toISOString(),
      });

      onClose();
    } catch (error) {
      console.error('Error creating incident:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      incidentTypeId: undefined,
      incidentTitle: '',
      description: '',
      severity: IncidentSeverity.Low,
      occurredAt: new Date().toISOString(),
    });
    onClose();
  };

  const formatDateForInput = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="max-h-[90%] rounded-t-3xl bg-white">
            {/* Header */}
            <View className="flex-row items-center justify-between border-b border-gray-200 p-6">
              <View className="flex-row items-center">
                <View className="mr-3 rounded-full bg-red-100 p-2">
                  <AlertTriangle size={20} color="#dc2626" />
                </View>
                <Text className="text-xl font-bold text-gray-900">
                  Báo cáo sự cố
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                className="rounded-full bg-gray-100 p-2"
                disabled={createMutation.isPending}
              >
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              className="flex-1 p-6"
              showsVerticalScrollIndicator={false}
            >
              {/* Incident Type */}
              <ContextMenuField
                label="Loại sự cố *"
                value={formData.incidentTypeId?.toString()}
                options={incidentTypeOptions}
                onSelect={(value) =>
                  setFormData({ ...formData, incidentTypeId: parseInt(value) })
                }
                placeholder="Chọn loại sự cố"
              />

              {/* Incident Title */}
              <View className="mb-4">
                <Text className="mb-2 text-base font-medium text-gray-900">
                  Tiêu đề sự cố <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  value={formData.incidentTitle}
                  onChangeText={(text) =>
                    setFormData({ ...formData, incidentTitle: text })
                  }
                  placeholder="Nhập tiêu đề ngắn gọn cho sự cố"
                  className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              {/* Severity */}
              <ContextMenuField
                label="Mức độ nghiêm trọng"
                value={formData.severity}
                options={severityOptions}
                onSelect={(value) =>
                  setFormData({
                    ...formData,
                    severity: value as IncidentSeverity,
                  })
                }
                placeholder="Chọn mức độ"
              />

              {/* Description */}
              <View className="mb-4">
                <Text className="mb-2 text-base font-medium text-gray-900">
                  Mô tả chi tiết <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData({ ...formData, description: text })
                  }
                  placeholder="Mô tả chi tiết về sự cố, nguyên nhân, tác động..."
                  multiline
                  numberOfLines={4}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
                  style={{ textAlignVertical: 'top' }}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              {/* Occurred At */}
              <View className="mb-6">
                <Text className="mb-2 text-base font-medium text-gray-900">
                  Thời gian xảy ra
                </Text>
                <View className="flex-row items-center rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <Calendar size={20} color="#6b7280" />
                  <Text className="ml-3 text-base text-gray-900">
                    {formatDateForInput(formData.occurredAt!)}
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Footer */}
            <View className="border-t border-gray-200 p-6">
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={handleClose}
                  className="flex-1 rounded-xl border border-gray-300 bg-white py-4"
                  disabled={createMutation.isPending}
                >
                  <Text className="text-center text-base font-semibold text-gray-700">
                    Hủy
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmit}
                  className={`flex-1 rounded-xl py-4 ${
                    createMutation.isPending ||
                    !formData.incidentTypeId ||
                    !formData.incidentTitle?.trim() ||
                    !formData.description?.trim()
                      ? 'bg-gray-300'
                      : 'bg-red-600'
                  }`}
                  disabled={
                    createMutation.isPending ||
                    !formData.incidentTypeId ||
                    !formData.incidentTitle?.trim() ||
                    !formData.description?.trim()
                  }
                >
                  <Text
                    className={`text-center text-base font-semibold ${
                      createMutation.isPending ||
                      !formData.incidentTypeId ||
                      !formData.incidentTitle?.trim() ||
                      !formData.description?.trim()
                        ? 'text-gray-500'
                        : 'text-white'
                    }`}
                  >
                    {createMutation.isPending ? 'Đang tạo...' : 'Tạo sự cố'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
