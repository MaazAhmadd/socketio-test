import express, { Request, Response } from "express";
const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    res.send(url);
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;
