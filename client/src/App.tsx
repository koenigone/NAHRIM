import { Routes, Route } from "react-router-dom";
import { ChakraProvider, extendTheme, StyleFunctionProps } from "@chakra-ui/react";
import { Toaster } from "react-hot-toast";
import { DataSourceProvider } from "../context/dataSourceContext";
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
        bg: props.colorMode === 'light' 
        ? 'linear-gradient(135deg, #a3e3f3 0%, #6fc1e7 40%, #4d8ee0 100%)' 
        : '#121212',
        color: props.colorMode === 'light' ? 'white' : 'rgba(224, 224, 224, 0.7)',
      },
    }),
  },
});

function App() {
  return (
    <DataSourceProvider>
      <ChakraProvider theme={theme}>
        <Toaster />
        <Routes>
          <Route path="/" element={<Layout><DataDashboard /></Layout>} />
          <Route path="/maps" element={<Layout><MapsDashboard /></Layout>} />
        </Routes>
      </ChakraProvider>
    </DataSourceProvider>
  );
}

export default App;