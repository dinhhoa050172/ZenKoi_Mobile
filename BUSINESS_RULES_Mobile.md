# ZenKoi Mobile App - Tổng Hợp Business Rules

> **Tài liệu này tổng hợp toàn bộ các quy tắc nghiệp vụ (Business Rules) được áp dụng trong ứng dụng ZenKoi Mobile**

---

## Mục Lục

1. [Xác Thực & Phân Quyền](#1-xác-thực--phân-quyền)
2. [Quản Lý Hồ Nuôi](#2-quản-lý-hồ-nuôi)
3. [Quản Lý Thông Số Nước](#3-quản-lý-thông-số-nước)
4. [Quản Lý Cá Koi](#4-quản-lý-cá-koi)
5. [Quy Trình Sinh Sản](#5-quy-trình-sinh-sản)
6. [Quản Lý Lô Trứng](#6-quản-lý-lô-trứng)
7. [Quản Lý Cá Bột](#7-quản-lý-cá-bột)
8. [Phân Loại Cá](#8-phân-loại-cá)
9. [Quản Lý Công Việc](#9-quản-lý-công-việc)
10. [Quản Lý Sự Cố](#10-quản-lý-sự-cố)
11. [Hồ Sơ Người Dùng](#11-hồ-sơ-người-dùng)
12. [Nhận Dạng Cá (RFID/Image)](#12-nhận-dạng-cá-rfidimage)
13. [Quy Tắc Chung](#13-quy-tắc-chung)

---

## 1. Xác Thực & Phân Quyền

### 1.1 Đăng Nhập

| Mã Quy Tắc | Mô Tả                                                                  | Chi Tiết                    |
| ---------- | ---------------------------------------------------------------------- | --------------------------- |
| AUTH-001   | Đăng nhập yêu cầu username/email và password                           | Cả hai trường đều bắt buộc  |
| AUTH-002   | Chỉ người dùng có vai trò `Manager` hoặc `FarmStaff` được truy cập app | JWT claims validation       |
| AUTH-003   | Access token và refresh token được lưu trữ an toàn                     | Sử dụng `expo-secure-store` |
| AUTH-004   | Đăng nhập thất bại hiển thị thông báo lỗi                              | Toast notification          |

### 1.2 Đăng Ký

| Mã Quy Tắc | Trường                                                                  | Validation                                        |
| ---------- | ----------------------------------------------------------------------- | ------------------------------------------------- |
| AUTH-005   | email, userName, password, confirmPassword, fullName, phoneNumber, role | Tất cả bắt buộc                                   |
| AUTH-006   | Password và confirmPassword                                             | Phải khớp nhau                                    |
| AUTH-007   | Role                                                                    | Phải là: Manager, FarmStaff, SaleStaff, hoặc User |

### 1.3 Quản Lý Mật Khẩu

| Mã Quy Tắc | Mô Tả                                                                         |
| ---------- | ----------------------------------------------------------------------------- |
| AUTH-008   | Đổi mật khẩu yêu cầu: oldPassword, newPassword, confirmedNewPassword          |
| AUTH-009   | Reset mật khẩu yêu cầu: email, newPassword, confirmedNewPassword, reset token |
| AUTH-010   | Quên mật khẩu gửi link/OTP đến email đã đăng ký                               |

### 1.4 Quản Lý Phiên

| Mã Quy Tắc | Mô Tả                                                       |
| ---------- | ----------------------------------------------------------- |
| AUTH-011   | Access token có thể được gia hạn bằng refresh token         |
| AUTH-012   | Đăng xuất vô hiệu hóa refresh token phía server             |
| AUTH-013   | Trạng thái xác thực được lưu giữ giữa các lần khởi động app |
| AUTH-014   | Khi nhận response 401, tự động đăng xuất người dùng         |

### 1.5 Vai Trò Người Dùng

| Vai Trò   | Quyền Truy Cập                                     |
| --------- | -------------------------------------------------- |
| Manager   | Toàn quyền truy cập tất cả tính năng               |
| FarmStaff | Truy cập các chức năng vận hành trang trại         |
| SaleStaff | Truy cập các tính năng bán hàng                    |
| User      | Truy cập cơ bản (không được phép trong mobile app) |

---

## 2. Quản Lý Hồ Nuôi

### 2.1 Tạo Hồ Mới

| Mã Quy Tắc | Trường            | Validation                  | Thông Báo Lỗi                                            |
| ---------- | ----------------- | --------------------------- | -------------------------------------------------------- |
| POND-001   | Tên hồ            | Bắt buộc, không rỗng        | "Vui lòng nhập tên hồ"                                   |
| POND-002   | Loại hồ           | Bắt buộc, chọn từ danh sách | "Vui lòng chọn loại hồ"                                  |
| POND-003   | Khu vực           | Bắt buộc, chọn từ danh sách | "Vui lòng chọn khu vực"                                  |
| POND-004   | Vị trí            | Bắt buộc, không rỗng        | "Vui lòng nhập vị trí"                                   |
| POND-005   | Chiều dài (m)     | Bắt buộc, phải > 0          | "Vui lòng nhập chiều dài hợp lệ và lớn hơn 0"            |
| POND-006   | Chiều rộng (m)    | Bắt buộc, phải > 0          | "Vui lòng nhập chiều rộng hợp lệ và lớn hơn 0"           |
| POND-007   | Độ sâu (m)        | Bắt buộc, phải > 0          | "Vui lòng nhập độ sâu hợp lệ và lớn hơn 0"               |
| POND-008   | Thể tích hiện tại | Bắt buộc, phải > 0          | "Vui lòng nhập thể tích hồ hiện tại hợp lệ và lớn hơn 0" |

### 2.2 Tính Toán Thể Tích

| Mã Quy Tắc | Mô Tả                                                 | Công Thức                                                              |
| ---------- | ----------------------------------------------------- | ---------------------------------------------------------------------- |
| POND-009   | Thể tích tối đa tính từ kích thước                    | `length × width × depth × 1000` (lít)                                  |
| POND-010   | Thể tích hiện tại tính từ mực nước                    | `length × width × waterLevel × 1000` (lít)                             |
| POND-011   | Thể tích hiện tại không được vượt quá thể tích tối đa | Lỗi: "Thể tích hồ hiện tại không thể lớn hơn thể tích lớn nhất của hồ" |
| POND-012   | Mực nước phải nhỏ hơn độ sâu hồ                       | Lỗi: "Mực nước phải nhỏ hơn độ sâu của hồ"                             |

### 2.3 Trạng Thái Hồ

| Trạng Thái  | Mô Tả                   | Chuyển Đổi Cho Phép     |
| ----------- | ----------------------- | ----------------------- |
| Empty       | Hồ không có cá          | → Active, → Maintenance |
| Active      | Hồ đang hoạt động có cá | → Empty, → Maintenance  |
| Maintenance | Hồ đang bảo trì         | → Empty, → Active       |

### 2.4 Loại Hồ

| Loại Hồ     | Enum Value   | Mục Đích                  |
| ----------- | ------------ | ------------------------- |
| Market Pond | `MarketPond` | Hồ bán/trưng bày cá       |
| Brood Stock | `BroodStock` | Hồ nuôi cá giống sinh sản |

### 2.5 Bộ Lọc Tìm Kiếm Hồ

| Bộ Lọc                                | Mô Tả                                          |
| ------------------------------------- | ---------------------------------------------- |
| search                                | Tìm theo tên hồ                                |
| status                                | Lọc theo trạng thái (Empty/Active/Maintenance) |
| isNotMaintenance                      | Loại trừ hồ đang bảo trì                       |
| areaId                                | Lọc theo khu vực                               |
| pondTypeId / pondTypeEnum             | Lọc theo loại hồ                               |
| available                             | Lọc hồ còn trống                               |
| minCapacityLiters / maxCapacityLiters | Lọc theo khoảng thể tích                       |
| minDepthMeters / maxDepthMeters       | Lọc theo khoảng độ sâu                         |
| createdFrom / createdTo               | Lọc theo ngày tạo                              |

---

## 3. Quản Lý Thông Số Nước

### 3.1 Các Thông Số Chất Lượng Nước

| Thông Số           | Loại | Đơn Vị | Mô Tả                 |
| ------------------ | ---- | ------ | --------------------- |
| phLevel            | Số   | -      | Độ pH của nước        |
| temperatureCelsius | Số   | °C     | Nhiệt độ nước         |
| oxygenLevel        | Số   | mg/L   | Nồng độ oxy hòa tan   |
| ammoniaLevel       | Số   | mg/L   | Nồng độ ammonia (NH₃) |
| nitriteLevel       | Số   | mg/L   | Nồng độ nitrite (NO₂) |
| nitrateLevel       | Số   | mg/L   | Nồng độ nitrate (NO₃) |
| carbonHardness     | Số   | °dH    | Độ cứng carbonate     |
| waterLevelMeters   | Số   | m      | Mực nước              |

### 3.2 Quy Tắc Tạo Bản Ghi

| Mã Quy Tắc | Mô Tả                                                      |
| ---------- | ---------------------------------------------------------- |
| WATER-001  | Tất cả 8 thông số nước đều bắt buộc khi tạo bản ghi        |
| WATER-002  | Phải chọn loại hồ trước khi nhập thông số nước             |
| WATER-003  | Mỗi thông số có giá trị ngưỡng dựa trên loại hồ            |
| WATER-004  | Thời gian ghi (recordedAt) tự động đặt theo giờ địa phương |
| WATER-005  | Trường ghi chú (notes) là tùy chọn                         |

### 3.3 Ngưỡng Thông Số Nước

| Mã Quy Tắc | Mô Tả                                                    |
| ---------- | -------------------------------------------------------- |
| WATER-006  | Mỗi loại hồ có ngưỡng min/max riêng cho từng thông số    |
| WATER-007  | Giá trị ngưỡng được định nghĩa theo pondTypeId           |
| WATER-008  | Ngưỡng được hiển thị như text hướng dẫn khi nhập dữ liệu |

### 3.4 Đánh Giá Thông Số

| Trạng Thái | Màu Sắc | Ý Nghĩa                  |
| ---------- | ------- | ------------------------ |
| Good       | Xanh lá | Trong ngưỡng tốt         |
| Warning    | Vàng    | Gần ngưỡng, cần theo dõi |
| Danger     | Đỏ      | Ngoài ngưỡng an toàn     |

---

## 4. Quản Lý Cá Koi

### 4.1 Trường Bắt Buộc

| Mã Quy Tắc | Trường              | Validation           | Thông Báo Lỗi                       |
| ---------- | ------------------- | -------------------- | ----------------------------------- |
| KOI-001    | RFID                | Bắt buộc, không rỗng | "Vui lòng nhập mã RFID"             |
| KOI-002    | Bể                  | Bắt buộc             | "Vui lòng chọn bể"                  |
| KOI-003    | Giống               | Bắt buộc             | "Vui lòng chọn giống"               |
| KOI-004    | Loại                | Bắt buộc (High/Show) | "Vui lòng chọn loại"                |
| KOI-005    | Kích thước (cm)     | Bắt buộc, phải > 0   | "Vui lòng chọn chiều dài"           |
| KOI-006    | Ngày sinh           | Bắt buộc             | "Vui lòng chọn ngày sinh"           |
| KOI-007    | Giới tính           | Bắt buộc             | "Vui lòng chọn giới tính"           |
| KOI-008    | Nguồn gốc           | Bắt buộc, không rỗng | "Vui lòng nhập nguồn gốc"           |
| KOI-009    | Tình trạng sức khỏe | Bắt buộc             | "Vui lòng chọn tình trạng sức khỏe" |
| KOI-010    | Hình ảnh            | Ít nhất 1 ảnh        | "Vui lòng thêm ít nhất 1 ảnh"       |
| KOI-011    | Video               | Ít nhất 1 video      | "Vui lòng thêm ít nhất 1 video"     |
| KOI-012    | Giá bán             | Bắt buộc, phải > 0   | "Vui lòng nhập giá bán > 0"         |
| KOI-013    | Mô tả               | Bắt buộc, không rỗng | "Vui lòng nhập giới thiệu"          |

### 4.2 Giới Hạn Upload Media

| Mã Quy Tắc | Mô Tả                           | Giới Hạn               |
| ---------- | ------------------------------- | ---------------------- |
| KOI-014    | Số lượng hình ảnh tối đa mỗi cá | 6 ảnh                  |
| KOI-015    | Số lượng video tối đa mỗi cá    | 1 video                |
| KOI-016    | Video dùng để đăng ký Koi Re-ID | Tự động sau khi tạo cá |

### 4.3 Validation Ngày Sinh

| Mã Quy Tắc | Mô Tả                                |
| ---------- | ------------------------------------ | ------------------------------------------- |
| KOI-017    | Ngày sinh không được trong tương lai | Lỗi: "Không được chọn ngày trong tương lai" |

### 4.4 Giới Tính Cá

| Giá Trị | Hiển Thị      |
| ------- | ------------- |
| Male    | Đực           |
| Female  | Cái           |
| Other   | Chưa xác định |

### 4.5 Tình Trạng Sức Khỏe

| Giá Trị | Hiển Thị  | Mô Tả                |
| ------- | --------- | -------------------- |
| Healthy | Khỏe mạnh | Sức khỏe bình thường |
| Warning | Cảnh báo  | Cần theo dõi         |
| Weak    | Yếu       | Tình trạng kém       |
| Sick    | Bệnh      | Đang bệnh            |
| Dead    | Chết      | Đã chết              |

### 4.6 Trạng Thái Bán

| Giá Trị    | Hiển Thị  |
| ---------- | --------- |
| NotForSale | Không bán |
| Available  | Có sẵn    |
| Sold       | Đã bán    |

### 4.7 Loại Cá Koi

| Giá Trị | Mô Tả             |
| ------- | ----------------- |
| High    | Cá chất lượng cao |
| Show    | Cá cấp độ thi đấu |

### 4.8 Quy Tắc Hoa Văn (Pattern)

| Mã Quy Tắc | Mô Tả                                  |
| ---------- | -------------------------------------- |
| KOI-020    | Hoa văn được lấy theo từng giống cá    |
| KOI-021    | Phải chọn giống trước khi chọn hoa văn |
| KOI-022    | Hoa văn là trường tùy chọn             |

### 4.9 Quy Tắc Đột Biến

| Mã Quy Tắc | Mô Tả                                                    |
| ---------- | -------------------------------------------------------- |
| KOI-018    | Nếu `isMutation = true` thì `mutationNote` là bắt buộc   |
| KOI-019    | Nếu `isMutation = false` thì `mutationNote` phải là null |

---

## 5. Quy Trình Sinh Sản

### 5.1 Tạo Quy Trình Sinh Sản

| Mã Quy Tắc | Trường      | Mô Tả                  |
| ---------- | ----------- | ---------------------- |
| BREED-001  | maleKoiId   | Bắt buộc - ID cá bố    |
| BREED-002  | femaleKoiId | Bắt buộc - ID cá mẹ    |
| BREED-003  | pondId      | Bắt buộc - Hồ sinh sản |

### 5.2 Kiểm Tra Cận Huyết

| Mã Quy Tắc | Mô Tả                                                 |
| ---------- | ----------------------------------------------------- |
| BREED-004  | Hệ thống tính toán hệ số cận huyết giữa cá đực và cái |
| BREED-005  | Nên kiểm tra mức độ cận huyết trước khi tạo quy trình |

### 5.3 Luồng Trạng Thái Quy Trình Sinh Sản

```
Ghép cặp → Đẻ trứng → Lô trứng → Cá bột → Phân loại → Hoàn thành
   ↓           ↓           ↓          ↓          ↓
  Thất bại   Thất bại   Thất bại   Thất bại   Thất bại
```

| Trạng Thái     | Mô Tả                           | Trạng Thái Tiếp Theo       |
| -------------- | ------------------------------- | -------------------------- |
| Pairing        | Đang ghép cặp cá sinh sản       | → Spawned, → Failed        |
| Spawned        | Cá đã đẻ trứng                  | → EggBatch, → Failed       |
| EggBatch       | Đang ấp trứng                   | → FryFish, → Failed        |
| FryFish        | Cá bột đang phát triển          | → Classification, → Failed |
| Classification | Đang phân loại cá               | → Complete, → Failed       |
| Complete       | Quy trình hoàn thành thành công | (Kết thúc)                 |
| Failed         | Quy trình thất bại              | (Kết thúc)                 |

### 5.4 Kết Quả Quy Trình

| Kết Quả        | Mô Tả                                  |
| -------------- | -------------------------------------- |
| Unknown        | Chưa xác định kết quả                  |
| Success        | Tất cả giai đoạn hoàn thành thành công |
| Failed         | Quy trình thất bại                     |
| PartialSuccess | Thành công một phần                    |

### 5.5 Bộ Lọc Tìm Kiếm

- Theo cá bố/mẹ (maleKoiId, femaleKoiId)
- Theo hồ, mã, trạng thái, kết quả
- Theo số lượng trứng (minTotalEggs, maxTotalEggs)
- Theo tỷ lệ thụ tinh
- Theo tỷ lệ sống sót
- Theo số cá đạt chuẩn
- Theo khoảng thời gian (bắt đầu/kết thúc)

---

## 6. Quản Lý Lô Trứng

### 6.1 Tạo Lô Trứng

| Mã Quy Tắc | Trường            | Mô Tả                                      |
| ---------- | ----------------- | ------------------------------------------ |
| EGG-001    | breedingProcessId | Bắt buộc - Liên kết đến quy trình sinh sản |
| EGG-002    | pondId            | Bắt buộc - Hồ ấp trứng                     |
| EGG-003    | quantity          | Bắt buộc - Số lượng trứng                  |

### 6.2 Luồng Trạng Thái Lô Trứng

```
Thu hoạch → Đang ấp → Nở một phần → Thành công
                                  ↘ Thất bại
```

| Trạng Thái       | Mô Tả                      |
| ---------------- | -------------------------- |
| Collected        | Trứng vừa được thu hoạch   |
| Incubating       | Đang ấp trứng              |
| PartiallyHatched | Một số trứng đã nở         |
| Success          | Tất cả trứng khả thi đã nở |
| Failed           | Lô trứng thất bại          |

### 6.3 Trường Tính Toán

| Trường            | Mô Tả                               |
| ----------------- | ----------------------------------- |
| fertilizationRate | Tính từ tỷ lệ trứng khỏe/tổng trứng |
| hatchingTime      | Thời điểm trứng bắt đầu nở          |
| spawnDate         | Ngày đẻ trứng                       |

---

## 7. Quản Lý Cá Bột

### 7.1 Tạo Lô Cá Bột

| Mã Quy Tắc | Trường            | Mô Tả                                      |
| ---------- | ----------------- | ------------------------------------------ |
| FRY-001    | breedingProcessId | Bắt buộc - Liên kết đến quy trình sinh sản |
| FRY-002    | pondId            | Bắt buộc - Hồ nuôi cá bột                  |

### 7.2 Luồng Trạng Thái Cá Bột

```
Mới nở → Đang lớn → Đang chọn lọc → Hoàn thành
                                  ↘ Chết
```

| Trạng Thái | Mô Tả                       |
| ---------- | --------------------------- |
| Hatched    | Vừa nở từ trứng             |
| Growing    | Cá bột đang phát triển      |
| Selecting  | Đang chọn lọc/phân loại     |
| Completed  | Hoàn thành giai đoạn cá bột |
| Dead       | Tất cả cá bột chết          |

### 7.3 Các Chỉ Số Theo Dõi

| Chỉ Số              | Mô Tả                      |
| ------------------- | -------------------------- |
| initialCount        | Số lượng ban đầu           |
| currentSurvivalRate | Tỷ lệ sống sót hiện tại    |
| survivalRate7Days   | Tỷ lệ sống sót sau 7 ngày  |
| survivalRate14Days  | Tỷ lệ sống sót sau 14 ngày |
| survivalRate30Days  | Tỷ lệ sống sót sau 30 ngày |

### 7.4 Bản Ghi Sống Sót

| Mã Quy Tắc | Trường     | Mô Tả                                |
| ---------- | ---------- | ------------------------------------ |
| SURV-001   | fryFishId  | Bắt buộc - Tham chiếu đến lô cá bột  |
| SURV-002   | countAlive | Bắt buộc - Số lượng cá còn sống      |
| SURV-003   | note       | Tùy chọn - Ghi chú quan sát          |
| SURV-004   | success    | Bắt buộc - Trạng thái ngày (boolean) |

---

## 8. Phân Loại Cá

### 8.1 Luồng Trạng Thái Giai Đoạn Phân Loại

```
Chuẩn bị → Vòng 1 → Vòng 2 → Vòng 3 → Vòng 4 → Thành công
```

| Trạng Thái | Mô Tả                |
| ---------- | -------------------- |
| Preparing  | Chuẩn bị phân loại   |
| Stage1     | Vòng phân loại thứ 1 |
| Stage2     | Vòng phân loại thứ 2 |
| Stage3     | Vòng phân loại thứ 3 |
| Stage4     | Vòng phân loại thứ 4 |
| Success    | Hoàn thành phân loại |

### 8.2 Các Loại Phân Loại

| Loại Số Lượng      | Mô Tả                    |
| ------------------ | ------------------------ |
| totalCount         | Tổng số cá cần phân loại |
| highQualifiedCount | Cá đạt cấp "High"        |
| showQualifiedCount | Cá đạt cấp "Show"        |
| pondQualifiedCount | Cá để nuôi ao            |
| cullQualifiedCount | Cá loại bỏ               |

### 8.3 Phiên Bản Tạo Bản Ghi

| Phiên Bản | Mục Đích          | Trường Bắt Buộc                                  |
| --------- | ----------------- | ------------------------------------------------ |
| V1        | Giai đoạn loại bỏ | classificationStageId, cullQualifiedCount, notes |
| V2        | Giai đoạn High    | classificationStageId, highQualifiedCount, notes |
| V3        | Giai đoạn Show    | classificationStageId, showQualifiedCount, notes |

---

## 9. Quản Lý Công Việc

### 9.1 Trường Lịch Công Việc

| Trường         | Mô Tả                        |
| -------------- | ---------------------------- |
| taskTemplateId | Tham chiếu đến mẫu công việc |
| scheduledDate  | Ngày thực hiện               |
| startTime      | Giờ bắt đầu                  |
| endTime        | Giờ kết thúc                 |
| status         | Trạng thái hiện tại          |
| notes          | Ghi chú bổ sung              |
| staffIds       | Mảng ID nhân viên được giao  |
| pondIds        | Mảng ID hồ được giao         |

### 9.2 Luồng Trạng Thái Công Việc

```
Chờ xử lý → Đang thực hiện → Hoàn thành
                          ↘ Chưa hoàn thành
                          ↘ Đã hủy
```

| Trạng Thái | Mô Tả                  |
| ---------- | ---------------------- |
| Pending    | Công việc chưa bắt đầu |
| InProgress | Đang thực hiện         |
| Completed  | Hoàn thành thành công  |
| Incomplete | Chưa hoàn thành        |
| Cancelled  | Đã hủy                 |

### 9.3 Mẫu Công Việc

| Trường          | Mô Tả               |
| --------------- | ------------------- |
| taskName        | Tên công việc       |
| description     | Mô tả công việc     |
| defaultDuration | Thời lượng mặc định |
| isRecurring     | Có lặp lại không    |
| recurrenceRule  | Quy tắc lặp lại     |

### 9.4 Hoàn Thành Công Việc

| Mã Quy Tắc | Mô Tả                                               |
| ---------- | --------------------------------------------------- |
| TASK-001   | Nhân viên phải cung cấp ghi chú khi hoàn thành      |
| TASK-002   | Thời gian hoàn thành được ghi nhận tự động          |
| TASK-003   | Nhiều nhân viên có thể được giao cùng một công việc |
| TASK-004   | Nhiều hồ có thể liên kết với cùng một công việc     |

---

## 10. Quản Lý Sự Cố

### 10.1 Trường Bắt Buộc Sự Cố

| Trường         | Mô Tả                     |
| -------------- | ------------------------- |
| incidentTypeId | Tham chiếu đến loại sự cố |
| incidentTitle  | Tiêu đề sự cố             |
| description    | Mô tả chi tiết            |
| occurredAt     | Thời điểm xảy ra          |

### 10.2 Luồng Trạng Thái Sự Cố

```
Đã báo cáo → Đang điều tra → Đã giải quyết → Đã đóng
                          ↘ Đã hủy
```

| Trạng Thái    | Mô Tả                     |
| ------------- | ------------------------- |
| Reported      | Sự cố vừa được báo cáo    |
| Investigating | Đang điều tra             |
| Resolved      | Đã giải quyết vấn đề      |
| Closed        | Sự cố đã đóng             |
| Cancelled     | Sự cố đã hủy/không hợp lệ |

### 10.3 Mức Độ Nghiêm Trọng

| Mức Độ | Mô Tả                    |
| ------ | ------------------------ |
| Low    | Vấn đề nhỏ               |
| Medium | Quan ngại vừa phải       |
| High   | Vấn đề nghiêm trọng      |
| Urgent | Khẩn cấp, cần xử lý ngay |

### 10.4 Sự Cố Liên Quan Đến Cá

| Trường            | Mô Tả                                   |
| ----------------- | --------------------------------------- |
| koiFishId         | Cá bị ảnh hưởng                         |
| affectedStatus    | Tình trạng sức khỏe của cá bị ảnh hưởng |
| specificSymptoms  | Mô tả triệu chứng                       |
| requiresTreatment | Cần điều trị không (boolean)            |
| isIsolated        | Đã cách ly chưa (boolean)               |
| treatmentNotes    | Ghi chú điều trị                        |
| affectedFrom      | Thời điểm cá bị ảnh hưởng               |

### 10.5 Trạng Thái Ảnh Hưởng Cá

| Giá Trị | Mô Tả     |
| ------- | --------- |
| Healthy | Khỏe mạnh |
| Warning | Cảnh báo  |
| Weak    | Yếu       |
| Sick    | Bệnh      |
| Dead    | Chết      |

### 10.6 Sự Cố Liên Quan Đến Hồ

| Trường               | Mô Tả                         |
| -------------------- | ----------------------------- |
| pondId               | Hồ bị ảnh hưởng               |
| environmentalChanges | Mô tả thay đổi môi trường     |
| requiresWaterChange  | Cần thay nước không (boolean) |
| fishDiedCount        | Số cá chết                    |
| correctiveActions    | Hành động khắc phục           |
| notes                | Ghi chú bổ sung               |

### 10.7 Quy Tắc Giải Quyết Sự Cố

| Mã Quy Tắc | Mô Tả                                                 |
| ---------- | ----------------------------------------------------- |
| INC-001    | Giải quyết yêu cầu thay đổi trạng thái                |
| INC-002    | Ghi chú giải quyết là bắt buộc khi giải quyết         |
| INC-003    | Sự cố đã giải quyết theo dõi ai giải quyết và khi nào |

### 10.8 Validation Tạo Sự Cố

| Mã Quy Tắc | Mô Tả                                                                                         |
| ---------- | --------------------------------------------------------------------------------------------- |
| INC-004    | Form cơ bản phải có: incidentTypeId, incidentTitle, description, occurredAt                   |
| INC-005    | Mỗi hồ được chọn phải có ít nhất 1 trong: environmentalChanges, correctiveActions, hoặc notes |
| INC-006    | Mỗi cá được chọn phải có: specificSymptoms hoặc treatmentNotes hoặc affectedStatus            |
| INC-007    | Ngày xảy ra không được trong tương lai                                                        |

---

## 11. Hồ Sơ Người Dùng

### 11.1 Trường Hồ Sơ

| Trường      | Loại   | Mô Tả              |
| ----------- | ------ | ------------------ |
| fullName    | String | Họ tên đầy đủ      |
| phoneNumber | String | Số điện thoại      |
| email       | String | Địa chỉ email      |
| dateOfBirth | String | Ngày sinh          |
| gender      | String | Giới tính (Nam/Nữ) |
| avatarURL   | String | URL ảnh đại diện   |
| address     | String | Địa chỉ            |
| role        | String | Vai trò người dùng |

### 11.2 Quy Tắc Cập Nhật Hồ Sơ

| Mã Quy Tắc | Mô Tả                                                      |
| ---------- | ---------------------------------------------------------- |
| USER-001   | Cập nhật hồ sơ đồng bộ với auth store                      |
| USER-002   | Avatar có thể cập nhật riêng biệt                          |
| USER-003   | Chi tiết người dùng có thể tạo/cập nhật qua endpoint riêng |

---

## 12. Nhận Dạng Cá (RFID/Image)

### 12.1 Quy Tắc RFID

| Mã Quy Tắc | Mô Tả                                             |
| ---------- | ------------------------------------------------- |
| SCAN-001   | RFID dùng để tìm kiếm cá trực tiếp                |
| SCAN-002   | Nhập thủ công RFID hoặc quét từ thiết bị          |
| SCAN-003   | Kết quả trả về thông tin chi tiết cá nếu tìm thấy |

### 12.2 Quy Tắc Koi Re-ID (Nhận Dạng Hình Ảnh)

| Mã Quy Tắc | Mô Tả                                        |
| ---------- | -------------------------------------------- |
| SCAN-004   | Đăng ký Re-ID yêu cầu URL video              |
| SCAN-005   | Cờ override cho phép đăng ký lại             |
| SCAN-006   | Nhận dạng có thể thực hiện bằng URL hình ảnh |
| SCAN-007   | Chụp ảnh hoặc chọn từ thư viện để nhận dạng  |

---

## 13. Quy Tắc Chung

### 13.1 Quy Tắc Nhập Số

| Mã Quy Tắc | Mô Tả                                                             |
| ---------- | ----------------------------------------------------------------- |
| GEN-001    | Trường số chấp nhận cả dấu chấm (.) và phẩy (,) làm dấu thập phân |
| GEN-002    | Trường số rỗng mặc định là 0                                      |
| GEN-003    | Nhập số không hợp lệ kết quả là 0                                 |

### 13.2 Quy Tắc Ngày/Giờ

| Mã Quy Tắc | Mô Tả                                             |
| ---------- | ------------------------------------------------- |
| GEN-004    | Tất cả ngày theo định dạng ISO 8601               |
| GEN-005    | Timestamp bao gồm múi giờ địa phương              |
| GEN-006    | Không cho phép ngày trong tương lai cho ngày sinh |

### 13.3 Quy Tắc Phân Trang

| Mã Quy Tắc | Mô Tả                                                    |
| ---------- | -------------------------------------------------------- |
| GEN-007    | Kích thước trang mặc định thường là 20-50 items          |
| GEN-008    | Page index bắt đầu từ 1                                  |
| GEN-009    | hasNextPage/hasPreviousPage cho biết khả năng điều hướng |

### 13.4 Quy Tắc Xử Lý Lỗi

| Mã Quy Tắc | Mô Tả                                      |
| ---------- | ------------------------------------------ |
| GEN-010    | Tất cả lỗi API hiển thị toast notification |
| GEN-011    | Thao tác thành công hiển thị success toast |
| GEN-012    | Response API bao gồm boolean isSuccess     |
| GEN-013    | Thông báo lỗi bằng tiếng Việt              |

### 13.5 Quy Tắc Caching

| Mã Quy Tắc | Mô Tả                                              |
| ---------- | -------------------------------------------------- |
| GEN-014    | Thời gian stale của query thường là 5 phút         |
| GEN-015    | Thời gian garbage collection thường là 10 phút     |
| GEN-016    | Mutations tự động invalidate các queries liên quan |

### 13.6 Quy Tắc Cập Nhật Real-time (SignalR)

| Tính Năng     | Mô Tả                                        |
| ------------- | -------------------------------------------- |
| Water Alerts  | Cảnh báo thông số nước real-time             |
| Notifications | Push notification cho các sự kiện quan trọng |

---

## 14. Kiểm Soát Truy Cập

### 14.1 Phân Quyền Theo Vai Trò

| Tính Năng                 | Manager | FarmStaff |
| ------------------------- | ------- | --------- |
| Xem tất cả hồ             | ✓       | ✓         |
| Tạo/Sửa hồ                | ✓       | ✓         |
| Xem tất cả cá Koi         | ✓       | ✓         |
| Tạo/Sửa cá Koi            | ✓       | ✓         |
| Quy trình sinh sản        | ✓       | ✓         |
| Lịch công việc (của mình) | ✓       | ✓         |
| Lịch công việc (tất cả)   | ✓       | Giới hạn  |
| Quản lý sự cố             | ✓       | ✓         |

### 14.2 Quy Tắc Quyền Sở Hữu Dữ Liệu

| Mã Quy Tắc | Mô Tả                                      |
| ---------- | ------------------------------------------ |
| ACC-001    | Lịch công việc có nhân viên được giao      |
| ACC-002    | Sự cố theo dõi ai báo cáo và ai giải quyết |
| ACC-003    | Bản ghi nước theo dõi ai ghi nhận          |

---

## Phụ Lục

### A. Danh Sách Enum Đầy Đủ

#### A.1 PondStatus

```typescript
enum PondStatus {
  Empty = 'Empty',
  Active = 'Active',
  Maintenance = 'Maintenance',
}
```

#### A.2 BreedingProcessStatus

```typescript
enum BreedingProcessStatus {
  Pairing = 'Pairing',
  Spawned = 'Spawned',
  EggBatch = 'EggBatch',
  FryFish = 'FryFish',
  Classification = 'Classification',
  Complete = 'Complete',
  Failed = 'Failed',
}
```

#### A.3 IncidentStatus

```typescript
enum IncidentStatus {
  Reported = 'Reported',
  Investigating = 'Investigating',
  Resolved = 'Resolved',
  Closed = 'Closed',
  Cancelled = 'Cancelled',
}
```

#### A.4 KoiAffectedStatus

```typescript
enum KoiAffectedStatus {
  HEALTHY = 'Healthy',
  WARNING = 'Warning',
  WEAK = 'Weak',
  SICK = 'Sick',
  DEAD = 'Dead',
}
```

#### A.5 WorkScheduleStatus

```typescript
enum WorkScheduleStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Incomplete = 'Incomplete',
  Cancelled = 'Cancelled',
}
```

---

> **Ghi chú**: Tài liệu này được tạo tự động từ mã nguồn ứng dụng ZenKoi Mobile. Vui lòng cập nhật khi có thay đổi logic nghiệp vụ.

**Phiên bản**: 1.0  
**Ngày cập nhật**: 01/12/2025
