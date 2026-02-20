<template>
  <p v-if="loading">🔍 Sto cercando lead...</p>
  
  <div v-show="!loading">
    <h2>LeadGen</h2>
    <div id="map" style="height:500px;width:600px;"></div>

    <ul>
      <li v-for="lead in currLeads" :key="lead.name">
        {{ lead.name }}
      </li>
    </ul>
  </div>
  <button v-if="currLeads.length > 0" @click="saveLeads(); exportCSV()">
    📥 Esporta
  </button>
  <button v-if="currLeads.length > 0" @click="saveLeads">
    📥 Salva Leads
  </button>
  <button v-if="currLeads.length > 0" @click="clearLeads">
    🗑️ Clear Leads History
  </button>
</template>

<script setup>
import { onMounted, ref } from "vue"
import L from "leaflet"
import axios from "axios"

const currLeads = ref([])
const savedLeads = ref([])
const loading = ref(false)

onMounted(() => {
  // load saved leads from server file
  ;(async () => {
    try {
      const res = await fetch("http://localhost:3000/leads")
      if (res.ok) savedLeads.value = await res.json()
      else savedLeads.value = []
    } catch (e) {
      console.warn("Unable to load saved leads from server, falling back to localStorage", e)
      savedLeads.value = JSON.parse(localStorage.getItem("savedLeads")) || []
    }
  })()
  const map = L.map("map").setView([45.5455, 11.5470], 13)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
  }).addTo(map)

  map.on("click", async (e) => {
    loading.value = true
    //mando dati
    const response = await fetch("http://localhost:3000/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        radius: 2000,
        type: "restaurant"
      })
    })

    const data = await response.json()

    currLeads.value = data
    loading.value = false

    //search history update
    const search = {
      lat: e.latlng.lat,
      lng: e.latlng.lng,
      radius: 2000,
      type: "restaurant",
      date: new Date().toISOString()
    }

    const history = JSON.parse(localStorage.getItem("searchHistory")) || []
    history.push(search)
    localStorage.setItem("searchHistory", JSON.stringify(history))
  })
})

function clearLeads() {
  // delete server-side saved leads file and clear local ref
  ;(async () => {
    try {
      const res = await fetch("http://localhost:3000/leads", { method: "DELETE" })
      if (res.ok) {
        savedLeads.value = []
        localStorage.removeItem("savedLeads")
      }
    } catch (e) {
      console.error("Impossibile cancellare savedLeads sul server", e)
    }
  })()
}

function saveLeads(){
  // send current leads to server to be saved into file (server deduplicates)
  ;(async () => {
    try {
      const res = await fetch("http://localhost:3000/leads/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currLeads.value)
      })
      if (res.ok) {
        // refresh savedLeads from server
        const all = await (await fetch("http://localhost:3000/leads")).json()
        savedLeads.value = all
        // keep a local copy as fallback
        localStorage.setItem("savedLeads", JSON.stringify(all))
      } else {
        console.error("Save request failed")
      }
    } catch (e) {
      console.error("Errore nella richiesta di salvataggio, fallback a localStorage", e)
      // fallback: save to localStorage as before
      const existingLeads = JSON.parse(localStorage.getItem("savedLeads")) || []
      const keyFor = (l) => l?.place_id ?? `${l?.name || ""}|${l?.address || ""}`
      const map = new Map()
      existingLeads.forEach(l => map.set(keyFor(l), l))
      currLeads.value.forEach(l => { const k = keyFor(l); if (!map.has(k)) map.set(k, l) })
      const combinedLeads = Array.from(map.values())
      localStorage.setItem("savedLeads", JSON.stringify(combinedLeads))
      savedLeads.value = combinedLeads
    }
  })()
}

function exportCSV() {
    // Definisci le intestazioni e i dati per il CSV
    const headers = ["Name","Address","Phone","Rating","Reviews","GoogleMapsLink"]

    const rows = savedLeads.value.map(lead => [
      lead.name,
      lead.address || "",
      lead.phone || "",
      lead.rating || "",
      lead.reviews || "",
      `https://www.google.com/maps/place/?q=place_id:${lead.place_id}`
    ])

    const csvContent =
      [headers, ...rows]
        .map(row => row.join(";"))
        .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "leads.csv"
    a.click()

    URL.revokeObjectURL(url)
  }
</script>