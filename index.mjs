import a, { sayHello } from "./utils/math2.mjs";
import moment from "moment";

// console.log(sayHello("Cuong Vu"));
// console.log(a);

// console.log(moment().format('DD/MM/YYYY HH:mm:ss'));

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

console.log(path.basename(__filename));

