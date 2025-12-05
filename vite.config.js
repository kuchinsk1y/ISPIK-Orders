import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [tailwindcss(), react(), viteSingleFile()],
  base: "./"
});
