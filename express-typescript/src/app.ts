import "dotenv/config";
import express, { Application } from "express";
import path from "path";
import expressLayouts from "express-ejs-layouts";
import routerWeb from "./routes/web.route";
import "./schedulers";
import "./subscribers/order.subscribe";
import "./consumers/index.consumer";
import {
  errorHandlerLingMiddleware,
  notFoundMiddleware,
} from "./middlewares/error.middleware";
import routerApi from "./routes/api.route";
import session from "express-session";
import flash from "connect-flash";
import morgan from "morgan";
const app: Application = express();
const port: number = 3000;

app.use(morgan("tiny")); // Sử dụng morgan để log các yêu cầu HTTP
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Config view engine EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Config layouts
app.set("layout", "layouts/main.layout.ejs");
app.set("layout extractScripts", true);

// Use layouts sau cùng
app.use(expressLayouts);

app.set("trust proxy", true); // Cấu hình để Express tin tưởng proxy (nếu có)
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" }, // Chỉ gửi cookie qua HTTPS neu set secure: true, nhưng trong môi trường phát triển thường để false
  }),
);

app.use(flash());

// Routes
app.use(routerWeb);
app.use("/api", routerApi);
app.use(notFoundMiddleware);
app.use(errorHandlerLingMiddleware);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
