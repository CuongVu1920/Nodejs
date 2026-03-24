/**
 * Module FS (file system) trong Nodejs
 * 
 * Để sử dụng, bạn cần nạp module vào
 *  const fs = require('fs'); // đối với commonJS
 *  hoặc import fs from 'fs'; // Đối với ES Modules
 */

const fs = require('fs');

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

fs.unlink("./test.txt", (err) => {
    console.log(err);
})