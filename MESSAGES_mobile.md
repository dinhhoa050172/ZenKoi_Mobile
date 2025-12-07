# ZenKoi Mobile - Danh Sách Messages

Tài liệu này tổng hợp toàn bộ message đang sử dụng trong ứng dụng ZenKoi Mobile.

## Loại Message (Type)

| Type            | Mô tả                                                                |
| --------------- | -------------------------------------------------------------------- |
| **Toast**       | Thông báo hiển thị popup ở đầu màn hình (react-native-toast-message) |
| **Inline**      | Text hiển thị màu đỏ dưới input field khi validation lỗi             |
| **CustomAlert** | Modal dialog hiển thị thông báo lỗi/cảnh báo/thông tin               |

---

## 1. Authentication Messages

| Code | Type   | Context                                  | Content                                     |
| ---- | ------ | ---------------------------------------- | ------------------------------------------- |
| 1    | Toast  | Đăng nhập thành công                     | Đăng nhập thành công                        |
| 2    | Toast  | Đăng nhập thất bại - không có quyền      | Tài khoản không được phép truy cập ứng dụng |
| 3    | Toast  | Đăng nhập thất bại - không xác thực role | Không thể xác thực vai trò người dùng       |
| 4    | Toast  | Đăng nhập thất bại - lỗi chung           | Đăng nhập thất bại                          |
| 5    | Toast  | Đăng xuất thành công                     | Đăng xuất thành công                        |
| 6    | Toast  | Đăng xuất thất bại                       | Đăng xuất thất bại                          |
| 7    | Inline | Đăng nhập - email trống                  | Vui lòng nhập email hoặc username           |
| 8    | Inline | Đăng nhập - mật khẩu trống               | Vui lòng nhập mật khẩu                      |

---

## 2. Registration Messages (Đăng ký)

| Code | Type   | Context                 | Content                                |
| ---- | ------ | ----------------------- | -------------------------------------- |
| 9    | Inline | Email trống             | Không được để trống                    |
| 10   | Inline | Email không hợp lệ      | Email không hợp lệ                     |
| 11   | Inline | Tên người dùng trống    | Không được để trống                    |
| 12   | Inline | Tên người dùng quá ngắn | Tên người dùng phải có ít nhất 3 ký tự |
| 13   | Inline | Mật khẩu trống          | Không được để trống                    |
| 14   | Inline | Mật khẩu quá ngắn       | Mật khẩu phải có ít nhất 6 ký tự       |
| 15   | Inline | Xác nhận mật khẩu trống | Không được để trống                    |
| 16   | Inline | Mật khẩu không khớp     | Mật khẩu xác nhận không khớp           |

---

## 3. Pond Management Messages (Quản lý ao)

| Code | Type        | Context                   | Content                                              |
| ---- | ----------- | ------------------------- | ---------------------------------------------------- |
| 17   | Toast       | Tạo ao thành công         | Tạo ao thành công                                    |
| 18   | Toast       | Tạo ao thất bại           | Tạo thất bại                                         |
| 19   | Toast       | Cập nhật ao thành công    | Cập nhật thành công                                  |
| 20   | Toast       | Cập nhật ao thất bại      | Cập nhật thất bại                                    |
| 21   | Toast       | Xóa ao thành công         | Xóa thành công                                       |
| 22   | Toast       | Xóa ao thất bại           | Xóa thất bại                                         |
| 23   | CustomAlert | Tên hồ trống              | Vui lòng nhập tên hồ                                 |
| 24   | CustomAlert | Chưa chọn loại hồ         | Vui lòng chọn loại hồ                                |
| 25   | CustomAlert | Chưa chọn khu vực         | Vui lòng chọn khu vực                                |
| 26   | CustomAlert | Vị trí trống              | Vui lòng nhập vị trí                                 |
| 27   | CustomAlert | Chiều dài không hợp lệ    | Vui lòng nhập chiều dài hợp lệ và lớn hơn 0          |
| 28   | CustomAlert | Chiều rộng không hợp lệ   | Vui lòng nhập chiều rộng hợp lệ và lớn hơn 0         |
| 29   | CustomAlert | Độ sâu không hợp lệ       | Vui lòng nhập độ sâu hợp lệ và lớn hơn 0             |
| 30   | CustomAlert | Mực nước quá cao          | Mực nước phải nhỏ hơn độ sâu của hồ                  |
| 31   | CustomAlert | Dung tích không hợp lệ    | Vui lòng nhập dung tích hợp lệ và lớn hơn 0          |
| 32   | CustomAlert | Số cá tối đa không hợp lệ | Vui lòng nhập số lượng cá tối đa hợp lệ và lớn hơn 0 |

