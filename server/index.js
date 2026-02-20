//prima di tutto importo i dotenv
import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"
import searchRoute from "./routes/search.js"

const app = express()

app.use(cors())
app.use(express.json())

//ricevo dati
app.use("/search", searchRoute)

app.listen(process.env.PORT, () => {
  console.log(`Server attivo su http://localhost:${process.env.PORT}`)
})