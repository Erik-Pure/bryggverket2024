import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AgeGate from '../src/components/AgeGate'

describe('AgeGate', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    })
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  it('renders nothing when age_verified cookie exists', () => {
    document.cookie = 'age_verified=true'
    const { container } = render(<AgeGate />)
    vi.advanceTimersByTime(600)
    expect(container.innerHTML).toBe('')
  })

  it('shows prompt after delay when no cookie', async () => {
    vi.useRealTimers()
    document.cookie = ''
    render(<AgeGate />)
    expect(screen.queryByText('Är du 20 år eller äldre?')).not.toBeInTheDocument()

    await vi.waitFor(() => {
      expect(screen.getByText('Är du 20 år eller äldre?')).toBeInTheDocument()
    }, { timeout: 1000 })

    expect(screen.getByText('Ja')).toBeInTheDocument()
    expect(screen.getByText('Nej')).toBeInTheDocument()
  })

  it('sets cookie and hides on confirm', async () => {
    vi.useRealTimers()
    const user = userEvent.setup()

    document.cookie = ''
    render(<AgeGate />)

    await vi.waitFor(() => {
      expect(screen.getByText('Ja')).toBeInTheDocument()
    }, { timeout: 1000 })

    await user.click(screen.getByText('Ja'))
    expect(document.cookie).toContain('age_verified=true')
    expect(screen.queryByText('Är du 20 år eller äldre?')).not.toBeInTheDocument()
  })

  it('shows denied state on reject', async () => {
    vi.useRealTimers()
    const user = userEvent.setup()

    document.cookie = ''
    render(<AgeGate />)

    await vi.waitFor(() => {
      expect(screen.getByText('Nej')).toBeInTheDocument()
    }, { timeout: 1000 })

    await user.click(screen.getByText('Nej'))
    expect(screen.getByText(':(')).toBeInTheDocument()
    expect(screen.queryByText('Är du 20 år eller äldre?')).not.toBeInTheDocument()
  })
})
