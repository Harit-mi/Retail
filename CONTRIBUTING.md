# Contributing to DukaanPOS

Thank you for your interest in contributing to **DukaanPOS** — the Multi-Vertical Retail Software for Indian Small & Medium Businesses!

## How to Contribute

1. **Fork the Repository**: Create your own copy of `Harit-mi/Retail`.
2. **Clone & Install**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Retail.git
   cd Retail
   npm install
   ```
3. **Run Dev Server & Tests**:
   ```bash
   npm run dev      # Start Vite local server
   npm test         # Run Vitest unit tests
   npm run build    # Verify production build
   ```
4. **Create a Feature Branch**: `git checkout -b feature/awesome-retail-feature`
5. **Submit a Pull Request**: Explain your changes and link relevant issues.

## Testing Guidelines
Ensure all money math & GST split calculations include test coverage in `src/tests/gstMath.test.js`.
