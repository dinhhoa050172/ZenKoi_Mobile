import { IncidentType } from '@/lib/api/services/fetchIncidentType';
import { AlertTriangle, X } from 'lucide-react-native';
import React from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface IncidentTypeSelectorProps {
  visible: boolean;
  onClose: () => void;
  incidentTypes: IncidentType[];
  selectedTypeId?: number;
  onSelect: (type: IncidentType) => void;
}

export default function IncidentTypeSelector({
  visible,
  onClose,
  incidentTypes,
  selectedTypeId,
  onSelect,
}: IncidentTypeSelectorProps) {
  const handleSelect = (type: IncidentType) => {
    onSelect(type);
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
        <View className="max-h-[80%] rounded-t-3xl bg-white">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-gray-200 p-6">
            <Text className="text-xl font-bold text-gray-900">
              Chọn loại sự cố
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="rounded-full bg-gray-100 p-2"
            >
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            className="flex-1 p-6"
            showsVerticalScrollIndicator={false}
          >
            {incidentTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                onPress={() => handleSelect(type)}
                className={`mb-3 rounded-2xl border p-4 ${
                  selectedTypeId === type.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
                activeOpacity={0.8}
              >
                <View className="flex-row items-start">
                  <View className="mr-3 mt-1 h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                    <AlertTriangle size={16} color="#ea580c" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                      {type.name}
                    </Text>
                    {type.description && (
                      <Text
                        className="mt-1 text-sm text-gray-600"
                        numberOfLines={3}
                      >
                        {type.description}
                      </Text>
                    )}
                    <View className="mt-2 flex-row items-center">
                      <View className="rounded-full bg-gray-100 px-2 py-1">
                        <Text className="text-xs font-medium text-gray-600">
                          {type.defaultSeverity}
                        </Text>
                      </View>
                      {type.requiresQuarantine && (
                        <View className="ml-2 rounded-full bg-red-100 px-2 py-1">
                          <Text className="text-xs font-medium text-red-600">
                            Cách ly
                          </Text>
                        </View>
                      )}
                      {type.affectsBreeding && (
                        <View className="ml-2 rounded-full bg-amber-100 px-2 py-1">
                          <Text className="text-xs font-medium text-amber-600">
                            Ảnh hưởng sinh sản
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  {selectedTypeId === type.id && (
                    <View className="ml-2 h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                      <View className="h-2 w-2 rounded-full bg-white" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
