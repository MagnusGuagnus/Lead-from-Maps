<template>
  <div>
    <h2>LeadGen</h2>
    <div id="map" style="height:500px;width:600px;"></div>

    <ul>
      <li v-for="lead in leads" :key="lead.name">
        {{ lead.name }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue"
import L from "leaflet"
import axios from "axios"

const leads = ref([])

onMounted(() => {
  const map = L.map("map").setView([45.5455, 11.5470], 13)

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
  }).addTo(map)

  map.on("click", async (e) => {
    //mando dati
    await fetch("http://localhost:3000/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        radius: 2000,
        type: "restaurant"
      })
    })

    const response = await axios.post("http://localhost:3000/search", {
      lat: e.latlng.lat,
      lng: e.latlng.lng,
      radius: 2000,
      type: "restaurant"
    })

    leads.value = response.data
  })
})
</script>