---

## 4. Koi Fish Management Messages (Quản lý cá Koi)

| Code | Type   | Context                                 | Content                              |
| ---- | ------ | --------------------------------------- | ------------------------------------ |
| 33   | Toast  | Tạo cá thành công                       | Tạo cá thành công                    |
| 34   | Toast  | Tạo cá thất bại                         | Tạo thất bại                         |
| 35   | Toast  | Cập nhật cá thành công                  | Cập nhật thành công                  |
| 36   | Toast  | Cập nhật cá thất bại                    | Cập nhật thất bại                    |
| 37   | Toast  | Xóa cá thành công                       | Xóa thành công                       |
| 38   | Toast  | Xóa cá thất bại                         | Xóa thất bại                         |
| 39   | Toast  | Chuyển ao thành công                    | Chuyển ao thành công                 |
| 40   | Toast  | Chuyển ao thất bại                      | Chuyển ao thất bại                   |
| 41   | Toast  | Đăng ký Re-ID thành công                | Đăng ký Re-ID thành công             |
| 42   | Toast  | Đăng ký Re-ID thất bại                  | Đăng ký Re-ID thất bại               |
| 43   | Toast  | Nhận diện thành công                    | Nhận diện thành công                 |
| 44   | Toast  | Nhận diện thất bại                      | Nhận diện thất bại                   |
| 45   | Inline | Chưa chọn bể                            | Vui lòng chọn bể                     |
| 46   | Inline | Chưa chọn giống                         | Vui lòng chọn giống                  |
| 47   | Inline | Chưa chọn loại                          | Vui lòng chọn loại                   |
| 48   | Inline | RFID trống                              | Vui lòng nhập mã RFID                |
| 49   | Inline | Chưa chọn chiều dài                     | Vui lòng chọn chiều dài              |
| 50   | Inline | Chưa chọn ngày sinh                     | Vui lòng chọn ngày sinh              |
| 51   | Inline | Chưa chọn giới tính                     | Vui lòng chọn giới tính              |
| 52   | Inline | Nguồn gốc trống                         | Vui lòng nhập nguồn gốc              |
| 53   | Inline | Chưa chọn tình trạng sức khỏe           | Vui lòng chọn tình trạng sức khỏe    |
| 54   | Inline | Chưa thêm ảnh                           | Vui lòng thêm ít nhất 1 ảnh          |
| 55   | Inline | Chưa thêm video                         | Vui lòng thêm ít nhất 1 video        |
| 56   | Inline | Giá bán không hợp lệ                    | Vui lòng nhập giá bán > 0            |
| 57   | Inline | Giới thiệu trống                        | Vui lòng nhập giới thiệu             |
| 58   | Inline | Ngày sinh tương lai                     | Không được chọn ngày trong tương lai |
| 59   | Inline | Loại đột biến trống (khi chọn Mutation) | Vui lòng nhập loại đột biến          |

---

## 5. Incident Management Messages (Quản lý sự cố)

| Code | Type        | Context                     | Content                                       |
| ---- | ----------- | --------------------------- | --------------------------------------------- |
| 60   | Toast       | Tạo sự cố thành công        | Tạo sự cố thành công                          |
| 61   | Toast       | Tạo sự cố thất bại          | Tạo thất bại                                  |
| 62   | Toast       | Cập nhật sự cố thành công   | Cập nhật thành công                           |
| 63   | Toast       | Cập nhật sự cố thất bại     | Cập nhật thất bại                             |
| 64   | Toast       | Xóa sự cố thành công        | Xóa thành công                                |
| 65   | Toast       | Xóa sự cố thất bại          | Xóa thất bại                                  |
| 66   | Toast       | Giải quyết sự cố thành công | Giải quyết thành công                         |
| 67   | Toast       | Giải quyết sự cố thất bại   | Giải quyết thất bại                           |
| 68   | Toast       | Hủy sự cố thành công        | Hủy sự cố thành công                          |
| 69   | Toast       | Hủy sự cố thất bại          | Hủy sự cố thất bại                            |
| 70   | CustomAlert | Thiếu thông tin bắt buộc    | Vui lòng điền đầy đủ thông tin bắt buộc.      |
| 71   | CustomAlert | Chuyển ao thất bại          | Không thể chuyển ao cho cá. Vui lòng thử lại. |

