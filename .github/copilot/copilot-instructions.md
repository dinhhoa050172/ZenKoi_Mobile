# ZenKoi Mobile - Copilot Instructions

## Project Overview 🐟

**SmartKoiBreeder** - Farm Staff Mobile Application for Koi farm breeding and management system

- **Framework:** React Native with Expo Router (file-based routing)
- **Language:** TypeScript (strict mode)
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **State:** Zustand + TanStack Query for server state
- **Authentication:** JWT with refresh tokens, stored in Expo SecureStore

## Architecture Patterns

### File-Based Routing (Expo Router)

```
app/
├── _layout.tsx              # Root provider setup (auth, query client, keyboard)
├── (auth)/                  # Auth group - login/register flows
│   ├── _layout.tsx         # Auth-specific layout
│   ├── login/              # Login screens with nested routes
│   └── register/           # Register screens
└── (home)/                 # Main app group - bottom tabs navigation
    ├── _layout.tsx         # Tab navigator with custom curved design
    ├── index.tsx           # Home dashboard
    ├── profile.tsx         # Profile screen
    ├── koi/                # Koi management module
    │   ├── index.tsx       # List view (visible tab)
    │   ├── [id].tsx        # Detail view (hidden from tabs)
    │   └── add/            # Create flow
    ├── breeding/           # Breeding process management
    ├── incidents/          # Incident reporting system
    ├── water/              # Water parameter monitoring
    └── tasks/              # Task management
```

**Route Visibility Pattern:** Use `href: null` in `_layout.tsx` to hide routes from tab navigation while keeping them accessible via navigation.

### API Service Architecture

**Core Pattern:** Service + Hook + Component

```typescript
// lib/api/services/fetchKoi.ts - Service layer
export interface Koi { id: number; name: string; /* ... */ }
export const koiServices = {
  getKois: async (filters?: KoiSearchParams): Promise<KoiListResponse> => {...},
  getKoiById: async (id: number): Promise<KoiResponse> => {...}
}

// hooks/useKoi.ts - Hook layer
export const useGetKois = (filters?: KoiSearchParams) =>
  useQuery({ queryKey: ['kois', filters], queryFn: () => koiServices.getKois(filters) })

// Component usage
const { data: kois, isLoading } = useGetKois({ search: 'keyword' })
```

**Service Response Pattern:** All API responses follow consistent structure:

```typescript
interface ApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: T;
}
```

### Authentication Flow

**Initialization:** `app/_layout.tsx` handles auth check on startup:

1. Load token from SecureStore → Set in API client headers
2. Fetch user profile via `userServices.getMe()`
3. Navigate to `/(home)` or `/(auth)/login` based on auth state

**Token Management:** Automatic refresh in `apiClient.ts` with request queuing:

- 401 errors trigger `renewAccessToken()` from authStore
- Failed requests queued and replayed with new token
- Refresh failure = automatic logout + redirect

### State Management Patterns

**Global State (Zustand):**

```typescript
// lib/store/authStore.ts - Single auth store
interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (token: string | Token, user?: AuthUser) => Promise<void>;
  logout: (refreshToken: string) => Promise<void>;
}
```

**Server State (TanStack Query):** All data fetching through custom hooks

```typescript
// Pattern: useGetX for queries, useCreateX/useUpdateX for mutations
export const useGetIncidents = (
  enabled: boolean,
  filters?: IncidentSearchParams
) =>
  useQuery({
    queryKey: ['incidents', filters],
    queryFn: () => incidentServices.getIncidents(filters),
    enabled,
  });
```

## UI/UX Conventions

### Styling System

- **NativeWind:** Use `className` syntax - `className="flex-1 bg-white p-4"`
- **Custom Colors:** Primary `#0A3D62`, gradients with `expo-linear-gradient`
- **Icons:** `lucide-react-native` for consistent iconography

### Screen Layout Pattern

```typescript
export default function ScreenName() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1d4ed8" />
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#f8fafc' }}>
        {/* Gradient Header */}
        <LinearGradient colors={['#3b82f6', '#1d4ed8']} className="px-6 pb-8 pt-4">
          <Text className="text-3xl font-bold text-white">Screen Title</Text>
        </LinearGradient>

        {/* Content */}
        <FlatList
          data={data}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        />
      </SafeAreaView>
    </>
  )
}
```

