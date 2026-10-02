import math

import requests

EARTH_RADIUS_MILES = 3958.8
GEOCODE_TIMEOUT_SECONDS = 5


class ZipNotFoundError(Exception):
    """The ZIP code does not exist."""


class GeocodingUnavailableError(Exception):
    """The geocoding service could not be reached or answered unexpectedly."""


def geocode_zip(zip_code: str) -> tuple[float, float]:
    """Return (lat, lng) for a US ZIP code. `zip_code` must already be 5 digits."""
    try:
        response = requests.get(
            f"https://api.zippopotam.us/us/{zip_code}",
            timeout=GEOCODE_TIMEOUT_SECONDS,
        )
        if response.status_code == 404:
            raise ZipNotFoundError(f"ZIP code {zip_code} was not found.")
        response.raise_for_status()
        place = response.json()["places"][0]
        return float(place["latitude"]), float(place["longitude"])
    except (requests.RequestException, KeyError, IndexError, ValueError) as error:
        raise GeocodingUnavailableError(
            f"Could not look up ZIP code {zip_code}: {error}"
        ) from error


def distance_miles(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Great-circle (haversine) distance between two points, in miles."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = phi2 - phi1
    delta_lambda = math.radians(lng2 - lng1)
    a = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    )
    return 2 * EARTH_RADIUS_MILES * math.asin(math.sqrt(a))