---

## 6. Work Schedule Messages (Quản lý lịch làm việc)

| Code | Type  | Context                           | Content                        |
| ---- | ----- | --------------------------------- | ------------------------------ |
| 72   | Toast | Tạo lịch làm việc thành công      | Tạo lịch làm việc thành công   |
| 73   | Toast | Tạo lịch làm việc thất bại        | Tạo thất bại                   |
| 74   | Toast | Cập nhật lịch làm việc thành công | Cập nhật thành công            |
| 75   | Toast | Cập nhật lịch làm việc thất bại   | Cập nhật thất bại              |
| 76   | Toast | Xóa lịch làm việc thành công      | Xóa thành công                 |
| 77   | Toast | Xóa lịch làm việc thất bại        | Xóa thất bại                   |
| 78   | Toast | Cập nhật trạng thái thành công    | Cập nhật trạng thái thành công |
| 79   | Toast | Cập nhật trạng thái thất bại      | Cập nhật trạng thái thất bại   |
| 80   | Toast | Hoàn thành nhiệm vụ thành công    | Hoàn thành nhiệm vụ thành công |
| 81   | Toast | Hoàn thành nhiệm vụ thất bại      | Hoàn thành nhiệm vụ thất bại   |

---

## 7. Water Parameter Record Messages (Thông số nước)

| Code | Type  | Context                     | Content                |
| ---- | ----- | --------------------------- | ---------------------- |
| 82   | Toast | Tạo bản ghi thành công      | Tạo bản ghi thành công |
| 83   | Toast | Tạo bản ghi thất bại        | Tạo thất bại           |
| 84   | Toast | Cập nhật bản ghi thành công | Cập nhật thành công    |
| 85   | Toast | Cập nhật bản ghi thất bại   | Cập nhật thất bại      |
| 86   | Toast | Xóa bản ghi thành công      | Xóa thành công         |
| 87   | Toast | Xóa bản ghi thất bại        | Xóa thất bại           |

---

## 8. Breeding Process Messages (Quy trình sinh sản)

| Code | Type  | Context                         | Content                                  |
| ---- | ----- | ------------------------------- | ---------------------------------------- |
| 88   | Toast | Tạo quy trình thành công        | Tạo quy trình thành công                 |
| 89   | Toast | Tạo quy trình thất bại          | Tạo thất bại                             |
| 90   | Toast | Cập nhật quy trình thành công   | Cập nhật thành công                      |
| 91   | Toast | Cập nhật quy trình thất bại     | Cập nhật thất bại                        |
| 92   | Toast | Xóa quy trình thành công        | Xóa thành công                           |
| 93   | Toast | Xóa quy trình thất bại          | Xóa thất bại                             |
| 94   | Toast | Chuyển trạng thái đẻ thành công | Chuyển trạng thái sang Đã đẻ thành công  |
| 95   | Toast | Chuyển trạng thái đẻ thất bại   | Chuyển trạng thái sang Đã đẻ thất bại    |
| 96   | Toast | Hủy quy trình thành công        | Hủy quy trình sinh sản thành công        |
| 97   | Toast | Hủy quy trình thất bại          | Hủy quy trình sinh sản thất bại          |
| 98   | Toast | Hoàn thành quy trình thành công | Hoàn thành quy trình sinh sản thành công |
| 99   | Toast | Hoàn thành quy trình thất bại   | Hoàn thành quy trình sinh sản thất bại   |

---

## 9. Egg Batch Messages (Quản lý lô trứng)

