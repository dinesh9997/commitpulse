import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRender = vi.fn();
const mockAsPng = vi.fn();

vi.mock('../route', () => ({
  GET: vi.fn(),
}));

vi.mock('@resvg/resvg-js', () => {
  class MockResvg {
    render() {
      return mockRender();
    }
  }

  return {
    Resvg: MockResvg,
  };
});

import { GET } from './route';
import { GET as getStreakSvg } from '../route';

describe('ApiStreakPngRoute Accessibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockAsPng.mockReturnValue(Buffer.from('png-data'));

    mockRender.mockReturnValue({
      asPng: mockAsPng,
    });
  });

  it('returns PNG content type for accessible image consumers', async () => {
    vi.mocked(getStreakSvg).mockResolvedValue(
      new Response('<svg></svg>', {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
        },
      })
    );

    const response = await GET(new Request('http://localhost/api/streak/png'));

    expect(response.headers.get('Content-Type')).toBe('image/png');
  });

  it('preserves cache headers for assistive technology stability', async () => {
    vi.mocked(getStreakSvg).mockResolvedValue(
      new Response('<svg></svg>', {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    );

    const response = await GET(new Request('http://localhost/api/streak/png'));

    expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600');
  });

  it('returns original error responses unchanged', async () => {
    vi.mocked(getStreakSvg).mockResolvedValue(
      new Response(
        JSON.stringify({
          error: 'Bad Request',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );

    const response = await GET(new Request('http://localhost/api/streak/png'));

    expect(response.status).toBe(400);

    expect(response.headers.get('Content-Type')).toContain('application/json');
  });

  it('returns readable JSON error response on PNG conversion failure', async () => {
    vi.mocked(getStreakSvg).mockResolvedValue(
      new Response('<svg></svg>', {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
        },
      })
    );

    mockRender.mockImplementationOnce(() => {
      throw new Error('PNG conversion failed');
    });

    const response = await GET(new Request('http://localhost/api/streak/png'));

    const data = await response.json();

    expect(response.status).toBe(500);

    expect(data).toEqual({
      error: 'Failed to convert SVG to PNG',
    });

    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  it('returns binary PNG data successfully for downstream accessible consumers', async () => {
    vi.mocked(getStreakSvg).mockResolvedValue(
      new Response('<svg></svg>', {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
        },
      })
    );

    const response = await GET(new Request('http://localhost/api/streak/png'));

    const buffer = await response.arrayBuffer();

    expect(buffer.byteLength).toBeGreaterThan(0);

    expect(mockAsPng).toHaveBeenCalled();
  });
});
