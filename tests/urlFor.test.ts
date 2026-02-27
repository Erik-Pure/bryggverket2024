import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('sanity:client', () => ({
  sanityClient: {
    config: () => ({
      projectId: 'b0e19xpn',
      dataset: 'production',
    }),
  },
}))

describe('urlFor', () => {
  let urlFor: typeof import('../src/lib/sanity').urlFor

  beforeEach(async () => {
    vi.resetModules()
    const mod = await import('../src/lib/sanity')
    urlFor = mod.urlFor
  })

  it('returns a builder with .url() method', () => {
    const ref = {
      _type: 'image',
      asset: { _ref: 'image-abc123-300x200-png', _type: 'reference' },
    }
    const url = urlFor(ref).url()
    expect(url).toContain('cdn.sanity.io')
    expect(url).toContain('b0e19xpn')
    expect(url).toContain('production')
  })

  it('supports width/height transforms', () => {
    const ref = {
      _type: 'image',
      asset: { _ref: 'image-abc123-300x200-png', _type: 'reference' },
    }
    const url = urlFor(ref).width(100).height(50).url()
    expect(url).toContain('w=100')
    expect(url).toContain('h=50')
  })

  it('supports format transforms', () => {
    const ref = {
      _type: 'image',
      asset: { _ref: 'image-abc123-300x200-png', _type: 'reference' },
    }
    const url = urlFor(ref).format('webp').url()
    expect(url).toContain('fm=webp')
  })
})
