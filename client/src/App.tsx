import { Routes, Route } from "react-router-dom";
import { ChakraProvider, extendTheme, StyleFunctionProps } from "@chakra-ui/react";
import { Toaster } from 'react-hot-toast';
import Layout from './layout';
import DataDashboard from "./dashboards/dataDashboard/dataDashboard";
import MapsDashboard from "./dashboards/mapsDashboard/mapsDashboard";

const theme = extendTheme({
  config: {
    initialColorMode: 'light', // default theme
    useSystemColorMode: false, // disable system color mode
  },
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        bg: props.colorMode === 'light' ? '#FCFCFC' : '#121212',
        color: props.colorMode === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(224, 224, 224, 0.7)',
      },
    }),
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Toaster />
      <Routes>
        <Route path="/" element={<Layout><DataDashboard /></Layout>} />
        <Route path="/maps" element={<Layout><MapsDashboard /></Layout>} />
      </Routes>
    </ChakraProvider>
  );
}

export default App;