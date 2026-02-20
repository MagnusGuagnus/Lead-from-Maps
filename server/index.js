import express from "express"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()

const PORT = process.env.PORT || 3000
const FRONTEND_URL = process.env.FRONTEND_URL
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
const app = express()

app.use(cors())
app.use(express.json())

//ricevo dati
app.post("/search", (req, res) => {
  console.log("Dati ricevuti:", req.body)

  res.json({
    message: "Ricevuto",
    data: req.body
  })
})

app.listen(PORT, () => {
  console.log(`Server attivo su http://localhost:${PORT}`)
})