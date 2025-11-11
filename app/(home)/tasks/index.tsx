import Loading from '@/components/Loading';
import TaskCard from '@/components/tasks/TaskCard';
import TaskCompletionModal from '@/components/tasks/TaskCompletionModal';
import { useGetWorkSchedulesBySelf } from '@/hooks/useWorkSchedule';
import {
  WorkSchedule,
  WorkScheduleStatus,
} from '@/lib/api/services/fetchWorkSchedule';
import { useAuthStore } from '@/lib/store/authStore';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

export default function TasksScreen() {
  const today = new Date().getDate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedTask, setSelectedTask] = useState<WorkSchedule | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  // Get user from auth store
  const { user } = useAuthStore();
  const staffId = user?.id ? Number(user.id) : 0;

  // Calculate week range for fetching data
  const getWeekRange = (weekOffset: number) => {
    const currentDate = new Date();
    const startDate = new Date(currentDate);
    startDate.setDate(today - 3 + weekOffset * 7);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    return {
      from: startDate.toISOString().split('T')[0],
      to: endDate.toISOString().split('T')[0],
    };
  };

  const weekRange = getWeekRange(weekOffset);

  // Fetch work schedules for the entire week
  const {
    data: workScheduleData,
    isLoading,
    error,
    refetch,
  } = useGetWorkSchedulesBySelf(
    true, // enabled
    {
      scheduledDateFrom: weekRange.from,
      scheduledDateTo: weekRange.to,
    }
  );

  // Day names in Vietnamese
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const monthNames = [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ];

  // Filter tasks for selected date and group by time periods
  const selectedDateString = selectedDate.toISOString().split('T')[0];
  const workSchedules = workScheduleData?.result || [];

  // Filter tasks for the selected date only
  const todayTasks = workSchedules.filter((schedule) => {
    // Handle both date formats: "2025-11-13" or "2025-11-13T00:00:00"
    const scheduleDate = schedule.scheduledDate.includes('T')
      ? schedule.scheduledDate.split('T')[0]
      : schedule.scheduledDate;
    return scheduleDate === selectedDateString;
  });

  const morningTasks = todayTasks.filter((schedule) => {
    const startHour = parseInt(schedule.startTime.split(':')[0]);
    return startHour < 12;
  });

  const eveningTasks = todayTasks.filter((schedule) => {
    const startHour = parseInt(schedule.startTime.split(':')[0]);
    return startHour >= 12;
  });

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
    if (days.length === 0) return '';

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
    // Data will be refetched automatically due to weekOffset change
  };

  const handleNextWeek = () => {
    setWeekOffset(weekOffset + 1);
    // Data will be refetched automatically due to weekOffset change
  };

  const handleDayPress = (dayInfo: {
    day: number;
    month: number;
    year: number;
    fullDate: Date;
  }) => {
    setSelectedDate(dayInfo.fullDate);
  };

  // Handle task press - open completion modal
  const handleTaskPress = (task: WorkSchedule) => {
    // Only allow completion if task is pending or in progress
    if (
      task.status === WorkScheduleStatus.PENDING ||
      task.status === WorkScheduleStatus.IN_PROGRESS
    ) {
      setSelectedTask(task);
      setIsModalVisible(true);
    } else {
      Alert.alert(
        'Thông báo',
        `Nhiệm vụ này đã ${task.status === WorkScheduleStatus.COMPLETED ? 'hoàn thành' : 'được xử lý'}.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedTask(null);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Loading />
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center p-4">
          <Text className="mb-2 text-lg font-medium text-gray-900">
            Không thể tải công việc
          </Text>
          <Text className="mb-4 text-center text-gray-600">
            {error instanceof Error ? error.message : 'Đã xảy ra lỗi'}
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="flex-row items-center rounded-lg bg-blue-600 px-6 py-3"
          >
            <RefreshCw size={18} color="white" />
            <Text className="ml-2 font-medium text-white">Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show authentication required
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center p-4">
          <Text className="mb-2 text-lg font-medium text-gray-900">
            Cần đăng nhập
          </Text>
          <Text className="text-center text-gray-600">
            Vui lòng đăng nhập để xem công việc của bạn.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#0A3D62']}
            tintColor="#0A3D62"
          />
        }
      >
        <View className="p-4">
          {/* Header with Date */}
          <View className="mb-6 flex-row items-center justify-between">
            <View className="flex-row items-center space-x-4">
              <Text className="mr-2 text-5xl font-bold text-gray-900">
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
              className="rounded-lg bg-green-100 px-3 py-1"
              onPress={() => {
                setSelectedDate(new Date());
                setWeekOffset(0);
              }}
            >
              <Text className="text-lg font-medium text-green-600">
                Hôm nay
              </Text>
            </TouchableOpacity>
          </View>

          {/* Calendar Navigation */}
          <View className="mb-2 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={handlePreviousWeek}
              className="rounded-full border border-gray-200 bg-white p-2 shadow-sm"
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
              className="rounded-full border border-gray-200 bg-white p-2 shadow-sm"
            >
              <ChevronRight size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Calendar Days */}
          <View className="mb-6 flex-row justify-between">
            {calendarDays.map((dayInfo, index) => {
              const isSelected =
                dayInfo.fullDate.toDateString() === selectedDate.toDateString();

              // Count tasks for this day
              const dayDateString = dayInfo.fullDate
                .toISOString()
                .split('T')[0];
              const dayTaskCount = workSchedules.filter((schedule) => {
                // Handle both date formats: "2025-11-13" or "2025-11-13T00:00:00"
                const scheduleDate = schedule.scheduledDate.includes('T')
                  ? schedule.scheduledDate.split('T')[0]
                  : schedule.scheduledDate;
                return scheduleDate === dayDateString;
              }).length;

              return (
                <TouchableOpacity
                  key={`${dayInfo.day}-${dayInfo.month}-${dayInfo.year}`}
                  onPress={() => handleDayPress(dayInfo)}
                  className="relative items-center"
                >
                  <View
                    className="relative h-10 w-10 items-center justify-center"
                    style={{
                      borderRadius: 20,
                      backgroundColor: isSelected ? '#0A3D62' : 'transparent',
                      overflow: 'hidden',
                    }}
                  >
                    <Text
                      className={`font-medium ${
                        isSelected ? 'text-white' : 'text-gray-600'
                      }`}
                    >
                      {dayInfo.day}
                    </Text>

                    {/* Task count indicator */}
                    {dayTaskCount > 0 && (
                      <View
                        className="absolute -right-1 -top-1 h-4 min-w-4 items-center justify-center rounded-full bg-red-500"
                        style={{ minWidth: 16 }}
                      >
                        <Text className="text-xs font-bold text-white">
                          {dayTaskCount}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    className={`mt-1 text-xs ${
                      isSelected ? 'text-[#0A3D62]' : 'text-gray-400'
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
            <Text className="mb-3 text-lg font-semibold text-gray-900">
              Ca sáng ({morningTasks.length})
            </Text>
            {morningTasks.length > 0 ? (
              morningTasks.map((task) => (
                <TaskCard key={task.id} task={task} onPress={handleTaskPress} />
              ))
            ) : (
              <View className="mb-3 rounded-xl border border-gray-100 bg-white p-6">
                <Text className="text-center text-gray-500">
                  Không có công việc nào trong ca sáng
                </Text>
              </View>
            )}
          </View>

          {/* Evening Tasks */}
          <View>
            <Text className="mb-3 text-lg font-semibold text-gray-900">
              Ca chiều ({eveningTasks.length})
            </Text>
            {eveningTasks.length > 0 ? (
              eveningTasks.map((task) => (
                <TaskCard key={task.id} task={task} onPress={handleTaskPress} />
              ))
            ) : (
              <View className="mb-3 rounded-xl border border-gray-100 bg-white p-6">
                <Text className="text-center text-gray-500">
                  Không có công việc nào trong ca chiều
                </Text>
              </View>
            )}
          </View>
        </View>
      </KeyboardAwareScrollView>

      {/* Task Completion Modal */}
      <TaskCompletionModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        task={selectedTask}
        staffId={staffId}
      />
    </SafeAreaView>
  );
}
