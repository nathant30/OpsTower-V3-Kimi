import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import { mockLocalStorage } from '@/test/utils';
import LoginPage from '../LoginPage';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage();
  });

  it('should render login form', () => {
    render(<LoginPage />);
    
    expect(screen.getByRole('heading', { name: /opstower v2 login/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should update email and password inputs', () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByPlaceholderText(/enter your email/i) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(/enter your password/i) as HTMLInputElement;
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('should show validation error for empty password', async () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('should show dev mode helper in development', () => {
    render(<LoginPage />);
    
    expect(screen.getByText(/development mode/i)).toBeInTheDocument();
    expect(screen.getByText(/click here/i)).toBeInTheDocument();
  });

  it('should auto-fill credentials when dev helper is clicked', async () => {
    render(<LoginPage />);
    
    const devHelperButton = screen.getByText(/click here/i);
    fireEvent.click(devHelperButton);
    
    await waitFor(() => {
      const emailInput = screen.getByPlaceholderText(/enter your email/i) as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText(/enter your password/i) as HTMLInputElement;
      
      expect(emailInput.value).toBe('admin@opstower.com');
      expect(passwordInput.value).toBe('admin123');
    });
  });

  it('should have remember me checkbox', () => {
    render(<LoginPage />);
    
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
  });

  it('should have forgot password link', () => {
    render(<LoginPage />);
    
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });

  it('should disable submit button while submitting', async () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    // Button should be disabled during submission
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('should show loading spinner during submission', async () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    // Should show loading text
    await waitFor(() => {
      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    });
  });
});
