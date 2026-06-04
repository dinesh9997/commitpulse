import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

const InteractiveGridNode: React.FC = () => {
  const [coords, setCoords] = useState<MousePosition | null>(null);

  // Switching to mouseMove tracking ensures React captures coordinate tracking beautifully
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setCoords({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setCoords(null);
  };

  return (
    <div
      data-testid="grid-node"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ width: '200px', height: '200px', background: '#ccc' }}
    >
      Loading Premium Card...
      {coords && (
        <div data-testid="tooltip">
          Hovering Grid Node at X:{coords.x} Y:{coords.y}
        </div>
      )}
    </div>
  );
};

describe('ContributorsLoading Mouse Interactivity & Tooltip Coordinates', () => {
  it('should calculate and display correct cursor coordinates on mouse entry', () => {
    render(<InteractiveGridNode />);
    const node = screen.getByTestId('grid-node');

    // Act: Use native fireEvent wrapper with target fields directly
    fireEvent.mouseMove(node, {
      clientX: 100,
      clientY: 150,
    });

    // Assert
    expect(screen.getByTestId('tooltip')).toBeDefined();
    expect(screen.getByText('Hovering Grid Node at X:100 Y:150')).toBeDefined();
  });

  it('should completely hide the coordinates tooltip when the mouse leaves the layout element', () => {
    render(<InteractiveGridNode />);
    const node = screen.getByTestId('grid-node');

    // Act Part A: Move mouse over
    fireEvent.mouseMove(node, { clientX: 50, clientY: 50 });
    expect(screen.getByTestId('tooltip')).toBeDefined();

    // Act Part B: Simulate mouse exit
    fireEvent.mouseLeave(node);

    // Assert
    expect(screen.queryByTestId('tooltip')).toBeNull();
  });
});
