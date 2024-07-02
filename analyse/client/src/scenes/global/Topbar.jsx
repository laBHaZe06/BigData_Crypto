import React, { useContext, useState } from "react";
import { Box, IconButton, useTheme } from "@mui/material";
import { InputBase } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { ColorModeContext, tokens } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import cryptoData from "../../data/cryptoData";
import SearchResult from "../../components/SearchResult";
import { useNavigate } from "react-router-dom";

const Topbar = ({ onSearchSubmit }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const navigate = useNavigate(); // Utilisation de useNavigate pour la navigation

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query === "") {
      setFilteredResults([]);
    } else {
      const results = cryptoData.filter(
        (crypto) =>
          crypto.name.toLowerCase().includes(query.toLowerCase()) ||
          crypto.symbol.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredResults(results);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (filteredResults.length > 0) {
      const firstResult = filteredResults[0];
      onSearchSubmit(firstResult.symbol); // Appeler la fonction onSearchSubmit avec le symbole de la crypto-monnaie sélectionnée
      navigate(`/${firstResult.symbol}`); // Naviguer vers le chemin du tableau de bord
    }
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" p={2}>
        {/* BARRE DE RECHERCHE */}
        <form onSubmit={handleSubmit}>
          <Box
            display="flex"
            backgroundColor={colors.primary[400]}
            borderRadius="3px"
          >
            <InputBase
              sx={{ ml: 2, flex: 1 }}
              placeholder="Rechercher"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <IconButton type="submit" sx={{ p: 1 }}>
              <SearchIcon />
            </IconButton>
          </Box>
        </form>

        {/* AFFICHAGE DES RÉSULTATS DE LA RECHERCHE */}
        <Box md={3}>
          {filteredResults.map((crypto, index) => (
            <Box key={index}>
              <SearchResult props={crypto} />
            </Box>
          ))}
        </Box>

        {/* ICÔNES D'ACTION */}
        <Box display="flex">
          <IconButton onClick={colorMode.toggleColorMode}>
            {theme.palette.mode === "dark" ? (
              <DarkModeOutlinedIcon />
            ) : (
              <LightModeOutlinedIcon />
            )}
          </IconButton>
          <IconButton>
            <NotificationsOutlinedIcon />
          </IconButton>
          <IconButton>
            <SettingsOutlinedIcon />
          </IconButton>
        </Box>
      </Box>
    </>
  );
};

export default Topbar;