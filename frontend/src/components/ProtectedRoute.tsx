import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const baseUrl = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    const verifyAuth = async () => {
      // Check if credentials exist in localStorage
      const username = localStorage.getItem('ERP_USERNAME');
      const password = localStorage.getItem('ERP_PASSWORD');

      if (!username || !password) {
        setIsAuthenticated(false);
        setIsVerifying(false);
        return;
      }

      // Verify credentials with backend
      try {
        const res = await fetch(`${baseUrl}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          // Credentials are invalid, clear them
          localStorage.removeItem('ERP_USERNAME');
          localStorage.removeItem('ERP_PASSWORD');
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        // On network error, we'll keep the user logged out for security
        localStorage.removeItem('ERP_USERNAME');
        localStorage.removeItem('ERP_PASSWORD');
        setIsAuthenticated(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAuth();
  }, [baseUrl]);

  // Show loading state while verifying
  if (isVerifying) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '1.5rem',
        color: '#666'
      }}>
        Verifying authentication...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render protected content if authenticated
  return <>{children}</>;
}

export default ProtectedRoute;