import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/price", async (req, res) => {
  try {
    const response = await axios.post("http://localhost:8000/predict", req.body);
    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Prediction service unavailable" });
  }
});

export default router;
