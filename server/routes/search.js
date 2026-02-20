import express from "express"
import { searchPlaces } from "../services/googlePlaces.js"

const router = express.Router()

router.post("/", async (req, res) => {
    console.log("Dati ricevuti:", req.body)
    const { lat, lng, radius, type } = req.body

    if (!lat || !lng) {
        return res.status(400).json({ error: "Lat/Lng mancanti" })
    }

    try {
        const leads = await searchPlaces(lat, lng, radius, type)
        res.json(leads)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Errore Google API" })
    }
})
export default router