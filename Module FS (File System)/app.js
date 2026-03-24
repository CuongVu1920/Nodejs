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

fs.readFile("./test.txt", "utf8", (err, data) => {
    console.log(err);
    
    console.log(data);
});


