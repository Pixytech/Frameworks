import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/angular-app',

  server: {
    port: 4200,
    host: 'localhost',
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [nxViteTsPaths()],

  esbuild: {
    target: 'es2022'
  },

  define: {
    'ngJestMode': false,
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },

  optimizeDeps: {
    include: [
      '@angular/core',
      '@angular/common',
      '@angular/router',
      '@angular/platform-browser',
      '@angular/platform-browser-dynamic',
      '@angular/compiler',
      '@angular/animations',
      '@angular/forms',
      'zone.js',
      'rxjs'
    ],
    exclude: [
      '@mlp/angular',
      '@mlp/core'
    ]
  },

  resolve: {
    alias: {
      '@angular/core': '@angular/core',
      '@angular/common': '@angular/common',
      '@angular/platform-browser': '@angular/platform-browser',
      '@angular/platform-browser-dynamic': '@angular/platform-browser-dynamic',
      '@angular/compiler': '@angular/compiler'
    }
  },

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  build: {
    outDir: '../../dist/apps/angular-app',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
