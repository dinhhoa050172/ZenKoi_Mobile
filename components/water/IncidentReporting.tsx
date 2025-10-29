import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Plus,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface IncidentReportingProps {
  pondId: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function IncidentReporting({
  pondId,
  isExpanded,
  onToggle,
}: IncidentReportingProps) {
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [selectedIncidentType, setSelectedIncidentType] = useState('Cá chết');
  const [showIncidentTypeDropdown, setShowIncidentTypeDropdown] =
    useState(false);
  const [incidentDescription, setIncidentDescription] = useState('');
  const [fishCount, setFishCount] = useState('');

  const incidentTypes = [
    'Cá chết',
    'Cá bệnh',
    'Chất lượng nước xấu',
    'Thiết bị hỏng',
    'Khác',
  ];

  const handleSubmitIncident = () => {
    if (!incidentDescription.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mô tả sự cố');
      return;
    }

    // TODO: Implement API call to submit incident
    console.log(`Submitting incident for pond ${pondId}:`, {
      type: selectedIncidentType,
      description: incidentDescription,
      fishCount: fishCount ? parseInt(fishCount) : undefined,
    });

    Alert.alert('Thành công', 'Đã báo cáo sự cố');

    // Reset form
    setIncidentDescription('');
    setFishCount('');
    setShowIncidentForm(false);
  };

  return (
    <View className="mb-4 rounded-2xl bg-white shadow-sm">
      <TouchableOpacity
        onPress={onToggle}
        className="flex-row items-center justify-between p-4"
      >
        <Text className="text-lg font-semibold text-gray-900">
          Báo cáo sự cố
        </Text>
        {isExpanded ? (
          <ChevronUp size={20} color="#6b7280" />
        ) : (
          <ChevronDown size={20} color="#6b7280" />
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View className="px-4 pb-4">
          {!showIncidentForm ? (
            <TouchableOpacity
              onPress={() => setShowIncidentForm(true)}
              className="flex-row items-center justify-center rounded-xl bg-red-500 py-3"
            >
              <Plus size={16} color="white" />
              <Text className="ml-2 font-medium text-white">
                Báo cáo sự cố mới
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="space-y-4">
              {/* Incident Type */}
              <View>
                <Text className="mb-2 font-medium text-gray-700">
                  Loại sự cố <Text className="text-red-500">*</Text>
                </Text>
                <TouchableOpacity
                  className="flex-row items-center justify-between rounded-xl border border-gray-300 bg-gray-50 px-4 py-3"
                  onPress={() =>
                    setShowIncidentTypeDropdown(!showIncidentTypeDropdown)
                  }
                >
                  <Text className="text-gray-900">{selectedIncidentType}</Text>
                  <ChevronDown size={20} color="#6b7280" />
                </TouchableOpacity>
                {showIncidentTypeDropdown && (
                  <View className="mt-1 overflow-hidden rounded-xl border border-gray-300 bg-white">
                    {incidentTypes.map((type, index) => (
                      <TouchableOpacity
                        key={index}
                        className="border-b border-gray-100 px-4 py-3 last:border-b-0"
                        onPress={() => {
                          setSelectedIncidentType(type);
                          setShowIncidentTypeDropdown(false);
                        }}
                      >
                        <Text className="text-gray-900">{type}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Fish Count - only show for fish-related incidents */}
              {(selectedIncidentType === 'Cá chết' ||
                selectedIncidentType === 'Cá bệnh') && (
                <View>
                  <Text className="mb-2 font-medium text-gray-700">
                    Số lượng cá{' '}
                    {selectedIncidentType === 'Cá chết' ? 'chết' : 'bệnh'}
                  </Text>
                  <TextInput
                    placeholder="VD: 2"
                    value={fishCount}
                    onChangeText={setFishCount}
                    className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3"
                    keyboardType="numeric"
                  />
                </View>
              )}

              {/* Description */}
              <View>
                <Text className="mb-2 font-medium text-gray-700">
                  Mô tả chi tiết <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  placeholder="Mô tả tình trạng, nguyên nhân có thể, các biện pháp đã thực hiện..."
                  value={incidentDescription}
                  onChangeText={setIncidentDescription}
                  className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Action Buttons */}
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  onPress={() => setShowIncidentForm(false)}
                  className="flex-1 rounded-xl bg-gray-300 py-3"
                >
                  <Text className="text-center font-medium text-gray-700">
                    Hủy
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmitIncident}
                  className="flex-1 rounded-xl bg-red-500 py-3"
                >
                  <Text className="text-center font-medium text-white">
                    Báo cáo
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Recent Incidents */}
          <View className="mt-6 border-t border-gray-200 pt-4">
            <Text className="mb-3 font-medium text-gray-900">
              Sự cố gần đây
            </Text>
            <View className="flex-row items-start rounded-xl border border-yellow-200 bg-yellow-50 p-3">
              <AlertTriangle
                size={16}
                color="#f59e0b"
                className="mr-2 mt-0.5"
              />
              <View className="flex-1">
                <Text className="font-medium text-yellow-800">Cá chết</Text>
                <Text className="text-sm text-yellow-700">
                  2 cá Koi chết, nghi do nhiễm bệnh
                </Text>
                <Text className="mt-1 text-xs text-yellow-600">
                  3 giờ trước
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
