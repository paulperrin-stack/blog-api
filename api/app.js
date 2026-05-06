import "dotenv/config";
import express from "express";
import cors from "cors";
import passport from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use("/auth", authRoutes);
app.use("/posts", postRoutes);

app.use((err, res, req, next) => {
    console.err(err);
    res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));