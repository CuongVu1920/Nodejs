# DLX

1. Queue chính "work_queue" (nơi mà worker lấy ra để xử lý) --> Nếu lỗi --> gọi nack để chuyển sang DLX

2. Queue chờ "retry_queue" (nơi mà message được gửi đến khi worker xử lý lỗi) --> Lưu trữ tạm thời 10 giây --> gửi lại message vào queue chính "work_queue"

3. Bộ đếm: Mỗi lần quay lại queue chính "work_queue" thì tăng bộ đếm lên 1. (Dùng header "x-retry-count" để lưu trữ số lần retry)

giới hạn số lần retry: 3 lần

Nếu sau 3 lần --> vẫn lỗi --> đẩy sang Dead Letter Queue (DLQ) để lưu trữ phân tích sau hoặc xóa bỏ.

# BullMQ

là một thư viện Node.js mạnh mẽ để quản lý hàng đợi công việc (job queues) và xử lý các tác vụ bất đồng bộ. Nó được xây dựng trên Redis và cung cấp các tính năng như:

- Hỗ trợ các loại hàng đợi khác nhau (queues, jobs, workers).
- Quản lý trạng thái công việc (pending, completed, failed).
- Hỗ trợ retry tự động cho các công việc thất bại.
- Hỗ trợ các sự kiện (events) để theo dõi trạng thái công việc.

1. Job Queue (Hàng đợi công việc) - ví dụ: BullMQ sử dụng Redis để lưu trữ các công việc trong hàng đợi. Mỗi công việc được định nghĩa bởi một payload (dữ liệu) và có thể có các thuộc tính như priority, delay, attempts, v.v.

Mục đích: thực thi một tác vụ cụ thể ở nền, thường bởi chính hệ thống của bạn (không giao tiếp giữa nhiều service khác nhau).

Đặc điểm:

- Job có trạng thái vòng đời rõ ràng: waiting, active, completed, failed, delayed.
- Thường có 1 loại "người tiêu thụ" (worker) duy nhất để xử lý công việc. biết chính xác cách xử lý job đó (vì worker được viết trong cùng codebase, cùng hệ thống)
- Tập trung vào: retry, delay, priority, concurrency, rate limiting, job events, job progress, job logs.
- Ví dụ: "Xử lý ảnh này", "Gửi email xác nhận", "Tạo báo cáo hàng ngày", "Chạy job lúc 2h sáng mỗi ngày"
- Sau khi job hoàn thành, nó kết thúc luôn - không có khái niệm "nhiều consumer đều nhận được job này" (không có pub/sub)

=> Tóm gọn: Job Queue = "làm việc X, báo tôi biết đã xong chưa, nếu lỗi thì thử lại"

2. Message Queue (Hàng đợi tin nhắn) - ví dụ: RabbitMQ, Kafka, SQS, v.v.

Mục đích: giao tiếp giữa nhiều service khác nhau, thường là các service độc lập (microservices) hoặc các hệ thống khác nhau. Service A gửi thông điệp, service B (hoặc C, D...) nhận thông điệp đó và xử lý.

Đặc điểm:

- Tập trung vào việc truyền dữ liệu/sự kiện giữa các hệ thống độc lập, không nhất thiết biết ai sẽ xử lý
- Có các mô hình phân phối phức tạp hơn:
  - Pub/Sub: một message có thể được nhiều consumer đều nhận (broadcast)
  - Routing/Exchange (RabbitMQ): định tuyến message dựa trên các tiêu chí (routing key, topic, fanout)
  - Partition & Offset (Kafka): dùng để xử lý luồng dữ liệu (streaming) cực lớn, cho phép "replay" lại message cũ
  - Nhấn mạnh vào: độ tin cậy truyền tải, thứ tự, khả năng mở rộng giữa nhiều service
  - Ví dụ: "user-registered event" được gửi đi, rồi service Email, service Analytics, service CRM đều lắng nghe event đó và tự xử lý theo cách riêng.

  Tóm gọn: Message Queue = "sự kiện X đã xảy ra, ai quan tâm thì tự lấy mà xử lý"

3. Concurrency Worker (Đa luồng xử lý) - ví dụ: BullMQ Worker, RabbitMQ Consumer

Mục đích: xử lý các công việc hoặc tin nhắn từ hàng đợi một cách song song, tăng hiệu suất và khả năng mở rộng.

Đặc điểm:

- Worker có thể được cấu hình để xử lý nhiều công việc cùng lúc (concurrency), giúp tận dụng tối đa tài nguyên hệ thống.
- Worker có thể được triển khai trên nhiều instance hoặc máy chủ khác nhau, cho phép mở rộng theo nhu cầu.
- Worker thường có cơ chế retry, delay, và quản lý trạng thái công việc để đảm bảo rằng các công việc được xử lý một cách đáng tin cậy.
- Worker có thể lắng nghe các sự kiện từ hàng đợi để thực hiện các hành động cụ thể khi công việc hoàn thành, thất bại, hoặc bị hủy bỏ.

- Ví dụ: Trong BullMQ, bạn có thể tạo một Worker để xử lý các công việc từ một hàng đợi cụ thể, và bạn có thể cấu hình số lượng công việc mà Worker có thể xử lý đồng thời bằng cách sử dụng tùy chọn concurrency.

  Tóm gọn: Concurrency Worker = "tôi sẽ xử lý nhiều job/message cùng lúc, nếu lỗi thì thử lại, nếu xong thì báo lại"
