/** @type {import('tailwindcss').Config} */
export default {
  corePlugins: {
    // Ensure these are not disabled
    ringWidth: true,
    ringColor: true,
  },
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'text-primary-100',
    'text-primary-200',
    'text-primary-300',
    'text-textColor-100',
    'text-textColor-200',
    'text-textColor-300',
    'text-light-hover-100',
    'text-light-hover-200',
    'text-separator',
    'text-GPT-4-100',
    'text-GPT-4-200',
    'text-LLAMA-2-100',
    'text-LLAMA-2-200',
    'text-MISTRAL-8X7B-100',
    'text-MISTRAL-8X7B-200',
    'text-CLAUDE-3-OPUS-100',
    'text-CLAUDE-3-OPUS-200',
    'text-CLAUDE-3-SONNET-100',
    'text-CLAUDE-3-SONNET-200',
    'text-CLAUDE-3-HAIKU-100',
    'text-CLAUDE-3-HAIKU-200',
    'text-GEMINI-PRO-100',
    'text-GEMINI-PRO-200',
    'text-GPT-4-VISION-100',
    'text-GPT-4-VISION-200',
    'text-DALL-E-3-100',
    'text-DALL-E-3-200',
    'bg-primary-100',
    'bg-primary-200',
    'bg-primary-300',
    'bg-textColor-100',
    'bg-textColor-200',
    'bg-textColor-300',
    'bg-light-hover-100',
    'bg-light-hover-200',
    'bg-separator',
    'bg-GPT-4-100',
    'bg-GPT-4-200',
    'bg-LLAMA-2-100',
    'bg-LLAMA-2-200',
    'bg-MISTRAL-8X7B-100',
    'bg-MISTRAL-8X7B-200',
    'bg-CLAUDE-3-OPUS-100',
    'bg-CLAUDE-3-OPUS-200',
    'bg-CLAUDE-3-SONNET-100',
    'bg-CLAUDE-3-SONNET-200',
    'bg-CLAUDE-3-HAIKU-100',
    'bg-CLAUDE-3-HAIKU-200',
    'bg-GEMINI-PRO-100',
    'bg-GEMINI-PRO-200',
    'bg-GPT-4-VISION-100',
    'bg-GPT-4-VISION-200',
    'bg-DALL-E-3-100',
    'bg-DALL-E-3-200',
    'bg-background',
    'bg-background_workspace',
  ],
  theme: {
    extend: {
      transitionProperty: {
        'width': 'width'
      },
      screens: {
        '3xl': '1800px',
        '4xl': '2100px',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.4' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        smoothPing: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(2)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: 0.2 },
          '100%': { opacity: 1 },
        },
        customPulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.1 }, // customize this value
        },
        fadeInMenu: {
          '0%': { opacity: 0, transform: 'translateY(-4px) scale(0.98)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        glowPulse: {
          '0%': {
            boxShadow: '0 0 0 0px rgba(99,102,241,0)',
          },
          '20%': {
            boxShadow: '0 0 2px 2px #8a38d7',
          },
          '50%': {
            boxShadow: '0 0 4px 4px #e036bc',
          },
          '80%': {
            boxShadow: '0 0 2px 2px #8a38d7',
          },
          '100%': {
            boxShadow: '0 0 0 0 rgba(99,102,241,0)',
          },
        },
      },
      animation: {
        blink: 'blink 1s step-start infinite',
        ripple: 'ripple 0.6s linear',
        smoothPing: 'smoothPing 1.8s linear infinite',
        'fade-in': 'fadeIn 1.5s forwards infinite',
        customPulse: 'customPulse 1.5s ease-in-out infinite',
        'glow-twice': 'glowPulse .75s linear forwards 2',
        'glow-multiple': 'glowPulse .9s linear 5 forwards',
        'glow-infinite': 'glowPulse .9s linear infinite',
      },
      colors: {
        background: "var(--background-color)",
        background_workspace: "var(--background-workspace-color)",
        primary: {
          100: "#D4CCFB",
          200: "#A694F3",
          300: "#755BEA",
        },
        fontColor: "var(--text-color)",
        hoverBg: "var(--hover-background)",
        textColor: {
          100: "#ABAEB4",
          200: "#78716C",
          300: "#333333",
        },
        'light-hover': {
          100: "#F8F8F8",
          200: "#E3E3E4",
        },
        separator: "var(--separator-color)",
        'GPT-4': {
          100: "#F8D4F1",
          200: "#D163DA",
        },
        'LLAMA-2': {
          100: "#C8E6C9",
          200: "#388E3C",
        },
        'MISTRAL-8X7B': {
          100: "#FFE0B2",
          200: "#EF6C00",
        },
        'CLAUDE-3-OPUS': {
          100: "#FFF9C4",
          200: "#FBC02D",
        },
        'CLAUDE-3-SONNET': {
          100: "#c2f6ff",
          200: "#5BBCFF",
        },
        'GEMINI-PRO': {
          100: "#F7AFC1",
          200: "#D10363",
        },
        'GPT-4-VISION': {
          100: "#EBDDCF",
          200: "#AF8F6F",
        },
        'DALL-E-3': {
          100: "#FFDDDD",
          200: "#FF0000",
        },
      },
    },
  },
  plugins: [],
}

