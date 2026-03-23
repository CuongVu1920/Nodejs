// const  { add, substract } = require("./utils/math");

// console.log(add(10, 5));
// console.log((substract(2, 8)));

// console.log(__dirname);

// const moment = require('moment');

// console.log(moment().format('DD/MM/YYYY HH:mm:ss'));

// const path = require('path');
// console.log(path.basename(__filename));

const path = require('path');
const fullPath = path.join('users', 'settings', 'config.json'); // Nối đường dẫn 

// console.log(fullPath); // users\settings\config.json


// b. path.resolve(...paths) (lấy đường dẫn tuyệt đối)
// const absolutePatch = path.resolve(fullPath); 
// console.log(absolutePatch); // D:\Nodejs\CommonJS và ES Modules trong NodeJS\users\settings\config.json

// c. path.basename(p) (Lay ten file)

// const filename = path.basename(fullPath, ".json");
// console.log(filename);


// d. path.extname(p) (lay duoi file)

// const ext = path.extname(fullPath);
// console.log(ext); // .json

// e. path.parse(p) (phan tach toan dien) => tra ve 1 duoi tuong chua tat ca thong tin cua duong dan

// const info = path.parse(fullPath);
// console.log(info);

// {
//   root: '',
//   dir: 'users\\settings',
//   base: 'config.json',
//   ext: '.json',
//   name: 'config'
// }

/**
 * Trong NodeJs (chuẩn CommonJS), bạn luôn có sẵn 2 biến này (__dirname và __filename) mà không cần khai báo.
 *  - __dirname: trả về đường dẫn tuyệt đối đến thư mục chứa file đang chạy
 *  - __filename: trả về đường dẫn tuyệt đối đến chính file đang chạy
 * 
 * # Ứng dụng thực tế thường gặp
 *  - khi bạn muốn đọc 1 file data.json nằm cùng thư mục với file code:
 *      const dataPath = path.join(__dirname, 'data.json');
 *      console.log("Đường dẫn file cần tìm là: ", dataPath);
 */

// console.log(__dirname); // D:\Nodejs\CommonJS và ES Modules trong NodeJS
// console.log(__filename); // D:\Nodejs\CommonJS và ES Modules trong NodeJS\app.js

const dataPath = path.join(__dirname, "data.json");
console.log(dataPath);

