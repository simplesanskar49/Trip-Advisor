import { describe, expect, it } from 'vitest';
import { friendlyError } from './friendlyError';

describe('friendlyError', () => {
  it('maps network errors', () => {
    expect(friendlyError(new Error('Network request failed'))).toMatch(/connection problem/i);
    expect(friendlyError(new Error('Failed to fetch'))).toMatch(/connection problem/i);
  });

  it('maps rate-limit / quota errors', () => {
    expect(friendlyError(new Error('HTTP 429 Too Many Requests'))).toMatch(/request limit/i);
    expect(friendlyError(new Error('quota exceeded'))).toMatch(/request limit/i);
    expect(friendlyError(new Error('RESOURCE_EXHAUSTED'))).toMatch(/request limit/i);
  });

  it('maps upstream-unavailable errors', () => {
    expect(friendlyError(new Error('503 Service Unavailable'))).toMatch(/busy/i);
    expect(friendlyError(new Error('model overloaded'))).toMatch(/busy/i);
  });

  it('maps validation / schema errors', () => {
    expect(friendlyError(new Error('schema parse failed'))).toMatch(/clean itinerary/i);
    expect(friendlyError(new Error('non-json response'))).toMatch(/clean itinerary/i);
  });

  it('maps safety / 404 errors', () => {
    expect(friendlyError(new Error('blocked by safety filter'))).toMatch(/different destination/i);
    expect(friendlyError(new Error('HTTP 404 not found'))).toMatch(/missing/i);
  });

  it('falls back to a generic message', () => {
    expect(friendlyError(new Error('something exploded'))).toMatch(/went wrong/i);
  });

  it('handles non-Error throwables', () => {
    expect(friendlyError('plain string')).toMatch(/went wrong/i);
    expect(friendlyError(null)).toMatch(/went wrong/i);
    expect(friendlyError(undefined)).toMatch(/went wrong/i);
  });
});
