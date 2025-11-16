# React Native Keyboard Controller Integration

## Tổng quan

Đã tích hợp `react-native-keyboard-controller` để cải thiện trải nghiệm nhập liệu trong ứng dụng ZenKoi Mobile.

## Các tính năng đã implement

### 1. KeyboardProvider Setup

- Đã setup `KeyboardProvider` ở root level trong `app/_layout.tsx`
- Provider wrapper toàn bộ ứng dụng để quản lý keyboard events

### 2. KeyboardAwareScrollView (Official Library)

- **Source**: `react-native-keyboard-controller`
- **Functionality**:
  - Tự động adjust content khi keyboard xuất hiện/biến mất
  - Native performance với smooth animations
  - Built-in support cho `keyboardShouldPersistTaps` và `showsVerticalScrollIndicator`

### 3. EnhancedInputField Component

- **Location**: `components/EnhancedInputField.tsx`
- **Features**:
  - Visual feedback khi focus/blur
  - Error state styling
  - Required field indicator
  - Keyboard-aware return key types
  - Auto-capitalization và auto-correction

### 4. Screen Updates

#### TypeCreate Screen (`app/(home)/incidents/typeCreate.tsx`)

- ✅ Removed `KeyboardAvoidingView` (không cần thiết với keyboard controller)
- ✅ Added `useKeyboardHandler` cho keyboard events
- ✅ Replaced `ScrollView` với official `KeyboardAwareScrollView`
- ✅ Enhanced TextInput với keyboard-friendly props:
  - `returnKeyType="next"` cho name field
  - `returnKeyType="done"` cho description field
  - `autoCapitalize="sentences"`
  - `autoCorrect={true}`
- ✅ Added `keyboardShouldPersistTaps="handled"` for better UX

#### EditIncidentTypeModal (`components/incidents/EditIncidentTypeModal.tsx`)

- ✅ Same improvements as TypeCreate screen
- ✅ Modal-specific keyboard handling
- ✅ Proper keyboard dismissal on modal close

## Usage Examples

### Basic KeyboardAwareScrollView

```tsx
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

<KeyboardAwareScrollView
  contentContainerStyle={{
    paddingBottom: 120,
  }}
  showsVerticalScrollIndicator={false}
  keyboardShouldPersistTaps="handled"
>
  {/* Your content */}
</KeyboardAwareScrollView>;
```

### Enhanced Input Field

```tsx
import EnhancedInputField from '@/components/EnhancedInputField';

<EnhancedInputField
  label="Tên loại sự cố"
  placeholder="VD: Bệnh nấm, Chất lượng nước kém..."
  required
  error={errors.name?.message}
  value={value}
  onChangeText={onChange}
/>;
```

### Keyboard Handler Hook

```tsx
import { useKeyboardHandler } from 'react-native-keyboard-controller';

useKeyboardHandler({
  onStart: () => {
    console.log('Keyboard is opening');
  },
  onEnd: () => {
    console.log('Keyboard is closing');
  },
});
```

## Benefits

### 1. Improved UX

- **Smooth animations**: Keyboard xuất hiện/biến mất mượt mà
- **Auto-scrolling**: ScrollView tự động điều chỉnh khi keyboard che content
- **Smart focus handling**: Proper focus management cho multi-input forms

### 2. Performance

- **Native optimizations**: Sử dụng native keyboard APIs
- **Reanimated integration**: 60fps animations với react-native-reanimated
- **Memory efficient**: Không leak memory từ keyboard listeners

### 3. Developer Experience

- **Declarative API**: Easy-to-use React hooks
- **TypeScript support**: Full type safety
- **Consistent behavior**: Cross-platform keyboard handling

## Configuration Options

### KeyboardProvider Props

```tsx
<KeyboardProvider statusBarTranslucent={true} navigationBarTranslucent={false}>
  {/* App content */}
</KeyboardProvider>
```

### KeyboardAwareScrollView Props

- `contentContainerStyle`: Style for scroll content
- `keyboardShouldPersistTaps`: "handled" (recommended)
- `keyboardDismissMode`: "interactive" (recommended)

## Best Practices

### 1. KeyboardAwareScrollView Setup (Learned from AddKoi Screen)

```tsx
<KeyboardAwareScrollView
  className="flex-1"
  contentContainerStyle={{
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: insets.bottom + 30, // Account for safe area
  }}
  showsVerticalScrollIndicator={false}
  keyboardShouldPersistTaps="handled"
>
```

### 2. Input Field Setup

- Use `returnKeyType="next"` for chain navigation
- Set `returnKeyType="done"` for last field
- Enable `autoCapitalize` and `autoCorrect` for better UX
- Add proper `keyboardType` for numeric inputs

### 3. Form Navigation

- Implement proper tab order với `returnKeyType`
- Use `blurOnSubmit={false}` for multi-line inputs
- Handle submission on "done" key press
- Consider `textAlignVertical="top"` for multiline inputs

### 4. Modal Handling

- Use same keyboard-aware components in modals
- Proper cleanup on modal dismiss
- Consider keyboard-friendly modal presentation styles
- Test keyboard behavior in different modal presentation styles

### 5. Safe Area Considerations

```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();

// Use in contentContainerStyle
contentContainerStyle={{
  paddingBottom: insets.bottom + 30,
}}
```

## Testing Notes

- Test on both iOS và Android devices
- Check keyboard behavior with different input types
- Verify animation smoothness on low-end devices
- Test form submission flows with keyboard navigation

## Future Enhancements

1. **Auto-focus management**: Smart focus transitions between inputs
2. **Keyboard shortcuts**: Support for external keyboards
3. **Accessibility**: Enhanced screen reader support
4. **Performance monitoring**: Keyboard animation performance metrics
