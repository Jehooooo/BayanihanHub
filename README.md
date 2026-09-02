# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Google Maps Live Location Setup

The Post Item page includes a **Live Location** section with **Use Current Location**, browser geolocation permission handling, map display, map-click location selection, and latitude/longitude saved with the posted item.

1. Enable the **Maps JavaScript API** for your Google Cloud project and create a browser API key.
2. Copy `.env.example` to `.env`.
3. Put your browser key in `.env`:

```env
VITE_GOOGLE_MAPS_API_KEY=YOUR_BROWSER_API_KEY
```

4. Restrict the key in Google Cloud by HTTP referrer (for local development, allow `http://localhost:5173/*`). Do not commit `.env` to source control.
5. Restart the Vite development server after changing `.env`:

```cmd
npm install
npm run dev
```

The key is loaded through Vite's environment-variable system rather than being hard-coded in the React source. Because the Maps JavaScript API runs in the browser, a browser key is necessarily delivered to the client at runtime; restricting the key by allowed referrers/APIs is therefore important.
