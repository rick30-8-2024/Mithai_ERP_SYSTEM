import React from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * ThemeToggle - A reusable theme toggle switch component
 * Uses the global ThemeContext for consistent theme state across the app
 */
export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <label className="switch" aria-label="Toggle light and dark mode">
            <input
                type="checkbox"
                checked={theme === 'dark'}
                onChange={toggleTheme}
                aria-checked={theme === 'dark'}
            />
            <span className="slider">
                {/* Moon icon (dark) */}
                <span
                    aria-hidden
                    style={{
                        position: 'absolute',
                        left: 6,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 16,
                        height: 16,
                        opacity: theme === 'dark' ? 1 : 0,
                        transition: 'opacity .25s ease'
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                </span>
                {/* Sun icon (light) */}
                <span
                    aria-hidden
                    style={{
                        position: 'absolute',
                        right: 6,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 16,
                        height: 16,
                        opacity: theme === 'light' ? 1 : 0,
                        transition: 'opacity .25s ease'
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                </span>
            </span>
        </label>
    );
}
