"use client"; // Required for Next.js (App Router)

import { useState, useEffect } from "react";

export default function LocationComponent() {
  const [location, setLocation] = useState({ lat: 0, lon: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (err) => {
        setError(err.message);
      }
    );
  }, []);

  return (
    <div>
      <h1>Geolocation in Next.js</h1>
      {error ? (
        <p>Error: {error}</p>
      ) : location.lat ? (
        <p>Latitude: {location.lat}, Longitude: {location.lon}</p>
      ) : (
        <p>Fetching location...</p>
      )}
    </div>
  );
}
