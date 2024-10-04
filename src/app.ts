import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes";
import productRoutes from "./routes/protuct.routes";
import { errorHandler } from "./middlewares/errorHandler";
const app = express();

// Middleware
app.use(
    cors({
        origin: ["http://localhost:3000"],
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);

// Error handling middleware
app.use(errorHandler);
export { app };
