"use client";

import { useState, useEffect } from "react";

// Define types for coordinates
interface Coordinates {
  lat: number;
  lon: number;
}

// Define types for geolocation position
interface PositionData {
  coords: {
    latitude: number;
    longitude: number;
    speed: number | null;
  };
  timestamp: number;
}

export default function LiveLocation() {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [speed, setSpeed] = useState<string | null>(null);
  const [prevLocation, setPrevLocation] = useState<Coordinates | null>(null);
  const [prevTimestamp, setPrevTimestamp] = useState<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position: PositionData) => {
        const { latitude, longitude, speed: nativeSpeed } = position.coords;
        const timestamp = position.timestamp;

        setLocation({ lat: latitude, lon: longitude });

        // Calculate speed manually if native speed is not available
        if (prevLocation && prevTimestamp) {
          const distance = haversine(prevLocation, { lat: latitude, lon: longitude });
          const timeElapsed = (timestamp - prevTimestamp) / 1000; // Convert ms to seconds

          if (timeElapsed > 0) {
            const calculatedSpeed = (distance / timeElapsed) * 3.6; // Convert m/s to km/h
            setSpeed(calculatedSpeed.toFixed(2));
          }
        } else if (nativeSpeed !== null) {
          setSpeed((nativeSpeed * 3.6).toFixed(2)); // Convert from m/s to km/h
        }

        setPrevLocation({ lat: latitude, lon: longitude });
        setPrevTimestamp(timestamp);
      },
      (err: GeolocationPositionError) => console.error("Geolocation Error:", err.message),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [prevLocation, prevTimestamp]);

  return (
    <div>
      <h1>Speeder Block</h1><br></br>
      <h2>Live Location & Speed Tracking</h2>
      {location ? (
        <p>Latitude: {location.lat}, Longitude: {location.lon}</p>
      ) : (
        <p>Waiting for location...</p>
      )}
      <p>Speed: {speed ? `${speed} km/h` : "Calculating..."}</p>
    </div>
  );
}

// Haversine formula to calculate distance in meters
function haversine(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371000; // Earth's radius in meters
  const toRad = (angle: number) => (angle * Math.PI) / 180;

  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lon - coord1.lon);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}
