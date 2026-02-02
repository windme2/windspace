import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast, toast } from '../use-toast';

describe('useToast', () => {
  beforeEach(() => {
    // Clear any existing toasts before each test
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.dismiss();
    });
  });

  it('returns toast function and toasts array', () => {
    const { result } = renderHook(() => useToast());
    
    expect(result.current.toast).toBeDefined();
    expect(result.current.toasts).toBeDefined();
    expect(Array.isArray(result.current.toasts)).toBe(true);
  });

  it('adds a toast when toast function is called', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({
        title: 'Test Toast',
        description: 'This is a test toast',
      });
    });

    expect(result.current.toasts.length).toBeGreaterThan(0);
    expect(result.current.toasts[0].title).toBe('Test Toast');
  });

  it('dismisses a specific toast', () => {
    const { result } = renderHook(() => useToast());
    
    let toastId: string;
    act(() => {
      const { id } = result.current.toast({
        title: 'Toast to dismiss',
      });
      toastId = id;
    });

    act(() => {
      result.current.dismiss(toastId);
    });

    // Toast should be marked for removal
    const dismissedToast = result.current.toasts.find(t => t.id === toastId);
    expect(dismissedToast?.open).toBe(false);
  });

  it('dismisses all toasts when no id provided', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({ title: 'Toast 1' });
      result.current.toast({ title: 'Toast 2' });
    });

    act(() => {
      result.current.dismiss();
    });

    // All toasts should be marked for removal
    result.current.toasts.forEach(t => {
      expect(t.open).toBe(false);
    });
  });

  it('standalone toast function works', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      toast({
        title: 'Standalone Toast',
        description: 'Created with standalone function',
      });
    });

    const foundToast = result.current.toasts.find(
      t => t.title === 'Standalone Toast'
    );
    expect(foundToast).toBeDefined();
  });

  it('toast has correct variant', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({
        title: 'Destructive Toast',
        variant: 'destructive',
      });
    });

    const destructiveToast = result.current.toasts.find(
      t => t.title === 'Destructive Toast'
    );
    expect(destructiveToast?.variant).toBe('destructive');
  });
});
