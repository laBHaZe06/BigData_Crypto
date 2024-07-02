import React from 'react';
import { Box, IconButton } from "@mui/material";
// import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import Header from "../../components/Header";
// import { WebSocketContext } from '../../context/WebSocketContext';

const Home = () => {
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);
  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD Crypto VIZ" subtitle="Welcome to your analysis's crypto dashboard" crypto={""} />
        <Box display="flex" alignItems="center">
          <IconButton>
            <DownloadOutlinedIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default Home;