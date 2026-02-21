import express from "express"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const historyFile = path.join(__dirname, "../data/searchHistory.json")

const router = express.Router()

router.post("/", async (req, res) => {
    try {
        console.log("Dati ricevuti per la cronologia:", req.body)
        const { searchHistory } = req.body

        if (!searchHistory || !Array.isArray(searchHistory)) {
            return res.status(400).json({ error: "searchHistory non valido o mancante" })
        }

        // Assicurati che la cartella data esista
        const dataDir = path.join(__dirname, "../data")
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true })
        }

        // Salva i dati nel file
        fs.writeFileSync(historyFile, JSON.stringify(searchHistory, null, 2))
        console.log("Cronologia salvata in:", historyFile)

        res.json({ success: true, message: "Cronologia salvata correttamente", count: searchHistory.length })
    } catch (err) {
        console.error("Errore nel salvataggio della cronologia:", err)
        res.status(500).json({ error: "Errore nel salvataggio della cronologia" })
    }
})

router.get("/", (req, res) => {
    try {
        if (fs.existsSync(historyFile)) {
            const data = fs.readFileSync(historyFile, "utf-8")
            const searchHistory = JSON.parse(data)
            res.json({ success: true, searchHistory })
        } else {
            res.json({ success: true, searchHistory: [] })
        } 
    } catch (err) {
        console.error("Errore nel recupero della cronologia:", err)
        res.status(500).json({ error: "Errore nel recupero della cronologia" })
    }  
})
export default router