import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import clientRoutes from "./routes/client.route.js";
import surveyRoutes from "./routes/survey.route.js";
import disputeRoutes from "./routes/dispute.route.js";
import surveyorRoutes from "./routes/surveyor.routes.js";
import adminRoutes from "./routes/admin.routes.js";

dotenv.config();

const app = express();
app.use(express.json());

connectDB();
app.use(cors(
    {
        credentials: true
    }
));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
    res.send("API is running...");
});

app.use('/api', surveyorRoutes);
app.use("/api", clientRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", surveyRoutes);
app.use('/api', disputeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });