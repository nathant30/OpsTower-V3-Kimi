/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // XPRESS Dark Theme - Command Center
        xpress: {
          bg: {
            primary: '#0a0a0f',
            secondary: '#12121a',
            tertiary: '#1a1a2e',
            elevated: '#252542',
          },
          border: {
            DEFAULT: '#2a2a45',
            focus: '#3b82f6',
          },
          text: {
            primary: '#ffffff',
            secondary: '#a0a0b0',
            muted: '#6b7280',
          },
          accent: {
            blue: '#3b82f6',
            cyan: '#06b6d4',
            purple: '#8b5cf6',
            green: '#10b981',
            amber: '#f59e0b',
            orange: '#f97316',
            red: '#ef4444',
          },
          status: {
            active: '#10b981',
            idle: '#f59e0b',
            offline: '#6b7280',
            alert: '#ef4444',
            warning: '#f97316',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': '0.625rem', // 10px
        'xs': '0.75rem',   // 12px
        'sm': '0.875rem',  // 14px
        'base': '1rem',    // 16px
        'lg': '1.125rem',  // 18px
        'xl': '1.25rem',   // 20px
        '2xl': '1.5rem',   // 24px
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      height: {
        'header': '64px',
        'sidebar': 'calc(100vh - 64px)',
      },
      width: {
        'sidebar': '240px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
