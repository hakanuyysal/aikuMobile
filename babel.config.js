module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@app': './app',
          'events': 'react-native-polyfill-globals',
          'stream': 'stream-browserify',
          'buffer': '@craftzdog/react-native-buffer',
          'http': '@tradle/react-native-http',
          'https': 'https-browserify',
          'net': 'react-native-tcp',
          'crypto': 'react-native-crypto',
          'url': 'react-native-url',
          'tls': 'tls-browserify',
          'zlib': 'browserify-zlib',
          'assert': 'assert',
        },
      },
    ],
  ],
};