### Loading & Error Handling

- **Loading:** Use `<Loading />` component from `components/Loading.tsx`
- **Toast:** `react-native-toast-message` for user feedback
- **Empty States:** Custom empty state with gradients and call-to-action buttons

---

## Quy tắc Bắt buộc

1.  **Luôn phản hồi bằng tiếng Việt** trong mọi trao đổi.
2.  **Tuân thủ nghiêm ngặt các file detailed design** trong `.github/`. Mọi thay đổi về giao diện người dùng và luồng dữ liệu phải được phê duyệt.
3.  **Sử dụng TypeScript** cho tất cả code mới.
4.  **Sử dụng functional components và hooks.** Không sử dụng class components.
5.  **Ưu tiên trải nghiệm người dùng và hiệu năng.** Tối ưu hóa render và sử dụng các hook hợp lý.

---

## Kiến trúc Ứng dụng & Cấu trúc Thư mục

### Cấu trúc Thư mục

ZENKOI_MOBILE/
│
├── app/ # Quản lý các màn hình và định tuyến (Expo Router)
│ ├── (auth)/ # Màn hình xác thực (đăng nhập, đăng ký)
│ ├── (home)/ # Màn hình chính có Bottom Tab Navigator
│ │ ├── koi/ # Quản lý cá Koi (hồ sơ, RFID, quét mã)
│ │ │ └── components/ # Component riêng cho module
│ │ ├── breeding/ # Quản lý quy trình nhân giống
│ │ │ └── preparation/ # Giai đoạn chuẩn bị
│ │ │ ──├── index.tsx
│ │ │ ──└── [id].tsx
│ │ ├── scan/ # Quét mã RFID
│ │ ├── water/ # Giám sát hồ và môi trường của hồ
│ │ └── tasks/ # Quản lý công việc và lịch trình
│
├── components/ # Các component có thể tái sử dụng
│ ├── icons/ # Custom Icon
│ └── common/ # Components UI chung (Button, Input, Card)
│
├── hooks/ # Chứa các custom hooks để tái sử dụng logic
│
├── lib/ # Thư viện cốt lõi
│ ├── api/ # Quản lý tất cả các tương tác API
│ │ └── services/ # Các hàm gọi API với Axios (U)
│ │ │ └── fetchUser.ts # Hàm fetch API và interface liên quan (U)
│ │ └── apiClient.ts # Cấu hình/Client Axios (U)
│ └── store/ # Zustand stores để quản lý global state
│ │ └── authStore.ts # Store quản lý trạng thái xác thực (U)
│
└── utils/ # Các hàm tiện ích dùng chung

---

## Quy tắc Development

### 1. Data Fetching & State Management

- **Data Fetching:** Sử dụng **`@tanstack/react-query`** kết hợp với **`axios`** qua các custom hooks trong thư mục `hooks/`.
- **State Management:**
  - **Global State:** Sử dụng **`zustand`** store để quản lý các trạng thái toàn cục như trạng thái đăng nhập và thông tin người dùng.
  - **Local State:** Dùng `useState` cho các trạng thái cục bộ trong component.
  - **Form State:** Dùng `react-hook-form` để quản lý form hiệu quả.

### 2. Styling & UI Components

- **Styling:** Sử dụng **`nativewind`** với cú pháp `className` để tạo giao diện.
- **Icons:** Sử dụng **`lucide-react-native`**.
- **Image Handling:** Dùng **`expo-image`** để tối ưu.

### 3. Logic và Services

- **Business Logic:** Đặt logic trong các custom hooks (`hooks/`) hoặc các hàm tiện ích (`utils/`).
- **API Calls:** Định nghĩa trong các file service tương ứng trong `services/`.
- **TypeScript:** Tận dụng tối đa các **interfaces** trong thư mục `types/` để đảm bảo an toàn kiểu dữ liệu.

---

## Storage & Authentication

### Quản lý Trạng thái Xác thực

- **Zustand Store:** Sử dụng một store riêng biệt (ví dụ: `store/authStore.ts`) để quản lý các trạng thái liên quan đến xác thực.
- Store này sẽ chứa các trạng thái như `isLoggedIn` (boolean), `userToken` (string | null), và `userInfo` (object | null).
- Các action (hàm) như `login`, `logout` và `initialize` sẽ được định nghĩa trong store để cập nhật trạng thái và tương tác với bộ nhớ an toàn.

