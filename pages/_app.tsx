import 'styles/globals.css'
import 'css/style.css'
import 'css/style-item.css'
import 'css/sidebar.css'
import 'css/lightgallery.css'
import type { AppProps } from 'next/app'
import { Provider } from 'wagmi'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    // Use wagmi React Hooks to interact with Ethereum
    <Provider autoConnect>
      <Component {...pageProps} />
    </Provider>
  )
}

export default MyApp
