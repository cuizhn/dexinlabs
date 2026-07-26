import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  presets: [presetUno()],
  
  theme: {
    colors: {
      primary: {
        DEFAULT: '#4F46E5',
        light: '#EEF2FF',
        dark: '#4338CA'
      },
      secondary: '#06B6D4',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      text: {
        primary: '#111827',
        DEFAULT: '#334155',
        secondary: '#6B7280',
        light: '#64748B',
        muted: '#94A3B8'
      },
      heading: '#1E293B',
      bg: {
        primary: '#F7F8FA',
        secondary: '#F9FAFB',
        white: '#FFFFFF'
      },
      border: {
        DEFAULT: '#E5E7EB',
        light: '#F3F4F6'
      }
    },
    
    fontFamily: {
      ui: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      content: ['"Source Serif 4"', '"Inter"', 'system-ui', 'sans-serif'],
      math: ['"STIX Two Math"', '"Times New Roman"', 'serif'],
      mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
    },
    
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem'
    },
    
    boxShadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    }
  },
  
  shortcuts: {
    'container': 'max-w-[1200px] mx-auto px-6',
    'container-sm': 'max-w-[720px] mx-auto px-6',
    
    'btn': 'inline-flex items-center gap-2 px-7 py-3 rounded-md font-semibold text-sm no-underline transition-all duration-250',
    'btn-primary': 'bg-gradient-to-br from-primary to-[#6366F1] text-white shadow-[0_4px_14px_rgba(79,70,229,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(79,70,229,0.4)]',
    'btn-ghost': 'bg-bg-primary text-text-primary border border-border hover:border-primary hover:text-primary hover:bg-primary-light',
    'btn-lg': 'px-9 py-4 text-base',
    
    'card': 'bg-bg-white border border-border rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary',
    
    'tag': 'inline-block px-[10px] py-0.5 rounded-full text-xs font-semibold',
    'tag-beginner': 'bg-[#ECFDF5] text-[#059669]',
    'tag-intermediate': 'bg-[#FFF7ED] text-[#D97706]',
    'tag-advanced': 'bg-primary-light text-[#6366F1]',
    
    'difficulty': 'inline-block px-[10px] py-0.5 rounded-full text-xs font-medium',
    'difficulty-beginner': 'bg-[#DCFCE7] text-[#166534]',
    'difficulty-intermediate': 'bg-[#FEF3C7] text-[#92400E]',
    'difficulty-advanced': 'bg-[#FEE2E2] text-[#991B1B]',

    'topic-card': 'block p-6 bg-bg-white border border-border rounded-lg no-underline text-inherit transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md hover:border-primary',
    'exercise-card': 'block p-6 bg-gradient-to-br from-primary to-primary-dark text-white no-underline rounded-lg'
  }
})