| Code | Type  | Context                         | Content                     |
| ---- | ----- | ------------------------------- | --------------------------- |
| 100  | Toast | Tạo lô trứng thành công         | Tạo lô trứng thành công     |
| 101  | Toast | Tạo lô trứng thất bại           | Tạo thất bại                |
| 102  | Toast | Cập nhật lô trứng thành công    | Cập nhật thành công         |
| 103  | Toast | Cập nhật lô trứng thất bại      | Cập nhật thất bại           |
| 104  | Toast | Xóa lô trứng thành công         | Xóa thành công              |
| 105  | Toast | Xóa lô trứng thất bại           | Xóa thất bại                |
| 106  | Toast | Tạo lô trứng thành công (modal) | Đã tạo lô trứng thành công! |

---

## 10. Incubation Daily Record Messages (Bản ghi ấp trứng hàng ngày)

| Code | Type   | Context                          | Content                                  |
| ---- | ------ | -------------------------------- | ---------------------------------------- |
| 107  | Toast  | Tạo bản ghi ương thành công      | Tạo bản ghi thành công                   |
| 108  | Toast  | Tạo bản ghi ương thất bại        | Tạo thất bại                             |
| 109  | Toast  | Cập nhật bản ghi ương thành công | Cập nhật thành công                      |
| 110  | Toast  | Cập nhật bản ghi ương thất bại   | Cập nhật thất bại                        |
| 111  | Toast  | Xóa bản ghi ương thành công      | Xóa thành công                           |
| 112  | Toast  | Xóa bản ghi ương thất bại        | Xóa thất bại                             |
| 113  | Toast  | Cập nhật ấp trứng thành công     | Đã cập nhật bản ghi ấp trứng!            |
| 114  | Toast  | Cập nhật ấp trứng thất bại       | Không thể cập nhật bản ghi               |
| 115  | Inline | Số trứng khỏe không hợp lệ       | Vui lòng nhập số lượng trứng khỏe hợp lệ |
| 116  | Inline | Số trứng nở không hợp lệ         | Vui lòng nhập số lượng trứng nở hợp lệ   |

---

## 11. Fry Fish Messages (Quản lý cá bột)

| Code | Type  | Context                       | Content                            |
| ---- | ----- | ----------------------------- | ---------------------------------- |
| 117  | Toast | Chuyển nuôi cá bột thành công | Chuyển sang nuôi cá bột thành công |
| 118  | Toast | Chuyển nuôi cá bột thất bại   | Chuyển sang nuôi cá bột thất bại   |
| 119  | Toast | Cập nhật cá bột thành công    | Cập nhật thành công                |
| 120  | Toast | Cập nhật cá bột thất bại      | Cập nhật thất bại                  |
| 121  | Toast | Xóa cá bột thành công         | Xóa thành công                     |
| 122  | Toast | Xóa cá bột thất bại           | Xóa thất bại                       |

---

## 12. Fry Survival Record Messages (Bản ghi sống sót cá bột)

| Code | Type   | Context                              | Content                       |
| ---- | ------ | ------------------------------------ | ----------------------------- |
| 123  | Toast  | Tạo bản ghi sống sót thành công      | Tạo bản ghi thành công        |
| 124  | Toast  | Tạo bản ghi sống sót thất bại        | Tạo thất bại                  |
| 125  | Toast  | Cập nhật bản ghi sống sót thành công | Cập nhật thành công           |
| 126  | Toast  | Cập nhật bản ghi sống sót thất bại   | Cập nhật thất bại             |
| 127  | Toast  | Xóa bản ghi sống sót thành công      | Xóa thành công                |
| 128  | Toast  | Xóa bản ghi sống sót thất bại        | Xóa thất bại                  |
| 129  | Toast  | Cập nhật bản ghi thành công (modal)  | Đã cập nhật bản ghi!          |
| 130  | Toast  | Không tìm thấy bản ghi               | Không tìm thấy bản ghi        |
| 131  | Inline | Số lượng không hợp lệ                | Vui lòng nhập số lượng hợp lệ |

---

## 13. Classification Stage Messages (Giai đoạn tuyển chọn)

