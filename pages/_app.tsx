import '../styles/globals.css';
import { ChakraProvider } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
import { QueryClientProvider, QueryClient } from 'react-query';

const queryClient = new QueryClient();

const CustomQueryClientProvider: any = QueryClientProvider;

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <CustomQueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </CustomQueryClientProvider>
    </ChakraProvider>
  );
}

export default MyApp;
