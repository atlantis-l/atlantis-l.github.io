import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  base: "/",
  build: {
    chunkSizeWarningLimit: 99999,
    rollupOptions: {
      output: {
        entryFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
      external: ["PingFangSC-Regular.woff2", "SF-Mono-Regular.woff2"],
      onLog: () => {},
    },
    target: "ESNext",
  },
  plugins: [vue()],
});
