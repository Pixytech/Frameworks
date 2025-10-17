/// <reference types='vitest' />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import * as path from 'path';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/libs/angular',
  plugins: [
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
    }),
  ],
  esbuild: {
    target: 'es2020',
  },
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  // Configuration for building your library.
  // See: https://vitejs.dev/guide/build.html#library-mode
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: 'src/index.ts',
      name: '@mlp/angular',
      fileName: 'index',
      // Change this to the formats you want to support.
      // Don't forget to update your package.json as well.
      formats: ['es' as const],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: [
        '@angular/core',
        '@angular/common',
        '@angular/forms',
        '@angular/animations',
        '@angular/cdk',
        'ng-zorro-antd',
        'ng-zorro-antd/card',
        'ng-zorro-antd/button',
        'ng-zorro-antd/space',
        'ng-zorro-antd/typography',
        'ng-zorro-antd/alert',
        'ng-zorro-antd/spin',
        'ng-zorro-antd/icon',
        'ng-zorro-antd/tag',
        'ng-zorro-antd/statistic',
        'ng-zorro-antd/list',
        'ng-zorro-antd/badge',
        'ng-zorro-antd/core/config',
        '@ant-design/icons-angular',
        '@ant-design/icons-angular/icons',
        'rxjs',
        'rxjs/operators'
      ],
    },
  },
}));
