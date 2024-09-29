import dotenv from "dotenv";
import connectDB from "./db/db";
import { app } from "./app";

dotenv.config({
    path: "./.env",
});

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 5000, () => {
            console.log(`Server is running at port : ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    });

app.get("/", (req, res) => {
    res.send("Server is running");
});
