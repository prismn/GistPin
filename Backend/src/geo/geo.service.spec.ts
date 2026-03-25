import { GeoService } from './geo.service';

describe('GeoService', () => {
  let service: GeoService;

  beforeEach(() => {
    service = new GeoService();
  });

  describe('encode', () => {
    it('should encode Abuja coordinates to the correct geohash', () => {
      const hash = service.encode(9.0579, 7.4951);
      expect(hash).toBe('s1t7d8c');
    });

    it('should return a string of the requested precision', () => {
      expect(service.encode(9.0579, 7.4951, 5)).toHaveLength(5);
      expect(service.encode(9.0579, 7.4951, 7)).toHaveLength(7);
      expect(service.encode(9.0579, 7.4951, 9)).toHaveLength(9);
    });

    it('should encode New York coordinates', () => {
      const hash = service.encode(40.7128, -74.006, 7);
      expect(hash).toHaveLength(7);
      expect(hash.startsWith('dr5r')).toBe(true);
    });

    it('should encode origin (0, 0)', () => {
      const hash = service.encode(0, 0, 5);
      expect(hash).toHaveLength(5);
    });

    it('should encode extreme coordinates', () => {
      expect(service.encode(89.9, 179.9, 5)).toHaveLength(5);
      expect(service.encode(-89.9, -179.9, 5)).toHaveLength(5);
    });

    it('should return different hashes for different locations', () => {
      const abuja = service.encode(9.0579, 7.4951, 7);
      const lagos = service.encode(6.5244, 3.3792, 7);
      expect(abuja).not.toBe(lagos);
    });
  });

  describe('decode', () => {
    it('should decode a geohash back to approximate coordinates', () => {
      const hash = service.encode(9.0579, 7.4951, 7);
      const { lat, lon } = service.decode(hash);
      // Allow ~0.01 degree tolerance for precision 7
      expect(Math.abs(lat - 9.0579)).toBeLessThan(0.01);
      expect(Math.abs(lon - 7.4951)).toBeLessThan(0.01);
    });

    it('should decode New York geohash', () => {
      const { lat, lon } = service.decode('dr5r7');
      expect(Math.abs(lat - 40.7128)).toBeLessThan(0.5);
      expect(Math.abs(lon - -74.006)).toBeLessThan(0.5);
    });

    it('should be consistent: encode then decode returns original coords', () => {
      const pairs = [
        [9.0579, 7.4951],
        [40.7128, -74.006],
        [-33.8688, 151.2093], // Sydney
        [51.5074, -0.1278], // London
      ];

      for (const [lat, lon] of pairs) {
        const hash = service.encode(lat, lon, 7);
        const decoded = service.decode(hash);
        expect(Math.abs(decoded.lat - lat)).toBeLessThan(0.01);
        expect(Math.abs(decoded.lon - lon)).toBeLessThan(0.01);
      }
    });
  });
});
