import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Mirror of the CloudFront /cam-proxy/* path used in production —
      // forwards canvas image fetches to TFL S3 with CORS so generatePolaroid
      // can read the image into a canvas without tainting it.
      '/cam-proxy': {
        target: 'https://s3-eu-west-1.amazonaws.com/jamcams.tfl.gov.uk',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cam-proxy/, ''),
      },
    },
  },
})
