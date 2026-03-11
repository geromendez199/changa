import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
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
    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    
    // Wait for the asynchronous effect
    await waitForNextUpdate();
    
    expect(result.current.loading).toBe(false);
  });
});
