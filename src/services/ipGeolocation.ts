export async function getIpLocation(): Promise<{
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
} | null> {
  try {
    // Using ipapi.co which doesn't require an API key for basic info
    const resp = await fetch('https://ipapi.co/json/');
    if (!resp.ok) return null;
    const data = await resp.json();

    const latitude = Number(data.latitude ?? data.lat);
    const longitude = Number(data.longitude ?? data.lon ?? data.lon);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    return {
      latitude,
      longitude,
      city: data.city,
      region: data.region,
      country: data.country_name ?? data.country,
    };
  } catch (err) {
    console.error('IP geolocation error:', err);
    return null;
  }
}
