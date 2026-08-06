# DLX

1. Queue chính "work_queue" (nơi mà worker lấy ra để xử lý) --> Nếu lỗi --> gọi nack để chuyển sang DLX

2. Queue chờ "retry_queue" (nơi mà message được gửi đến khi worker xử lý lỗi) --> Lưu trữ tạm thời 10 giây --> gửi lại message vào queue chính "work_queue"

3. Bộ đếm: Mỗi lần quay lại queue chính "work_queue" thì tăng bộ đếm lên 1. (Dùng header "x-retry-count" để lưu trữ số lần retry)

giới hạn số lần retry: 3 lần

Nếu sau 3 lần --> vẫn lỗi --> đẩy sang Dead Letter Queue (DLQ) để lưu trữ phân tích sau hoặc xóa bỏ.