| Code | Type  | Context                                  | Content                                     |
| ---- | ----- | ---------------------------------------- | ------------------------------------------- |
| 132  | Toast | Chuyển giai đoạn tuyển chọn thành công   | Chuyển sang giai đoạn tuyển chọn thành công |
| 133  | Toast | Chuyển giai đoạn tuyển chọn thất bại     | Chuyển giai đoạn tuyển chọn thất bại        |
| 134  | Toast | Cập nhật giai đoạn thành công            | Cập nhật thành công                         |
| 135  | Toast | Cập nhật giai đoạn thất bại              | Cập nhật thất bại                           |
| 136  | Toast | Xóa giai đoạn thành công                 | Xóa thành công                              |
| 137  | Toast | Xóa giai đoạn thất bại                   | Xóa thất bại                                |
| 138  | Toast | Hoàn tất giai đoạn tuyển chọn thành công | Hoàn tất giai đoạn tuyển chọn thành công    |
| 139  | Toast | Hoàn tất giai đoạn tuyển chọn thất bại   | Hoàn tất giai đoạn tuyển chọn thất bại      |

---

## 14. Classification Record Messages (Bản ghi phân loại)

| Code | Type   | Context                               | Content                          |
| ---- | ------ | ------------------------------------- | -------------------------------- |
| 140  | Toast  | Tạo bản ghi phân loại thành công      | Tạo bản ghi phân loại thành công |
| 141  | Toast  | Tạo bản ghi phân loại thất bại        | Tạo thất bại                     |
| 142  | Toast  | Cập nhật bản ghi phân loại thành công | Cập nhật thành công              |
| 143  | Toast  | Cập nhật bản ghi phân loại thất bại   | Cập nhật thất bại                |
| 144  | Toast  | Xóa bản ghi phân loại thành công      | Xóa thành công                   |
| 145  | Toast  | Xóa bản ghi phân loại thất bại        | Xóa thất bại                     |
| 146  | Toast  | Cập nhật bản ghi thành công (modal)   | Đã cập nhật bản ghi!             |
| 147  | Toast  | Không tìm thấy bản ghi                | Không tìm thấy bản ghi           |
| 148  | Inline | Số lượng không hợp lệ                 | Vui lòng nhập số lượng hợp lệ    |

---

## 15. Packet Fish Messages (Quản lý lô cá)

| Code | Type  | Context                   | Content              |
| ---- | ----- | ------------------------- | -------------------- |
| 149  | Toast | Tạo lô cá thành công      | Tạo lô cá thành công |
| 150  | Toast | Tạo lô cá thất bại        | Tạo thất bại         |
| 151  | Toast | Cập nhật lô cá thành công | Cập nhật thành công  |
| 152  | Toast | Cập nhật lô cá thất bại   | Cập nhật thất bại    |
| 153  | Toast | Xóa lô cá thành công      | Xóa thành công       |
| 154  | Toast | Xóa lô cá thất bại        | Xóa thất bại         |

---

## 16. Pond Packet Fish Messages (Lô cá trong ao)

| Code | Type  | Context                       | Content                 |
| ---- | ----- | ----------------------------- | ----------------------- |
| 155  | Toast | Tạo lô cá trong ao thành công | Tạo lô cá thành công    |
| 156  | Toast | Tạo lô cá trong ao thất bại   | Tạo thất bại            |
| 157  | Toast | Chuyển lô cá thành công       | Chuyển lô cá thành công |
| 158  | Toast | Chuyển lô cá thất bại         | Chuyển lô cá thất bại   |
| 159  | Toast | Xóa lô cá trong ao thành công | Xóa thành công          |
| 160  | Toast | Xóa lô cá trong ao thất bại   | Xóa thất bại            |

---

## 17. Upload Messages (Tải lên)

| Code | Type  | Context              | Content                  |
| ---- | ----- | -------------------- | ------------------------ |
| 161  | Toast | Tải ảnh thành công   | Tải ảnh lên thành công   |
| 162  | Toast | Tải ảnh thất bại     | Tải ảnh lên thất bại     |
| 163  | Toast | Tải video thành công | Tải video lên thành công |
| 164  | Toast | Tải video thất bại   | Tải video lên thất bại   |
| 165  | Toast | Hướng dẫn thử lại    | Vui lòng thử lại sau     |

---

## 18. Change Pond Messages (Chuyển ao)

