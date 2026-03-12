import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../hooks/useAuth';

jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    }
  }
}));

describe('useAuth hook', () => {
  it('initializes with loading state and no user', async () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});
