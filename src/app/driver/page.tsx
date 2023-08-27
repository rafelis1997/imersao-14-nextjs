'use client'

import { useEffect, useRef, useState } from "react";
import { useMap } from "../hooks/use-map";
import { Route } from "../utils/models";
import { socket } from "../utils/socket-io";
import { Alert, Button, Snackbar, Typography } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import { RouteSelect } from "../components/RouteSelect";


export default function DriverPage() {
  const [open, setOpen] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const map = useMap(mapContainerRef)

  async function startRoute() {
    const routeId = (document.getElementById('route') as HTMLSelectElement).value
    const response = await fetch(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/routes/${routeId}`);
    const route: Route = await response.json()

    map?.removeAllRoutes()

    await map?.addRouteWithIcons({
      routeId: routeId,
      startMarkerOptions: {
        position: route.directions.routes[0].legs[0].start_location,
      },
      endMarkerOptions: {
        position: route.directions.routes[0].legs[0].end_location,
      },
      carMarkerOptions: {
        position: route.directions.routes[0].legs[0].start_location,
      }
    })

    setOpen(true)

    const { steps } = route.directions.routes[0].legs[0]

    for (const step of steps) {
      await sleep(2000)
      map?.moveCar(routeId, step.start_location)
      socket.emit(
        'new-points',
        {
          route_id: routeId,
          lat: step.start_location.lat,
          lng: step.start_location.lng,
        }
      )

      await sleep(2000)
      map?.moveCar(routeId, step.end_location)
      socket.emit(
        'new-points',
        {
          route_id: routeId,
          lat: step.end_location.lat,
          lng: step.end_location.lng,
        }
      )
    }
  }


  useEffect(() => {
    socket.connect()
    return () => { socket.disconnect() }
  }, [])


  return (
    <Grid2
      container
      sx={{ display: "flex", flex: "1" }}
    >
      <Grid2 xs={3} p={4}>
        <Typography variant="h4">Minha viagem</Typography>

        <div style={{ display: "flex", flexDirection: "column", gap: '16px' }}>
          <RouteSelect id="route" />

          <Button
            type="button"
            onClick={startRoute}
            variant="contained"
            fullWidth
          >
            Iniciar a viagem
          </Button>
        </div>
      </Grid2>

      <Grid2 id="map" xs={9} ref={mapContainerRef} />
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      >
        <Alert onClose={() => setOpen(false)} severity="success">
          Rota iniciada com sucesso
        </Alert>
      </Snackbar>
    </Grid2>
  )
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))