"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./LocationsCovered.module.scss";
import Container from "@mui/material/Container";
import { Chip, Typography } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const DEFAULT_CENTER = [-37.8136, 144.9631];
const DEFAULT_ZOOM = 9;
const MAP_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

const LOCATION_COORDINATES = {
  "Melbourne CBD": [-37.8136, 144.9631],
  Carlton: [-37.8001, 144.9671],
  Brunswick: [-37.7667, 144.9594],
  Coburg: [-37.7449, 144.9645],
  Preston: [-37.7419, 145.0078],
  Reservoir: [-37.7167, 145.0067],
  Epping: [-37.6534, 145.0285],
  Craigieburn: [-37.598, 144.9418],
  Richmond: [-37.823, 144.998],
  Hawthorn: [-37.822, 145.0351],
  "Box Hill": [-37.8189, 145.125],
  Ringwood: [-37.8156, 145.229],
  Lilydale: [-37.7576, 145.3555],
  "St Kilda": [-37.8676, 144.9809],
  Caulfield: [-37.877, 145.026],
  Clayton: [-37.925, 145.119],
  Dandenong: [-37.9878, 145.214],
  "Narre Warren": [-38.0264, 145.3069],
  Pakenham: [-38.0774, 145.483],
  Frankston: [-38.144, 145.123],
  Footscray: [-37.8, 144.9],
  Sunshine: [-37.788, 144.832],
  Werribee: [-37.8999, 144.661],
  Melton: [-37.683, 144.583],
  Sunbury: [-37.5797, 144.728],
  Mornington: [-38.219, 145.038],
  "Bacchus Marsh": [-37.676, 144.437],
  Wallan: [-37.4139, 145.005],
  Geelong: [-38.1499, 144.3617],
};

const DEFAULT_LOCATIONS = [
  "Melbourne CBD",
  "Carlton",
  "Brunswick",
  "Coburg",
  "Preston",
  "Reservoir",
  "Epping",
  "Craigieburn",
  "Richmond",
  "Hawthorn",
  "Box Hill",
  "Ringwood",
  "Lilydale",
  "St Kilda",
  "Caulfield",
  "Clayton",
  "Dandenong",
  "Narre Warren",
  "Pakenham",
  "Frankston",
  "Footscray",
  "Sunshine",
  "Werribee",
  "Melton",
  "Sunbury",
  "Mornington",
  "Bacchus Marsh",
  "Wallan",
  "Geelong",
];

const NORMALIZED_LOCATION_COORDINATES = Object.entries(LOCATION_COORDINATES).reduce(
  (acc, [label, coordinates]) => {
    acc[normalizeLocationLabel(label)] = coordinates;
    return acc;
  },
  {}
);

function normalizeLocationLabel(label = "") {
  return String(label)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getLocationCoordinates(label) {
  const normalizedLabel = normalizeLocationLabel(label);

  return (
    LOCATION_COORDINATES[label] ||
    NORMALIZED_LOCATION_COORDINATES[normalizedLabel] ||
    null
  );
}

function stripHtml(html = "") {
  return String(html).replace(/<[^>]*>/g, "").trim();
}

function isMapReady(map) {
  return Boolean(map?._container);
}

export default function LocationsCovered({
  title,
  description,
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [activeLocation, setActiveLocation] = useState("");
  const [mapError, setMapError] = useState("");

  const locationLabels = DEFAULT_LOCATIONS;

  const titleText = stripHtml(title);
  const hasHtmlTitle = typeof title === "string" && /<\/?[a-z][\s\S]*>/i.test(title);
  const hasHtmlDescription =
    typeof description === "string" && /<\/?[a-z][\s\S]*>/i.test(description);

  useEffect(() => {
    let cancelled = false;
    let frameId;
    let map;

    async function initMap() {
      try {
        const leaflet = await import("leaflet");
        if (cancelled || !mapRef.current) return;

        map = leaflet.map(mapRef.current, {
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          zoomControl: true,
          scrollWheelZoom: false,
        });

        leaflet
          .tileLayer(MAP_TILE_URL, {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 19,
          })
          .addTo(map);

        const markerIcon = leaflet.divIcon({
          className: styles.marker,
          html: "<span></span>",
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        mapInstanceRef.current = map;

        if (!locationLabels.length) return;

        const nextMarkers = [];
        const bounds = [];

        locationLabels.forEach((label) => {
          const coordinates = getLocationCoordinates(label);
          if (!coordinates) return;

          const marker = leaflet
            .marker(coordinates, {
              icon: markerIcon,
              title: label,
            })
            .addTo(map)
            .bindPopup(label);

          marker.on("click", () => {
            if (!isMapReady(map)) return;
            setActiveLocation(label);
            map.flyTo(coordinates, 13, { duration: 0.55 });
          });

          bounds.push(coordinates);
          nextMarkers.push(marker);
        });

        markersRef.current = nextMarkers;

        await new Promise((resolve) => {
          frameId = window.requestAnimationFrame(resolve);
        });

        if (cancelled || !isMapReady(map)) return;

        map.invalidateSize({ animate: false });

        if (bounds.length > 1) {
          map.fitBounds(bounds, { padding: [36, 36], animate: false });
        } else if (bounds.length === 1) {
          map.setView(bounds[0], 13, { animate: false });
        }
      } catch (error) {
        console.error("Leaflet map failed to initialize", error);
        setMapError("Map failed to load.");
      }
    }

    initMap();

    return () => {
      cancelled = true;
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      markersRef.current.forEach((marker) => marker.off());
      markersRef.current = [];
      mapInstanceRef.current = null;
      if (map && isMapReady(map)) {
        map.stop();
        map.remove();
      }
    };
  }, [locationLabels]);

  const handleLocationClick = (label) => {
    setActiveLocation(label);
    const marker = markersRef.current.find(
      (item) => item.options?.title === label
    );
    const map = mapInstanceRef.current;

    if (!marker || !isMapReady(map)) return;

    map.flyTo(marker.getLatLng(), 13, { duration: 0.55 });
    marker.openPopup();
  };

  return (
    <section className={`${styles.section}`} id="locations-covered">
      <Container maxWidth="lg" className={styles.container}>
        <div className={`${styles.contentWrapper}`}>
          {hasHtmlTitle ? (
            <div
              className={`${styles.title} heading-2 `}
              dangerouslySetInnerHTML={{ __html: title }}
            />
          ) : (
            <Typography variant="h3" component="h2" className={styles.title}>
              {title}
            </Typography>
          )}

          {hasHtmlDescription ? (
            <div
              className={`body1 mt-16`}
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : (
            <Typography
              variant="body1"
              component="p"
              className={`${styles.description} mt-16`}
            >
              {description}
            </Typography>
          )}

          <ul className={`${styles.locationsWrapper} mt-16`}>
            {locationLabels.map((label) => (
              <li key={label}>
                <Chip
                  icon={<LocationOnIcon fontSize="small" />}
                  label={label}
                  onClick={() => handleLocationClick(label)}
                  className={`${styles.locationChip} ${
                    activeLocation === label ? styles.active : ""
                  }`}
                />
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.mapPanel}>
          <div
            ref={mapRef}
            className={styles.map}
            aria-label={`${titleText || "Areas covered"} map`}
          />
          {mapError && (
            <Typography variant="body2" className={styles.mapError}>
              {mapError}
            </Typography>
          )}
        </div>
      </Container>
    </section>
  );
}
