import PondSvg from "@/components/icons/PondSvg";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
} from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

interface Task {
  id: string;
  title: string;
  tankNumber: string;
  location: string;
  time: string;
  status: "completed" | "pending";
}

export default function TasksScreen() {
  const today = new Date().getDate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const insets = useSafeAreaInsets();

  // Day names in Vietnamese
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  // Get current date info
  const getCurrentDateInfo = () => {
    const currentDate = new Date();
    const dayOfWeek = dayNames[currentDate.getDay()];
    const month = monthNames[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    return { dayOfWeek, month, year };
  };

  const { dayOfWeek, month, year } = getCurrentDateInfo();

  // Generate calendar days based on week offset
  const generateCalendarDays = () => {
    const days = [];
    const currentDate = new Date();
    const startDate = new Date(currentDate);
    startDate.setDate(today - 3 + weekOffset * 7);

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + i);
      days.push({
        day: dayDate.getDate(),
        month: dayDate.getMonth(),
        year: dayDate.getFullYear(),
        fullDate: dayDate,
      });
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

  // Get week date range
  const getWeekDateRange = () => {
    const days = generateCalendarDays();
    if (days.length === 0) return "";

    const formatDate = (date: Date) => {
      return `${date.getDate()}/${date.getMonth() + 1}`;
    };

    return `${formatDate(days[0].fullDate)} - ${formatDate(days[6].fullDate)}`;
  };

  // Get day of week for a specific date
  const getDayOfWeek = (date: Date) => {
    return dayNames[date.getDay()];
  };

  const handlePreviousWeek = () => {
    setWeekOffset(weekOffset - 1);
  };

  const handleNextWeek = () => {
    setWeekOffset(weekOffset + 1);
  };

  const handleDayPress = (dayInfo: {
    day: number;
    month: number;
    year: number;
    fullDate: Date;
  }) => {
    setSelectedDate(dayInfo.fullDate);
  };

  const morningTasks: Task[] = [
    {
      id: "1",
      title: "Kiểm tra hồ",
      tankNumber: "Bể số 1",
      location: "khu vực A",
      time: "7:30",
      status: "completed",
    },
  ];

  const eveningTasks: Task[] = [
    {
      id: "2",
      title: "Cho cá ăn",
      tankNumber: "Bể số 2",
      location: "khu vực B",
      time: "14:30",
      status: "pending",
    },
    {
      id: "3",
      title: "Cho cá ăn",
      tankNumber: "Bể số 3",
      location: "khu vực B",
      time: "16:30",
      status: "pending",
    },
  ];

  const TaskCard = ({
    task,
    isCompleted,
  }: {
    task: Task;
    isCompleted: boolean;
  }) => (
    <TouchableOpacity
      className={`rounded-xl p-4 mb-3 ${isCompleted ? "bg-green-100" : "bg-white"} shadow-sm border border-gray-100`}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text
          className={`font-semibold ${isCompleted ? "text-green-800" : "text-gray-900"}`}
        >
          {task.title}
        </Text>
        {isCompleted && <CheckCircle size={20} color="#059669" />}
      </View>
      <View className="flex-row items-center">
        <PondSvg size={14} color={isCompleted ? "#059669" : "#6b7280"} />
        <Text
          className={`text-sm mb-1 ml-1 ${isCompleted ? "text-green-700" : "text-gray-600"}`}
        >
          {task.tankNumber}
        </Text>
      </View>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <MapPin size={14} color={isCompleted ? "#059669" : "#6b7280"} />
          <Text
            className={`text-sm ml-1 ${isCompleted ? "text-green-700" : "text-gray-500"}`}
          >
            Vị trí: {task.location}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Clock size={14} color={isCompleted ? "#059669" : "#6b7280"} />
          <Text
            className={`text-sm ml-1 ${isCompleted ? "text-green-700" : "text-gray-500"}`}
          >
            {task.time}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="p-4">
          {/* Header with Date */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center space-x-4">
              <Text className="text-5xl font-bold text-gray-900 mr-2">
                {today}
              </Text>
              <View className="flex-col space-x-2">
                <Text className="text-md text-gray-500">{dayOfWeek}</Text>
                <Text className="text-md text-gray-500">
                  {month} {year}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              className="bg-green-100 px-3 py-1 rounded-lg"
              onPress={() => {
                setSelectedDate(new Date());
                setWeekOffset(0);
              }}
            >
              <Text className="text-green-600 font-medium text-lg">
                Hôm nay
              </Text>
            </TouchableOpacity>
          </View>

          {/* Calendar Navigation */}
          <View className="flex-row items-center justify-between mb-2">
            <TouchableOpacity
              onPress={handlePreviousWeek}
              className="bg-white rounded-full p-2 shadow-sm border border-gray-200"
            >
              <ChevronLeft size={20} color="#6b7280" />
            </TouchableOpacity>

            <View className="items-center">
              <Text className="text-lg font-semibold text-gray-700">
                {getWeekDateRange()}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleNextWeek}
              className="bg-white rounded-full p-2 shadow-sm border border-gray-200"
            >
              <ChevronRight size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Calendar Days */}
          <View className="flex-row justify-between mb-6">
            {calendarDays.map((dayInfo, index) => {
              const isSelected =
                dayInfo.fullDate.toDateString() === selectedDate.toDateString();
              return (
                <TouchableOpacity
                  key={`${dayInfo.day}-${dayInfo.month}-${dayInfo.year}`}
                  onPress={() => handleDayPress(dayInfo)}
                  className="items-center"
                >
                  <View
                    className="w-10 h-10 items-center justify-center"
                    style={{
                      borderRadius: 20,
                      backgroundColor: isSelected ? "#0A3D62" : "transparent",
                      overflow: "hidden",
                    }}
                  >
                    <Text
                      className={`font-medium ${
                        isSelected ? "text-white" : "text-gray-600"
                      }`}
                    >
                      {dayInfo.day}
                    </Text>
                  </View>
                  <Text
                    className={`text-xs mt-1 ${
                      isSelected ? "text-[#0A3D62]" : "text-gray-400"
                    }`}
                  >
                    {getDayOfWeek(dayInfo.fullDate)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Morning Tasks */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Ca sáng
            </Text>
            {morningTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isCompleted={task.status === "completed"}
              />
            ))}
          </View>

          {/* Evening Tasks */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Ca chiều
            </Text>
            {eveningTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isCompleted={task.status === "completed"}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
