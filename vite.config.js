import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        product: resolve(__dirname, 'product.html'),
        cart: resolve(__dirname, 'cart.html'),
        login: resolve(__dirname, 'login.html'),
        checkout: resolve(__dirname, 'checkout.html'),
        orders: resolve(__dirname, 'orders.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
})