### Lưu Trữ Token An Toàn

- **Expo SecureStore:** Sử dụng **`Expo SecureStore`** để lưu trữ các thông tin nhạy cảm như **token xác thực**.
- **Quy tắc:**
  - Luôn sử dụng **`SecureStore.setItemAsync()`** để lưu token sau khi đăng nhập thành công.
  - Sử dụng **`SecureStore.getItemAsync()`** để lấy token khi khởi động ứng dụng để duy trì phiên đăng nhập.
  - Sử dụng **`SecureStore.deleteItemAsync()`** để xóa token khi người dùng đăng xuất.
- **Lưu ý:** Tuyệt đối không lưu mật khẩu người dùng hoặc các thông tin không cần thiết vào SecureStore.

---

## Ví dụ Implementation

### Dynamic Route với Expo Router

```typescript
// app/koi/[id].tsx
import { Stack, useLocalSearchParams } from "expo-router";
import { useKoiDetail } from "../../../hooks/useKoi";
import { KoiDetailSection } from "../../../components/koi/KoiDetailSection";

export default function KoiDetailPage() {
  const { id } = useLocalSearchParams();
  const { data: koi, isLoading } = useKoiDetail(id as string);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!koi) {
    return <Text>Không tìm thấy cá Koi này.</Text>;
  }

  return (
    <View className="flex-1 p-4">
      <Stack.Screen options={{ title: koi.name }} />
      <KoiDetailSection koi={koi} />
    </View>
  );
}
Sử dụng Custom Hook và Components
TypeScript

// app/koi/create.tsx
import { View, Text, Button } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useCreateKoi } from "../../hooks/useKoi";
import { TextInput } from "../../components/common/TextInput";

export default function CreateKoiScreen() {
  const { control, handleSubmit } = useForm({
    // ... default values
  });
  const createMutation = useCreateKoi();

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  return (
    <View className="p-4">
      <Text className="text-xl font-bold mb-4">Tạo hồ sơ cá Koi mới</Text>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Tên cá Koi"
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {/* ... other form fields */}
      <Button title="Lưu hồ sơ" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}
```

## Lưu ý Quan trọng

---

## Critical Development Rules

### TypeScript Patterns

```typescript
// Always export interfaces from service files
export interface ItemSearchParams {
  search?: string;
  status?: ItemStatus;
  pageIndex?: number;
  pageSize?: number;
}

// Use proper enum definitions
export enum ItemStatus {
  Active = 'Active',
  Inactive = 'Inactive',
}

// Convert filters for API calls
const convertItemFilter = (filters?: ItemSearchParams): RequestParams => {
  if (!filters) return {};
  const params: RequestParams = {};
  if (filters.search) params.search = filters.search;
  return params;
};
```

### Navigation Actions

```typescript
import { router } from 'expo-router';

// Navigate to detail screen
const handlePress = (item: Item) => {
  router.push({
    pathname: '/(home)/module/[id]',
    params: { id: item.id.toString() },
  });
};

// Go back
router.back();

// Replace (for auth flows)
router.replace('/(home)');
```

## Development Workflows

### Environment Setup

```bash
npm install              # Install dependencies
npm run start           # Start Expo dev server
npm run android         # Build for Android
npm run ios            # Build for iOS
npm run lint           # ESLint check
npm run format         # Prettier formatting
```

### Key Dependencies

- `@tanstack/react-query` - Server state management
- `expo-router` - File-based routing system
- `expo-secure-store` - Secure token storage
- `react-hook-form` - Form validation
- `nativewind` - Tailwind CSS styling
- `zustand` - Global state management
- `axios` - HTTP client with interceptors

## Business Domain Context

This is a **Koi farm management system** for farm staff. Key modules:

- **Koi Management:** Fish profiles, RFID tracking, breeding history
- **Breeding Process:** Multi-stage breeding workflow with classification records
- **Water Quality:** Parameter monitoring for pond environments
- **Incident Management:** Report and track farm incidents
- **Task Management:** Daily work schedules and assignments

**User Roles:** FarmStaff and Manager (validated via JWT role claims)  
**Language:** All UI text and user communication in Vietnamese
