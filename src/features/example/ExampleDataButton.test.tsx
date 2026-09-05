import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppStateProvider } from '../../state/AppStateContext';
import ExampleDataButton from './ExampleDataButton';

describe('ExampleDataButton', () => {
  it('rendert einen Button mit der Beschriftung "Beispieldatensatz laden"', () => {
    render(
      <AppStateProvider>
        <ExampleDataButton />
      </AppStateProvider>,
    );
    const button = screen.getByRole('button', { name: 'Beispieldatensatz laden' });
    expect(button).toBeDefined();
  });
});
