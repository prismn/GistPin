import { Injectable } from '@nestjs/common';

@Injectable()
export class GeoService {
  /**
   * Encode a lat/lon pair into a coarse geohash cell string.
   * Precision 5 gives ~5km x 5km cells — suitable for the location_cell
   * stored on-chain in the GistRegistry contract.
   */
  encode(lat: number, lon: number, precision = 5): string {
    const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
    let minLat = -90,
      maxLat = 90;
    let minLon = -180,
      maxLon = 180;
    let hash = '';
    let bits = 0;
    let charIndex = 0;
    let isEven = true;

    while (hash.length < precision) {
      if (isEven) {
        const mid = (minLon + maxLon) / 2;
        if (lon > mid) {
          charIndex = (charIndex << 1) + 1;
          minLon = mid;
        } else {
          charIndex = charIndex << 1;
          maxLon = mid;
        }
      } else {
        const mid = (minLat + maxLat) / 2;
        if (lat > mid) {
          charIndex = (charIndex << 1) + 1;
          minLat = mid;
        } else {
          charIndex = charIndex << 1;
          maxLat = mid;
        }
      }

      isEven = !isEven;
      bits++;

      if (bits === 5) {
        hash += BASE32[charIndex];
        bits = 0;
        charIndex = 0;
      }
    }

    return hash;
  }
};