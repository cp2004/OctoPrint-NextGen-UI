import * as React from "react"
import {IconButton, useTheme} from "@mui/material";
import {useChangeTheme} from "../ThemeContext";
import DarkModeIcon from '@mui/icons-material/Brightness4';
import LightModeIcon from '@mui/icons-material/Brightness5';

export default function DarkModeToggle () {
    const theme = useTheme()

    const changeTheme = useChangeTheme()

    const handleChange = () => {
        changeTheme({
            paletteMode: theme.palette.mode === "dark" ? "light" : "dark"
        })
    }


    return (
        <>
            <IconButton color={"inherit"} onClick={handleChange}>
                {theme.palette.mode === "dark" ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
        </>
    )
}
