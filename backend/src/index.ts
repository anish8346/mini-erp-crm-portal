import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'Mini ERP + CRM Backend API',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`[Backend Server] Running on http://localhost:${PORT}`);
});
