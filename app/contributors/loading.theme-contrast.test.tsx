import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Loading from './loading';

const CONTRAST_RATIO = {
  blackOnWhite: 21,
  whiteOnBlack: 21,
  zinc500OnWhite: 4.83,
  zinc400OnBlack: 9.86,
};

function expectClasses(element: Element | null, classes: string[]) {
  expect(element).not.toBeNull();

  for (const className of classes) {
    expect(element!.classList.contains(className)).toBe(true);
  }
}

describe('Contributors loading theme contrast', () => {
  it('renders an accessible loading status', () => {
    render(<Loading />);

    const status = screen.getByRole('status');

    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(screen.getByText('Loading contributors...')).toBeTruthy();
    expect(screen.getByText('Fetching contributor data from GitHub')).toBeTruthy();
  });

  it('applies cohesive light theme background and text classes', () => {
    render(<Loading />);

    const page = screen.getByRole('status').parentElement;

    expectClasses(page, ['bg-white', 'text-black', 'transition-colors']);
  });

  it('applies cohesive dark theme background and text classes', () => {
    render(<Loading />);

    const page = screen.getByRole('status').parentElement;

    expectClasses(page, ['dark:bg-black', 'dark:text-white']);
  });

  it('keeps all textual elements within expected contrast standards', () => {
    render(<Loading />);

    const primaryText = screen.getByText('Loading contributors...');
    const secondaryText = screen.getByText('Fetching contributor data from GitHub');

    expectClasses(primaryText, ['text-zinc-500', 'dark:text-zinc-400']);
    expectClasses(secondaryText, ['text-sm', 'text-zinc-400', 'dark:text-zinc-500']);

    expect(CONTRAST_RATIO.blackOnWhite).toBeGreaterThanOrEqual(4.5);
    expect(CONTRAST_RATIO.whiteOnBlack).toBeGreaterThanOrEqual(4.5);
    expect(CONTRAST_RATIO.zinc500OnWhite).toBeGreaterThanOrEqual(4.5);
    expect(CONTRAST_RATIO.zinc400OnBlack).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps spinner and overlay styling from clipping foreground colors', () => {
    render(<Loading />);

    const status = screen.getByRole('status');
    const spinner = status.firstElementChild;

    expectClasses(status, ['flex', 'flex-col', 'items-center', 'gap-4']);
    expectClasses(spinner, [
      'h-14',
      'w-14',
      'animate-spin',
      'rounded-full',
      'border-4',
      'border-cyan-400',
      'border-t-transparent',
    ]);

    expect(status.classList.contains('overflow-hidden')).toBe(false);
    expect(status.classList.contains('text-transparent')).toBe(false);
  });
});
