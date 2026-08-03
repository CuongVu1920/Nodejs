// Exchange trong RabbitMQ

/**
 * Trong RabbitMQ, Exchange đóng vai trò là một "người bưu tá" (messenger). Khi Producer gửi một tin nhắn, nó không bao giờ gửi trực tiếp vào Queue.
 * Thay vào đó, nó gửi tới Exchange. Công việc của Exchange là nhận tin nhắn và quyết định đẩy nó vào Queue nào dựa trên các quy tắc gọi là Bindings.
 *
 * - Hiểu Binding:
 *  Binding là một mối quan hệ giữa Exchange và Queue. Nó xác định cách mà tin nhắn từ Exchange sẽ được gửi tới Queue nào.
 *  Mỗi Binding có thể có một "routing key" để xác định rõ ràng hơn cách tin nhắn được phân phối.
 *
 * 1. Direct Exchange: (Đúng địa chỉ)
 * Đây là loại đơn giản nhất. Tin nhắn sẽ được đưa vào Queue nào có Routing Key khớp hoàn toàn với Routing Key mà Producer gửi lên.
 *  - Đặc điểm: so khớp 1:1
 *  - Ví dụ: bạn gửi log với key "error", thì chỉ có Queue nào bind với key "error" mới nhận được tin nhắn đó. Queue nhận "info" sẽ không nhận được.

 * 2. Fanout Exchange: (Phát tán)
 * Tin nhắn sẽ được gửi tới tất cả các Queue được bind với Exchange, bất kể Routing Key là gì. Nó bỏ qua mọi Routing Key và copy tín nhắn gửi đến tất cả các Queue đang kết nối (bind) với nó.
 *  - Đặc điểm: phát tán rộng rãi
 *  - Ví dụ: Khi có đơn hàng mới, bạn muốn đồng thời: gửi Email, thông báo cho kho, và tích điểm cho khách. Mỗi dịch vụ có 1 Queue riêng, Fanout sẽ đẩy tin nhắn vào cả 3 Queue đó cùng lúc
 *   mà không cần quan tâm đến Routing Key.

 * 3. Topic Exchange: (Phân loại thông minh)
 * Tin nhắn sẽ được gửi tới các Queue dựa trên một mẫu (pattern) của Routing Key. Mẫu này có thể chứa ký tự đại diện như "*" (một từ) và "#" (nhiều từ).
 *  - Đặc điểm: linh hoạt, dựa trên mẫu
 *  - Ví dụ: bạn gửi log với key "user.error", Queue bind với pattern "user.*" sẽ nhận được tin nhắn, nhưng Queue bind với pattern "order.*" sẽ không nhận được. 
 *    Nếu bạn bind với pattern "user.#", thì Queue đó sẽ nhận tất cả các tin nhắn bắt đầu bằng "user.". kiểu như "user.error", "user.info", "user.update.profile" đều sẽ được nhận.
 *    còn nếu bạn bind với pattern "user.*", thì Queue đó chỉ nhận các tin nhắn có đúng 2 phần, ví dụ "user.error" hoặc "user.info", nhưng không nhận "user.update.profile" vì nó có 3 phần.
 * 
 * 4. Headers Exchange: (Dựa trên tiêu đề)
 * Tin nhắn sẽ được gửi tới các Queue dựa trên các tiêu đề (headers) của tin nhắn thay vì Routing Key. Bạn có thể định nghĩa các tiêu đề và giá trị mà Queue mong muốn nhận.
 *  - Đặc điểm: dựa trên tiêu đề, linh hoạt
 *  - tham số đặc biệt:
 *   - x-match: "all" (tất cả tiêu đề phải khớp) hoặc "any" (ít nhất một tiêu đề khớp)
 *  - Ví dụ: bạn gửi tin nhắn với tiêu đề { "type": "notification", "priority": "high" }, Queue bind với tiêu đề { "type": "notification" } sẽ nhận được tin nhắn đó.
 *    Nếu bạn bind với tiêu đề { "type": "notification", "priority": "high" }, thì Queue đó chỉ nhận được tin nhắn khi cả hai tiêu đề khớp.
 */
