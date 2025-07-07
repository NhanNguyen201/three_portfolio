import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
    base: "./",
    plugins: [
      tailwindcss(),
    ],
    assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.bin', '**/*.jpg', '**/*.png'],

    build: {
      minify: "terser",
      target: "ES2022"
    },
})