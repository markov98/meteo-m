export async function getIpLocation(): Promise<{
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
} | null> {
  try {
    const resp = await fetch('https://ipwho.is/');
    if (!resp.ok) return null;
    const data = await resp.json();

    if (!data.success) {
      console.error('IP geolocation service failed:', data);
      return null;
    }

    const latitude = Number(data.latitude);
    const longitude = Number(data.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    return {
      latitude,
      longitude,
      city: data.city,
      region: data.region,
      country: data.country,
    };
  } catch (err) {
    console.error('IP geolocation error:', err);
    return null;
  }
}
