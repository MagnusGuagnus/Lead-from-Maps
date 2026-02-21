<template>
  <p v-if="loading">🔍 Sto cercando lead...</p>
  
  <div v-show="!loading">
    <h2>LeadGen</h2>
    <div id="map" style="height:500px;width:600px;"></div>
    
    <div style="margin-top: 10px;">
      <label>
        📍 Raggio: <strong>{{ radius }}m</strong>
        <input type="range" v-model.number="radius" min="500" max="5000" step="100" style="width: 300px;">
      </label>
    </div>

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
const lastSearch = ref(null)
const radius = ref(2000)

onMounted(() => {
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
        radius: radius.value,
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
      radius: radius.value,
      type: "restaurant",
      date: new Date().toISOString()
    }
    lastSearch.value = search
  })
})

function clearLeads() {
  // Rimuove i lead salvati sia dallo stato che da localStorage
  localStorage.setItem("savedLeads", JSON.stringify([]))
  localStorage.setItem("searchHistory", JSON.stringify([]))
  savedLeads.value = []
}

function saveLeads(){
  // Combina i lead esistenti con quelli attuali, evitando duplicati
  const existingLeads = JSON.parse(localStorage.getItem("savedLeads")) || []
  const keyFor = (l) => l?.place_id ?? `${l?.name || ""}|${l?.address || ""}`
  const map = new Map()
  existingLeads.forEach(l => map.set(keyFor(l), l))
  currLeads.value.forEach(l => { const k = keyFor(l); if (!map.has(k)) map.set(k, l) })
  const combinedLeads = Array.from(map.values())
  localStorage.setItem("savedLeads", JSON.stringify(combinedLeads))
  savedLeads.value = combinedLeads

  // Aggiorna la cronologia delle ricerche aggiungendo l'ultima ricerca
  const searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || []
  if (lastSearch.value) {
    searchHistory.push(lastSearch.value)
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory))
  }
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