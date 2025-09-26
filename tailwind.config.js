/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Light mode colors (based on your CSS variables)
        background: "hsl(0, 0%, 100%)", // #ffffff
        foreground: "hsl(220, 9%, 46%)", // #4b5563
        card: "hsl(39, 85%, 96%)", // #fffbeb
        "card-foreground": "hsl(220, 9%, 46%)", // #4b5563
        popover: "hsl(0, 0%, 100%)", // #ffffff
        "popover-foreground": "hsl(220, 9%, 46%)", // #4b5563
        primary: "#0A3D62", // new primary tone
        "primary-foreground": "hsl(0, 0%, 100%)", // #ffffff
        secondary: "hsl(24, 95%, 53%)", // #f97316
        "secondary-foreground": "hsl(0, 0%, 100%)", // #ffffff
        muted: "hsl(210, 20%, 98%)", // #f9fafb
        "muted-foreground": "hsl(220, 9%, 46%)", // #4b5563
        accent: "hsl(24, 95%, 53%)", // #f97316
        "accent-foreground": "hsl(0, 0%, 100%)", // #ffffff
        destructive: "hsl(0, 84%, 60%)", // #dc2626
        "destructive-foreground": "hsl(0, 0%, 100%)", // #ffffff
        border: "hsl(220, 13%, 91%)", // #e5e7eb
        input: "hsl(0, 0%, 100%)", // #ffffff
        ring: "#0A3D62",
      },
      fontFamily: {
        sans: ["System"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        sm: "calc(0.5rem - 4px)",
        md: "calc(0.5rem - 2px)",
        lg: "0.5rem",
        xl: "calc(0.5rem + 4px)",
      },
      animation: {
        spin: "spin 1s linear infinite",
      },
    },
  },
  plugins: [],
};
