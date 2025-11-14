import { IncidentSeverity } from '@/lib/api/services/fetchIncident';
import { AlertTriangle, Clock, Shield, X, Zap } from 'lucide-react-native';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface SeveritySelectorProps {
  visible: boolean;
  onClose: () => void;
  selectedSeverity: IncidentSeverity;
  onSelect: (severity: IncidentSeverity) => void;
}

export default function SeveritySelector({
  visible,
  onClose,
  selectedSeverity,
  onSelect,
}: SeveritySelectorProps) {
  const severityOptions = [
    {
      value: IncidentSeverity.Low,
      label: 'Thấp',
      description: 'Sự cố nhỏ, không ảnh hưởng nghiêm trọng',
      color: '#059669',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      icon: <Shield size={20} color="#059669" />,
    },
    {
      value: IncidentSeverity.Medium,
      label: 'Trung bình',
      description: 'Cần theo dõi và xử lý kịp thời',
      color: '#d97706',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      icon: <Clock size={20} color="#d97706" />,
    },
    {
      value: IncidentSeverity.High,
      label: 'Cao',
      description: 'Cần xử lý ngay lập tức',
      color: '#dc2626',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: <AlertTriangle size={20} color="#dc2626" />,
    },
    {
      value: IncidentSeverity.Urgent,
      label: 'Khẩn cấp',
      description: 'Tình huống nguy hiểm, cần hành động ngay',
      color: '#7c2d12',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      icon: <Zap size={20} color="#7c2d12" />,
    },
  ];

  const handleSelect = (severity: IncidentSeverity) => {
    onSelect(severity);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="rounded-t-3xl bg-white">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-gray-200 p-6">
            <Text className="text-xl font-bold text-gray-900">
              Chọn mức độ nghiêm trọng
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="rounded-full bg-gray-100 p-2"
            >
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View className="p-6">
            {severityOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => handleSelect(option.value)}
                className={`mb-3 rounded-xl border p-4 ${
                  selectedSeverity === option.value
                    ? `${option.borderColor} ${option.bgColor} border-2`
                    : 'border-gray-200 bg-white'
                }`}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center">
                  <View className="mr-3">{option.icon}</View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                      {option.label}
                    </Text>
                    <Text className="mt-1 text-sm text-gray-600">
                      {option.description}
                    </Text>
                  </View>
                  {selectedSeverity === option.value && (
                    <View
                      className="ml-2 h-6 w-6 items-center justify-center rounded-full"
                      style={{ backgroundColor: option.color }}
                    >
                      <View className="h-2 w-2 rounded-full bg-white" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
