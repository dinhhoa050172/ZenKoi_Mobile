import { useRouter } from "expo-router";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Droplets,
  Eye,
  Thermometer
} from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

interface BreedingDetail {
  id: string;
  code: string;
  name: string;
  maleFish: string;
  femaleFish: string;
  pond: string;
  startDate: string;
  expectedDate: string;
  temperature: number;
  phLevel: number;
  eggCount: number;
  survivalRate: number;
  daysLeft: number;
  status:
    | "Đang ghép cặp"
    | "Ấp trứng"
    | "Nuôi cá bột"
    | "Tuyển chọn"
    | "Hủy ghép cặp";
  dailyProgress: {
    day: number;
    temperature: number;
    survival: number;
    notes: string;
  }[];
  fishData: {
    id: number;
    type: string;
    weight: number;
    length: number;
    health: string;
  }[];
}

export default function BreedingDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // State cho việc đóng/mở các tab
  const [expandedSections, setExpandedSections] = useState({
    ghepCapThanhCong: true,
    beeTrung: false,
    apTrung: false,
    nuoiCaBot: false,
    tuyenChon: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Mock data - in real app, fetch based on id
  const breedingDetail: BreedingDetail = {
    id: "1",
    code: "BC-001",
    name: "Sakura × Yuki",
    maleFish: "Kohaku",
    femaleFish: "Sanke",
    pond: "Hồ A",
    startDate: "15/03/2024",
    expectedDate: "05/04/2024",
    temperature: 22,
    phLevel: 7.2,
    eggCount: 1800,
    survivalRate: 85,
    daysLeft: 12,
  status: "Đang ghép cặp",
    dailyProgress: [
      {
        day: 1,
        temperature: 22,
        survival: 100,
        notes: "Bắt đầu quá trình ấp trứng",
      },
      {
        day: 3,
        temperature: 22,
        survival: 98,
        notes: "Phát hiện 2% trứng không phát triển",
      },
      {
        day: 7,
        temperature: 23,
        survival: 92,
        notes: "Trứng bắt đầu nở, tỷ lệ sống tốt",
      },
      {
        day: 10,
        temperature: 22,
        survival: 85,
        notes: "Cá con khỏe mạnh, ăn uống bình thường",
      },
    ],
    fishData: [
      { id: 1, type: "A", weight: 1500, length: 3500, health: "Tốt" },
      { id: 2, type: "B", weight: 2000, length: 4000, health: "Tốt" },
      { id: 3, type: "C", weight: 1800, length: 3800, health: "Trung bình" },
      { id: 4, type: "A", weight: 1600, length: 3600, health: "Tốt" },
      { id: 5, type: "B", weight: 2200, length: 4200, health: "Tốt" },
      { id: 6, type: "C", weight: 1900, length: 3700, health: "Kém" },
    ],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đang ghép cặp":
        return "#3b82f6";
      case "Ấp trứng":
        return "#f59e0b";
      case "Nuôi cá bột":
        return "#10b981";
      case "Tuyển chọn":
        return "#6366f1";
      case "Hủy ghép cặp":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: string) => {
    // Return Vietnamese status label as-is
    return status;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity
          className="mr-3"
          onPress={() => router.push("/breeding")}
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900 flex-1">
          Chi tiết chu kỳ sinh sản
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Basic Info Card */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin cơ bản
          </Text>

          {/* Info Grid - 2 columns */}
          <View className="flex-row flex-wrap">
            {/* Left Column */}
            <View className="w-1/2 pr-4">
              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-1">Mã chu kỳ:</Text>
                <Text className="text-base font-medium text-gray-900">
                  {breedingDetail.code}
                </Text>
              </View>

              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-1">Cá đực:</Text>
                <Text className="text-base font-medium text-gray-900">
                  {breedingDetail.maleFish}
                </Text>
              </View>

              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-1">Bể nuôi:</Text>
                <Text className="text-base font-medium text-gray-900">
                  {breedingDetail.pond}
                </Text>
              </View>
            </View>

            {/* Right Column */}
            <View className="w-1/2 pl-4">
              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-1">Trạng thái:</Text>
                <View
                  className="px-3 py-1 rounded-full self-start"
                  style={{
                    backgroundColor:
                      getStatusColor(breedingDetail.status) + "20",
                  }}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{ color: getStatusColor(breedingDetail.status) }}
                  >
                    {getStatusText(breedingDetail.status)}
                  </Text>
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-1">Cá cái:</Text>
                <Text className="text-base font-medium text-gray-900">
                  {breedingDetail.femaleFish}
                </Text>
              </View>

              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-1">
                  Ngày bắt đầu:
                </Text>
                <Text className="text-base font-medium text-gray-900">
                  {breedingDetail.startDate}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Current Stats */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Tình trạng hồ hiện tại
          </Text>

          <View className="flex-row flex-wrap">
            <View className="w-1/2 mb-4">
              <View className="flex-row items-center mb-1">
                <Thermometer size={16} color="#6b7280" />
                <Text className="text-xs text-gray-500 ml-1">Nhiệt độ</Text>
              </View>
              <Text className="text-lg font-bold text-gray-900">
                {breedingDetail.temperature}°C
              </Text>
            </View>

            <View className="w-1/2 mb-4">
              <View className="flex-row items-center mb-1">
                <Droplets size={16} color="#6b7280" />
                <Text className="text-xs text-gray-500 ml-1">Độ pH</Text>
              </View>
              <Text className="text-lg font-bold text-gray-900">
                {breedingDetail.phLevel}
              </Text>
            </View>

            <View className="w-1/2 mb-4">
              <Text className="text-xs text-gray-500">Số trứng</Text>
              <Text className="text-lg font-bold text-gray-900">
                {breedingDetail.eggCount.toLocaleString()}
              </Text>
            </View>

            <View className="w-1/2 mb-4">
              <Text className="text-xs text-gray-500">Tỷ lệ sống</Text>
              <Text className="text-lg font-bold text-gray-900">
                {breedingDetail.survivalRate}%
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="mt-2">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-600">Tiến độ sinh sản</Text>
              <Text className="text-sm font-medium text-gray-900">
                {Math.round(((21 - breedingDetail.daysLeft) / 21) * 100)}%
              </Text>
            </View>
            <View className="h-3 bg-gray-200 rounded-full">
              <View
                className="h-3 rounded-full"
                style={{
                  backgroundColor: "#10b981",
                  width: `${((21 - breedingDetail.daysLeft) / 21) * 100}%`,
                }}
              />
            </View>
            <Text className="text-xs text-gray-500 mt-1">
              Còn lại {breedingDetail.daysLeft} ngày
            </Text>
          </View>
        </View>

        {/* Breeding Progress Sections */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Tiến trình sinh sản
          </Text>

          {/* Ghép cặp thành công */}
          <View className="mb-4">
            <TouchableOpacity
              className="flex-row items-center justify-between py-2"
              onPress={() => toggleSection("ghepCapThanhCong")}
            >
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-green-500 rounded-full mr-3" />
                <Text className="text-base font-medium text-gray-900">
                  Ghép cặp thành công
                </Text>
              </View>
              {expandedSections.ghepCapThanhCong ? (
                <ChevronDown size={20} color="#6b7280" />
              ) : (
                <ChevronRight size={20} color="#6b7280" />
              )}
            </TouchableOpacity>

            {expandedSections.ghepCapThanhCong && (
              <View>
                <View className="ml-6 mt-2 pl-3 border-l border-gray-200 mb-1">
                  <Text className="text-sm text-gray-600 mb-1">
                    15/03/2024 - Hoàn thành
                  </Text>
                </View>
                <View>
                  <Text className="text-md text-black font-medium">
                    Ghép cặp thành công
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Đẻ trứng */}
          <View className="mb-4">
            <TouchableOpacity
              className="flex-row items-center justify-between py-2"
              onPress={() => toggleSection("beeTrung")}
            >
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-green-500 rounded-full mr-3" />
                <Text className="text-base font-medium text-gray-900">
                  Đẻ trứng
                </Text>
              </View>
              {expandedSections.beeTrung ? (
                <ChevronDown size={20} color="#6b7280" />
              ) : (
                <ChevronRight size={20} color="#6b7280" />
              )}
            </TouchableOpacity>

            {expandedSections.beeTrung && (
              <View>
                <View className="ml-6 mt-2 pl-3 border-l border-gray-200 mb-1">
                  <Text className="text-sm text-gray-600 mb-1">
                    22/03/2024 - Hoàn thành
                  </Text>
                </View>
                <View>
                  <Text className="text-md text-black font-medium mb-2">
                    Thông tin đẻ trứng
                  </Text>
                  <Text className="text-sm text-black">
                    Số trứng: 2000 trứng
                  </Text>
                  <Text className="text-sm text-black">
                    Tỷ lệ thu tinh: 85%
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Ấp trứng */}
          <View className="mb-4">
            <TouchableOpacity
              className="flex-row items-center justify-between py-2"
              onPress={() => toggleSection("apTrung")}
            >
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-green-500 rounded-full mr-3" />
                <Text className="text-base font-medium text-gray-900">
                  Ấp trứng
                </Text>
              </View>
              {expandedSections.apTrung ? (
                <ChevronDown size={20} color="#6b7280" />
              ) : (
                <ChevronRight size={20} color="#6b7280" />
              )}
            </TouchableOpacity>

            {expandedSections.apTrung && (
              <View>
                <View className="ml-6 mt-2 pl-3 border-l border-gray-200 mb-1">
                  <Text className="text-sm text-gray-600 mb-1">
                    05/04/2024 - Hoàn thành
                  </Text>
                </View>
                <View>
                  <Text className="text-md text-black font-medium mb-2">
                    Thông tin ấp trứng
                  </Text>
                  <Text className="text-sm text-black">Cá bột: 1800 con</Text>
                  <Text className="text-sm text-black">Tỷ lệ sống: 72%</Text>
                  <Text className="text-sm text-black mb-3">
                    Thời gian: 14 ngày
                  </Text>

                  {/* Theo dõi hàng ngày */}
                  <Text className="text-md text-black font-medium mb-2">
                    Theo dõi hàng ngày
                  </Text>
                  <View className="space-y-2">
                    <View className="flex-row items-center">
                      <Text className="text-xs text-gray-600 w-12 text-center">
                        Ngày
                      </Text>
                      <Text className="text-xs text-gray-600 flex-1 text-center">
                        Trong khỏe
                      </Text>
                      <Text className="text-xs text-gray-600 flex-1 text-center">
                        Trứng nở
                      </Text>
                      <Text className="text-xs text-gray-600 flex-1 text-center">
                        Trứng chết
                      </Text>
                    </View>
                    {[1, 2, 3, 4, 5].map((day) => (
                      <View key={day} className="flex-row items-center py-1">
                        <Text className="text-xs text-gray-900 w-12 text-center">
                          {day}
                        </Text>
                        <Text className="text-xs text-gray-900 flex-1 text-center">
                          2000
                        </Text>
                        <Text className="text-xs text-gray-900 flex-1 text-center">
                          2000
                        </Text>
                        <Text className="text-xs text-gray-900 flex-1 text-center">
                          2000
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View className="mt-3">
                    <Text className="text-sm text-black">
                      Điều kiện môi trường ấp trứng:
                    </Text>
                    <Text className="text-sm text-black">
                      Nhiệt độ: 22-24°C, pH: 10-15
                    </Text>
                    <Text className="text-sm text-black">
                      Oxy hòa tan: 6-8 mg/L
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Nuôi cá bột */}
          <View className="mb-4">
            <TouchableOpacity
              className="flex-row items-center justify-between py-2"
              onPress={() => toggleSection("nuoiCaBot")}
            >
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-green-500 rounded-full mr-3" />
                <Text className="text-base font-medium text-gray-900">
                  Nuôi cá bột
                </Text>
              </View>
              {expandedSections.nuoiCaBot ? (
                <ChevronDown size={20} color="#6b7280" />
              ) : (
                <ChevronRight size={20} color="#6b7280" />
              )}
            </TouchableOpacity>

            {expandedSections.nuoiCaBot && (
              <View>
                <View className="ml-6 mt-2 pl-3 border-l border-gray-200 mb-1">
                  <Text className="text-sm text-gray-600 mb-1">
                    20/05/2024 - Hoàn thành
                  </Text>
                </View>
                <View>
                  <Text className="text-md text-black font-medium mb-2">
                    Tỷ lệ sống theo thời gian
                  </Text>

                  <View className="flex-row my-2">
                    <Text className="text-sm font-medium text-red-500 flex-1 text-center">
                      7 ngày
                    </Text>
                    <Text className="text-sm font-medium text-orange-500 flex-1 text-center">
                      15 ngày
                    </Text>
                    <Text className="text-sm font-medium text-yellow-500 flex-1 text-center">
                      30 ngày
                    </Text>
                    <Text className="text-sm font-medium text-blue-500 flex-1 text-center">
                      Hiện tại
                    </Text>
                  </View>
                  <View className="flex-row">
                    <Text className="text-sm text-gray-900 flex-1 text-center">
                      92%
                    </Text>
                    <Text className="text-sm text-gray-900 flex-1 text-center">
                      85%
                    </Text>
                    <Text className="text-sm text-gray-900 flex-1 text-center">
                      78%
                    </Text>
                    <Text className="text-sm text-gray-900 flex-1 text-center">
                      72%
                    </Text>
                  </View>

                  <View className="mt-3">
                    <Text className="text-sm text-black">
                      Điều kiện môi trường nuôi:
                    </Text>
                    <Text className="text-sm text-black">
                      Nhiệt độ: 20-24°C, pH: 70-75
                    </Text>
                    <Text className="text-sm text-black">
                      Oxy hòa tan: 6-8 mg/L
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Tuyển chọn */}
          <View className="mb-4">
            <TouchableOpacity
              className="flex-row items-center justify-between py-2"
              onPress={() => toggleSection("tuyenChon")}
            >
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-green-500 rounded-full mr-3" />
                <Text className="text-base font-medium text-gray-900">
                  Tuyển chọn
                </Text>
              </View>
              {expandedSections.tuyenChon ? (
                <ChevronDown size={20} color="#6b7280" />
              ) : (
                <ChevronRight size={20} color="#6b7280" />
              )}
            </TouchableOpacity>

            {expandedSections.tuyenChon && (
              <View>
                <View className="ml-6 mt-2 pl-3 border-l border-gray-200 mb-1">
                  <Text className="text-sm text-gray-600 mb-1">
                    14 ngày - Hoàn thành
                  </Text>
                </View>
                <View>
                  <Text className="text-md text-black font-medium mb-2">
                    Hiệu quả tuyển chọn
                  </Text>

                  {/* Table header */}
                  <View className="flex-row bg-gray-50 p-2 rounded mb-1">
                    <Text className="text-xs font-medium text-gray-600 flex-1 text-center">
                      Lần
                    </Text>
                    <Text className="text-xs font-medium text-gray-600 flex-1 text-center">
                      Show
                    </Text>
                    <Text className="text-xs font-medium text-gray-600 flex-1 text-center">
                      High
                    </Text>
                    <Text className="text-xs font-medium text-gray-600 flex-1 text-center">
                      Pond
                    </Text>
                    <Text className="text-xs font-medium text-gray-600 flex-1 text-center">
                      Cull
                    </Text>
                  </View>

                  {/* Table rows */}
                  {[
                    { lan: 1, show: 0, high: 0, pond: 2000, cull: 3000 },
                    { lan: 2, show: 0, high: 0, pond: 3000, cull: 3000 },
                    { lan: 3, show: 0, high: 500, pond: 1000, cull: 4000 },
                    { lan: 4, show: 100, high: 3900, pond: 0, cull: 4000 },
                  ].map((row, index) => (
                    <View
                      key={index}
                      className="flex-row py-1 border-b border-gray-100"
                    >
                      <Text className="text-xs text-gray-900 flex-1 text-center">
                        {row.lan}
                      </Text>
                      <Text className="text-xs text-gray-900 flex-1 text-center">
                        {row.show}
                      </Text>
                      <Text className="text-xs text-gray-900 flex-1 text-center">
                        {row.high}
                      </Text>
                      <Text className="text-xs text-gray-900 flex-1 text-center">
                        {row.pond}
                      </Text>
                      <Text className="text-xs text-gray-900 flex-1 text-center">
                        {row.cull}
                      </Text>
                    </View>
                  ))}

                  <View className="flex-row justify-center mt-3 space-x-3">
                    <Text className="text-sm text-black mr-4 mt-1">
                      Danh sách định danh
                    </Text>
                    <TouchableOpacity 
                      className="flex-row items-center border border-gray-300 rounded-lg px-3 py-1"
                      onPress={() => router.push(`/breeding/fish-list?from=breeding-detail&breedingId=${breedingDetail.id}`)}
                    >
                      <Eye size={16} color="black" />
                      <Text className="text-sm text-black ml-1">
                        Xem chi tiết
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
