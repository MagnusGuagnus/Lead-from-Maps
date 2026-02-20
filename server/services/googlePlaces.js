import axios from "axios"


export async function searchPlaces(lat, lng, radius, type) {
  const nearbyResponse = await axios.get(
    "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
    {
      params: {
        location: `${lat},${lng}`,
        radius,
        type,
        key: process.env.GOOGLE_API_KEY
      }
    }
  )

  const results = nearbyResponse.data.results
  console.log("Google Nearby trovati:", results.length)
  const leads = []

  for (const place of results) {
    const detailsResponse = await axios.get(
      "https://maps.googleapis.com/maps/api/place/details/json",
      {
        params: {
          place_id: place.place_id,
          fields: "name,website,formatted_phone_number,formatted_address,rating,user_ratings_total",
          key: process.env.GOOGLE_API_KEY
        }
      }
    )

    const details = detailsResponse.data.result

    if (!details.website) {
      leads.push({
        name: details.name,
        address: details.formatted_address,
        phone: details.formatted_phone_number || null,
        rating: details.rating || null,
        reviews: details.user_ratings_total || 0,
        place_id: place.place_id
      })
    }
  }

  return leads
}