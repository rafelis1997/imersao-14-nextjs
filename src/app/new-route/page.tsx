'use client'

import type { DirectionsResponseData, FindPlaceFromTextResponseData } from "@googlemaps/google-maps-services-js";
import { FormEvent, useRef, useState } from "react";
import { useMap } from "../hooks/use-map";


export default function NewRoutePage() {
  const [directionsData, setDirectionsData] = useState<DirectionsResponseData & { request: any }>()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const map = useMap(mapContainerRef)

  async function handleSearchRoute(event: FormEvent) {
    event.preventDefault()
    const source = (document.getElementById("source") as HTMLInputElement).value
    const destination = (document.getElementById("destination") as HTMLInputElement).value

    const [sourceResponse, destinationResponse] = await Promise.all([
      fetch(`http://localhost:3000/places?text=${source}`),
      fetch(`http://localhost:3000/places?text=${destination}`)
    ])

    const [sourcePlace, destinationPlace]: FindPlaceFromTextResponseData[] = await Promise.all([
      sourceResponse.json(),
      destinationResponse.json()
    ])

    if (sourcePlace.status !== 'OK') {
      console.error(sourcePlace)
      alert('Não foi possivel carregar origem')
      return
    }

    if (destinationPlace.status !== 'OK') {
      console.error(destinationPlace)
      alert('Não foi possivel carregar destino')
      return
    }

    const placeSourceId = sourcePlace.candidates[0].place_id
    const placeDestinationId = destinationPlace.candidates[0].place_id

    const directionsResponse = await fetch(
      `http://localhost:3000/directions?originId=${placeSourceId}&destinationId=${placeDestinationId}`
    )

    const directionsData: DirectionsResponseData & { request: any } = await directionsResponse.json()

    setDirectionsData(directionsData)

    map?.removeAllRoutes()

    await map?.addRouteWithIcons({
      routeId: '1',
      startMarkerOptions: {
        position: directionsData.routes[0].legs[0].start_location,
      },
      endMarkerOptions: {
        position: directionsData.routes[0].legs[0].end_location,
      },
      carMarkerOptions: {
        position: directionsData.routes[0].legs[0].start_location,
      }
    })
  }

  async function createRoute() {
    const startAddress = directionsData!.routes[0].legs[0].start_address
    const endAddress = directionsData!.routes[0].legs[0].end_address

    const response = await fetch('http://localhost:3000/routes', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        name: `${startAddress} - ${endAddress}`,
        source_id: directionsData!.request.origin.place_id,
        destination_id: directionsData!.request.destination.place_id,
      })
    })

    const route = await response.json()
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      height: '100%',
      width: '100%',
    }}>
      <div>
        <h1>Nova rota</h1>

        <form style={{ display: "flex", flexDirection: "column" }} onSubmit={handleSearchRoute}>
          <div>
            <input type="text" id="source" placeholder="origem" />
          </div>
          <div>
            <input type="text" id="destination" placeholder="destino" />
          </div>

          <button type="submit">Pesquisar</button>
        </form>

        {directionsData && (
          <ul>
            <li>Origem: {directionsData.routes[0].legs[0].start_address}</li>
            <li>Destino: {directionsData.routes[0].legs[0].end_address}</li>
            <li>
              <button type="button" onClick={createRoute}>Criar a rota</button>
            </li>
          </ul>
        )}
      </div>

      <div id="map" style={{ height: '100%', width: '100%' }}
        ref={mapContainerRef}
      />
    </div>
  )
}