/**
 * Unit tests for components/UI.jsx — Btn component
 *
 * Run with: npx jest __tests__/UI.test.js
 *
 * Setup required (run once):
 *   npm install --save-dev jest @testing-library/react-native @testing-library/jest-native jest-expo
 *
 * Add to package.json:
 *   "jest": { "preset": "jest-expo" }
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Btn } from '../components/UI';

describe('Btn component', () => {
  it('renders the label', () => {
    const { getByText } = render(<Btn label="Guardar" onPress={() => {}} />);
    expect(getByText('Guardar')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const handler = jest.fn();
    const { getByRole } = render(<Btn label="Guardar" onPress={handler} />);
    fireEvent.press(getByRole('button'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onPress when loading', () => {
    const handler = jest.fn();
    const { getByRole } = render(<Btn label="Guardar" onPress={handler} loading />);
    fireEvent.press(getByRole('button'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('shows ActivityIndicator when loading, not label', () => {
    const { queryByText } = render(
      <Btn label="Guardar" onPress={() => {}} loading />
    );
    // Label text should not be visible when loading
    expect(queryByText('Guardar')).toBeNull();
  });

  it('has correct accessibilityRole', () => {
    const { getByRole } = render(<Btn label="Enviar" onPress={() => {}} />);
    expect(getByRole('button')).toBeTruthy();
  });

  it('has accessibilityState.disabled=true when loading', () => {
    const { getByRole } = render(<Btn label="Enviar" onPress={() => {}} loading />);
    const btn = getByRole('button');
    expect(btn.props.accessibilityState.disabled).toBe(true);
  });

  it('ghost variant renders without crashing', () => {
    const { getByText } = render(<Btn label="Cancelar" onPress={() => {}} ghost />);
    expect(getByText('Cancelar')).toBeTruthy();
  });

  it('danger variant renders without crashing', () => {
    const { getByText } = render(<Btn label="Eliminar" onPress={() => {}} danger />);
    expect(getByText('Eliminar')).toBeTruthy();
  });
});
