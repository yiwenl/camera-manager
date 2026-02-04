import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';

export default [
  // Library config
  {
    input: 'src/CameraManager.ts',
    output: [
      {
        file: 'dist/camera-manager.es.js',
        format: 'es',
        sourcemap: true
      },
      {
        file: 'dist/camera-manager.umd.js',
        format: 'umd',
        name: 'CameraManager',
        sourcemap: true
      }
    ],
    plugins: [
      resolve(),
      typescript({
        tsconfig: './tsconfig.build.json'
      })
    ]
  },
  // Test config
  {
    input: 'dev/test.ts',
    output: {
        file: 'dist/test.js',
        format: 'iife',
        name: 'Test',
        sourcemap: true
    },
    plugins: [
        typescript({
            compilerOptions: {
                declaration: false
            }
        }),
        resolve()
    ]
  }
];