| Code | Type  | Context                     | Content                |
| ---- | ----- | --------------------------- | ---------------------- |
| 166  | Toast | Chuyển ao cá bột thành công | Chuyển ao thành công   |
| 167  | Toast | Chuyển ao cá bột thất bại   | Chuyển ao thất bại     |
| 168  | Toast | Cần chọn ao mới             | Vui lòng chọn ao mới   |
| 169  | Toast | Cần nhập số lượng           | Vui lòng nhập số lượng |

---

## 19. Error Loading Messages (Lỗi tải dữ liệu)

| Code | Type  | Context                                 | Content                                             |
| ---- | ----- | --------------------------------------- | --------------------------------------------------- |
| 170  | Error | Không tải được danh sách lịch làm việc  | Không thể tải danh sách lịch làm việc               |
| 171  | Error | Không tải được lịch làm việc của bạn    | Không thể tải lịch làm việc của bạn                 |
| 172  | Error | Không tải được lịch làm việc nhân viên  | Không thể tải lịch làm việc của nhân viên           |
| 173  | Error | Không tải được lịch làm việc của hồ     | Không thể tải lịch làm việc của hồ                  |
| 174  | Error | Không tải được thông tin lịch làm việc  | Không thể tải thông tin lịch làm việc               |
| 175  | Error | Không tải được bản ghi thông số nước    | Không thể tải danh sách bản ghi thông số nước       |
| 176  | Error | Không tải được lô trứng                 | Không thể tải danh sách lô trứng                    |
| 177  | Error | Không tải được lô trứng cho quy trình   | Không thể tải lô trứng cho quy trình này            |
| 178  | Error | Không tải được bản ghi ương             | Không thể tải danh sách bản ghi ương                |
| 179  | Error | Không tải được tóm tắt bản ghi ương     | Không thể tải tóm tắt bản ghi ương                  |
| 180  | Error | Không tải được danh sách cá bột         | Không thể tải danh sách cá bột                      |
| 181  | Error | Không tải được thông tin cá bột         | Không thể tải thông tin cá bột                      |
| 182  | Error | Không tải được cá bột cho quy trình     | Không thể tải danh sách cá bột cho quy trình này    |
| 183  | Error | Không tải được tóm tắt cá bột           | Không thể tải tóm tắt cá bột cho cá bột này         |
| 184  | Error | Không tải được bản ghi sống sót         | Không thể tải danh sách bản ghi sống sót            |
| 185  | Error | Không tải được bản ghi phân loại        | Không thể tải danh sách bản ghi phân loại           |
| 186  | Error | Không tải được thống kê phân loại       | Không thể tải thống kê bản ghi phân loại            |
| 187  | Error | Không tải được giai đoạn phân loại      | Không thể tải danh sách giai đoạn phân loại         |
| 188  | Error | Không tải được giai đoạn cho quy trình  | Không thể tải giai đoạn phân loại cho quy trình này |
| 189  | Error | Không tải được danh sách lô cá          | Không thể tải danh sách lô cá                       |
| 190  | Error | Không tải được thông tin lô cá          | Không thể tải thông tin lô cá                       |
| 191  | Error | Không tải được lô cá khả dụng           | Không thể tải danh sách lô cá khả dụng              |
| 192  | Error | Không tải được lô cá theo kích thước    | Không thể tải danh sách lô cá theo kích thước       |
| 193  | Error | Không tải được lô cá theo khoảng giá    | Không thể tải danh sách lô cá theo khoảng giá       |
| 194  | Error | Không tải được lô cá trong ao           | Không thể tải danh sách lô cá trong ao              |
| 195  | Error | Không tải được thông tin lô cá trong ao | Không thể tải thông tin lô cá trong ao              |
| 196  | Error | Thông tin không hợp lệ (egg batch)      | Thông tin không hợp lệ                              |

---

## Tổng kết

| Loại Message      | Số lượng |
| ----------------- | -------- |
| Toast Success     | ~50      |
| Toast Error       | ~50      |
| Inline Validation | ~30      |
| CustomAlert       | ~10      |
| Error Loading     | ~30      |
| **Tổng cộng**     | **~196** |

---

_Tài liệu được tạo tự động từ source code của ZenKoi Mobile App._
