/**
 * Module FS (file system) trong Nodejs
 * 
 * Để sử dụng, bạn cần nạp module vào
 *  const fs = require('fs'); // đối với commonJS
 *  hoặc import fs from 'fs'; // Đối với ES Modules
 */

// const fs = require('fs');

/**
 * a. Đọc file
 *  - đồng bộ: 
 *      const data = fs.readFileSync('./test.txt', 'utf8');
 *      log(data)
 *  - bất đồng bộ (Callback)
 *      fs.readFile('./test.txt', 'utf8', (err, data) => {
 *          if (err) throw err;
 *          log(data);
 * });
 */

// const data = fs.readFileSync("./test.txt", 'utf8');
// console.log(data);

// fs.readFile("./test.txt", "utf8", (err, data) => {
//     console.log(err);
    
//     console.log(data);
// });

/**
 * b. Ghi file
 *  Lưu ý: nếu file đã tồn tại, các hàm này sẽ ghi đè nội dung cũ
 *    - Đồng bộ: 
 *          fs.writeFileSync('./output.txt', 'Nội dung mới');
 *    - Bất đồng bộ:
 *          fs.writeFile('./output.txt', 'Nội dung mới', (err) => {
 *              if (err) throw err;
 *              
 *              log(ghi file thành công)
 *          })
 */

// const result = fs.writeFileSync('./test.txt', "Nội dung mới");

// console.log(result); // undefined

// fs.writeFile("./test.txt", "Hello Cuong Vu", (err) => {
//     console.log(err);
// })


/**
 * c. Thêm nội dung vào file
 *  - Nếu bạn không muốn ghi đè mà chỉ muốn nối thêm nội dung vào cuối file.
 *      fs.appendFile("./test.txt", '\n Đây là dòng nối thêm.', (err) => {
 *          if (err) throw err;
 * 
 *          log("đã nối thêm!")
 *      })
 */

// fs.appendFileSync('./test.txt', '\nĐây là Nội dung mới');

// fs.appendFile("./test.txt", "\n Nội dung mới bất đồng ahihi", (err) => {
//     if (err) throw(err);

//     console.log("Okela");
// })

/**
 * d. Xóa file (Deleting files)
 *  - đồng bộ: fs.unlinkSync('./test.txt')
 *  - bất đồng bộ
 *      fs.unlink('./test.txt', (err) => {
 *          log(err)
 *      })
 */

// const reusult = fs.unlinkSync('./test.txt');
// console.log(reusult);

// fs.unlink("./test.txt", (err) => {
//     console.log(err);
// })


// 3. Cách tiếp cận hiện đại: FS Promises

/**
 * thay vì dùng "callback" (dẫn đến callback Hell), Nodejs cung cấp phiên bản Promise để bạn có thể dùng async/await,
 * giúp code trông sạch sẽ như code đồng bộ nhưng vẫn giữ được hiệu năng của bất đồng bộ
 */

// const fs = require("fs/promises");

// const data = fs.readFile('./test.txt');
// data
//     .then(data => {
//         console.log(data.toString());
//     })


// const readFile = async () => {
//     try {
//         const dataBuffer = await fs.readFile('./test.txt'); 
//         const data = dataBuffer.toString();
//         console.log(data);
//     } catch (error) {
//         console.log(error);
//     }
// }

// readFile();

// const writeFile = async(content) => {
//     try {
//         await fs.writeFile('./test.txt1', content);
//     } catch (error) {
//         console.log(error);
//     }
// }

// writeFile("/n Nội dung mới")

// const appendFile = async(content) => {
//     try {
//         await fs.appendFile("test2.txt", content)
//     } catch (error) {
//         console.log(error);
//     }
// }

// appendFile("new content");

// lưu ý: appendFile vs writeFile nếu file k tồn tại thì sẽ tạo ra file mới còn với readFile thì sẽ báo lỗi

// const deleteFile = async () => {
//     try {
//         fs.unlink("./test3.txt")
//     } catch (error) {
//         console.log(error);
//     }
// }

// deleteFile();

/**
 * 4. Một số hàm hữu ích khác
 *  - fs.rename(): đổi tên hoặc di chuyển file
 *  - fs.mkdir(): tạo thư mục mới
 *  - fs.readdir(); đọc danh sách các file trong một thư mục
 *  - fs.exits() (đã cũ) => Hiện nên dùng fs.access() hoặc fs.start() để kiểm tra file có tồn tại hay k.
 * 
 * Lưu ý quan trọng: 
 *  - luôn chỉ định bảng mã "utf8" khi đọc file văn bản, nếu k Nodejs sẽ trả về một đối tượng Buffer (dữ liệu nhị phân) mà bạn sẽ 
 *    k đọc được bằng mắt thường.
 */

const fs = require("fs/promises");

// const renameFile = async () => {
//     try {
//         await fs.rename('new-name.txt', './utils/new-name.txt')
//     } catch (error) {
//         console.log(error);
//     }
// }

// renameFile();

const createFolder = async () => {
    try {
        await fs.mkdir('data');
        await fs.mkdir('data/sub')
    } catch (error) {
        console.log(error);
    }
}

createFolder();