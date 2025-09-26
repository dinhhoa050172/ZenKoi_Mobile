import { router } from "expo-router";
import { ChevronDown, Plus, Search, Settings } from "lucide-react-native";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

interface PondData {
  id: string;
  name: string;
  area: string;
  volume: string;
  status: "healthy" | "warning" | "critical";
  temperature: string;
  ph: string;
  lastCheck: string;
  fishCount: number;
  errorCount: number;
}

export default function PondManagementScreen() {
  const insets = useSafeAreaInsets();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedPondType, setSelectedPondType] = useState("");
  const [selectedFishType, setSelectedFishType] = useState("");
  const [showPondTypeDropdown, setShowPondTypeDropdown] = useState(false);
  const [showFishTypeDropdown, setShowFishTypeDropdown] = useState(false);

  const pondTypes = ["Giao phối", "Cá bột", "Ấp trứng", "Nuôi"];
  const fishTypes = ["Show", "High", "Pond"];

  const pondData: PondData[] = [
    {
      id: "1",
      name: "Hồ số 1",
      area: "Khu vực A",
      volume: "5.000 L",
      status: "warning",
      temperature: "24°C",
      ph: "7.2",
      lastCheck: "2025-09-24 07:30",
      fishCount: 25,
      errorCount: 0,
    },
    {
      id: "2",
      name: "Hồ số 2",
      area: "Khu vực B",
      volume: "8.000 L",
      status: "healthy",
      temperature: "25°C",
      ph: "7.0",
      lastCheck: "",
      fishCount: 40,
      errorCount: 0,
    },
    {
      id: "3",
      name: "Hồ số 3",
      area: "Khu vực C",
      volume: "3.500 L",
      status: "critical",
      temperature: "28°C",
      ph: "6.5",
      lastCheck: "",
      fishCount: 18,
      errorCount: 2,
    },
    {
      id: "4",
      name: "Hồ số 4",
      area: "Khu vực D",
      volume: "6.000 L",
      status: "healthy",
      temperature: "24°C",
      ph: "7.3",
      lastCheck: "",
      fishCount: 32,
      errorCount: 0,
    },
    {
      id: "5",
      name: "Hồ số 5",
      area: "Khu vực E",
      volume: "4.200 L",
      status: "warning",
      temperature: "23°C",
      ph: "7.8",
      lastCheck: "",
      fishCount: 22,
      errorCount: 0,
    },
  ];

  const getStatusText = (status: string) => {
    switch (status) {
      case "healthy":
        return "Ổn định";
      case "warning":
        return "Cần kiểm tra";
      case "critical":
        return "Cảnh báo";
      default:
        return "Không xác định";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="p-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-gray-900">
              Danh sách hồ cá
            </Text>
            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              className="bg-primary rounded-lg px-4 py-2"
            >
              <Plus size={16} color="white" />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View className="flex-row mb-4">
            <View className="flex-1 bg-white rounded-2xl p-4 mr-2 shadow-sm items-center">
              <Text className="text-2xl font-bold text-primary">5</Text>
              <Text className="text-gray-600 text-sm">Tổng hồ</Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-4 mx-1 shadow-sm items-center">
              <Text className="text-2xl font-bold text-green-600">2</Text>
              <Text className="text-gray-600 text-sm">Tình trạng tốt</Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-4 ml-2 shadow-sm items-center">
              <Text className="text-2xl font-bold text-red-600">6</Text>
              <Text className="text-gray-600 text-sm">Cảnh báo</Text>
            </View>
          </View>

          {/* Search */}
          <View className="mb-4">
            <View className="flex-row items-center bg-white rounded-2xl px-4 py-1 shadow-sm">
              <Search size={20} color="#9ca3af" />
              <TextInput
                placeholder="Tìm kiếm hồ cá..."
                value={searchText}
                onChangeText={setSearchText}
                className="flex-1 ml-3 text-gray-900"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          {/* Pond List */}
          <View>
            {pondData.map((pond) => (
              <View
                key={pond.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-3 relative overflow-hidden"
              >
                {/* Status Color Indicator */}
                <View
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    pond.status === "healthy"
                      ? "bg-green-500"
                      : pond.status === "warning"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                />

                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/(home)/water/[id]",
                      params: { id: pond.id },
                    })
                  }
                  className="p-4 pl-6"
                >
                  {/* Header Row */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center flex-1">
                      <View
                        className={`w-2 h-2 rounded-full mr-2 ${
                          pond.status === "healthy"
                            ? "bg-green-500"
                            : pond.status === "warning"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                      />
                      <Text className="font-semibold text-gray-900 text-base">
                        {pond.name}
                      </Text>
                    </View>
                    
                    <View className="flex-row items-center">
                      <View
                        className={`px-2 py-1 rounded-md ${
                          pond.status === "healthy"
                            ? "bg-green-50"
                            : pond.status === "warning"
                              ? "bg-yellow-50"
                              : "bg-red-50"
                        }`}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            pond.status === "healthy"
                              ? "text-green-700"
                              : pond.status === "warning"
                                ? "text-yellow-700"
                                : "text-red-700"
                          }`}
                        >
                          {pond.errorCount > 0 && `${pond.errorCount}`} {getStatusText(pond.status)}
                        </Text>
                      </View>
                      
                      <TouchableOpacity 
                        className="p-1 ml-2"
                        onPress={(e) => {
                          e.stopPropagation();
                          // TODO: Open edit pond parameters modal
                          console.log('Edit pond parameters for:', pond.id);
                        }}
                      >
                        <Settings size={16} color="#6b7280" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Main Info Row */}
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-1">
                      <Text className="text-gray-600 text-sm">{pond.area}</Text>
                      <Text className="text-gray-900 font-medium">
                        {pond.volume}
                      </Text>
                    </View>

                    <View className="flex-1">
                      <Text className="text-gray-600 text-sm">
                        Số lượng: {pond.fishCount} con
                      </Text>
                      <Text className="text-gray-900 font-medium">
                        pH {pond.ph} • {pond.temperature}
                      </Text>
                    </View>
                  </View>

                  {/* Status and Last Check Row */}
                  <View className="flex-row justify-between items-center">
                    <View>
                      <View
                        className={`px-2 py-1 rounded-2xl inline-block ${
                          pond.status === "healthy"
                            ? "bg-green-100"
                            : pond.status === "warning"
                              ? "bg-orange-100"
                              : "bg-red-100"
                        }`}
                      >
                        <Text
                          className={`text-xs ${
                            pond.status === "healthy"
                              ? "text-green-800"
                              : pond.status === "warning"
                                ? "text-orange-800"
                                : "text-red-800"
                          }`}
                        >
                          {pond.status === "healthy"
                            ? "Tốt"
                            : pond.status === "warning"
                              ? "Cảnh báo nhẹ"
                              : "Nguy hiểm"}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-1 items-end">
                      <Text className="text-gray-500 text-xs">
                        {pond.lastCheck
                          ? `Kiểm tra: ${pond.lastCheck.split(" ")[1]}`
                          : pond.status === "healthy"
                            ? "Kiểm tra: hôm qua"
                            : pond.status === "warning"
                              ? "Kiểm tra: 2 giờ trước"
                              : "Kiểm tra: 30 phút trước"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Add Pond Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-gray-50">
          <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text className="text-primary font-medium">Hủy</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold">Tạo hồ mới</Text>
            <TouchableOpacity>
              <Text className="text-primary font-medium">Lưu</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            <Text className="text-lg font-semibold mb-4">Thông tin cơ bản</Text>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">
                Tên hồ <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                placeholder="VD: Hồ số 1, Hồ chính..."
                className="bg-white border border-gray-300 rounded-2xl px-4 py-3"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">
                Loại hồ <Text className="text-red-500">*</Text>
              </Text>
              <TouchableOpacity 
                className="bg-white border border-gray-300 rounded-2xl px-4 py-3 flex-row items-center justify-between"
                onPress={() => setShowPondTypeDropdown(!showPondTypeDropdown)}
              >
                <Text className={selectedPondType ? "text-gray-900" : "text-gray-500"}>
                  {selectedPondType || "Chọn loại hồ"}
                </Text>
                <ChevronDown size={20} color="#6b7280" />
              </TouchableOpacity>
              {showPondTypeDropdown && (
                <View className="bg-white border border-gray-300 rounded-2xl mt-1 overflow-hidden">
                  {pondTypes.map((type, index) => (
                    <TouchableOpacity
                      key={index}
                      className="px-4 py-3 border-b border-gray-100 last:border-b-0"
                      onPress={() => {
                        setSelectedPondType(type);
                        setShowPondTypeDropdown(false);
                      }}
                    >
                      <Text className="text-gray-900">{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">
                Mật độ (kg/m3) <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                placeholder="VD: 5"
                className="bg-white border border-gray-300 rounded-2xl px-4 py-3"
                keyboardType="numeric"
                inputMode="numeric"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">
                Dung tích (L) <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                placeholder="VD: 5000"
                className="bg-white border border-gray-300 rounded-2xl px-4 py-3"
                keyboardType="numeric"
                inputMode="numeric"
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-2">
                Loại cá <Text className="text-red-500">*</Text>
              </Text>
              <TouchableOpacity 
                className="bg-white border border-gray-300 rounded-2xl px-4 py-3 flex-row items-center justify-between"
                onPress={() => setShowFishTypeDropdown(!showFishTypeDropdown)}
              >
                <Text className={selectedFishType ? "text-gray-900" : "text-gray-500"}>
                  {selectedFishType || "Chọn loại cá"}
                </Text>
                <ChevronDown size={20} color="#6b7280" />
              </TouchableOpacity>
              {showFishTypeDropdown && (
                <View className="bg-white border border-gray-300 rounded-2xl mt-1 overflow-hidden">
                  {fishTypes.map((type, index) => (
                    <TouchableOpacity
                      key={index}
                      className="px-4 py-3 border-b border-gray-100 last:border-b-0"
                      onPress={() => {
                        setSelectedFishType(type);
                        setShowFishTypeDropdown(false);
                      }}
                    >
                      <Text className="text-gray-900">{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-2">Mô tả</Text>
              <TextInput
                placeholder="Mô tả thêm về hồ..."
                className="bg-white border border-gray-300 rounded-2xl px-4 py-3"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Water Parameters Section */}
            <Text className="text-lg font-semibold mb-2">Thiết lập thông số nước ban đầu</Text>
            <Text className="text-gray-600 text-sm mb-4">
              Nhập các thông số nước hiện tại của bể (không bắt buộc, có thể bỏ trống và cập nhật sau)
            </Text>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">pH</Text>
              <TextInput
                placeholder="VD: 7.2"
                className="bg-white border border-gray-300 rounded-2xl px-4 py-3"
                keyboardType="decimal-pad"
                inputMode="decimal"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Nhiệt độ (°C)</Text>
              <TextInput
                placeholder="VD: 24"
                className="bg-white border border-gray-300 rounded-2xl px-4 py-3"
                keyboardType="decimal-pad"
                inputMode="decimal"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Oxy hòa tan (mg/L)</Text>
              <TextInput
                placeholder="VD: 8.5"
                className="bg-white border border-gray-300 rounded-2xl px-4 py-3"
                keyboardType="decimal-pad"
                inputMode="decimal"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Ammonia (mg/L)</Text>
              <TextInput
                placeholder="VD: 0.2"
                className="bg-white border border-gray-300 rounded-2xl px-4 py-3"
                keyboardType="decimal-pad"
                inputMode="decimal"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Nitrite (mg/L)</Text>
              <TextInput
                placeholder="VD: 0.1"
                className="bg-white border border-gray-300 rounded-2xl px-4 py-3"
                keyboardType="decimal-pad"
                inputMode="decimal"
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-2">Nitrate (mg/L)</Text>
              <TextInput
                placeholder="VD: 20"
                className="bg-white border border-gray-300 rounded-2xl px-4 py-3"
                keyboardType="decimal-pad"
                inputMode="decimal"
              />
            </View>

            <TouchableOpacity className="bg-primary rounded-2xl py-4 mb-8">
              <Text className="text-white text-center font-semibold text-lg">
                Tạo hồ
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
