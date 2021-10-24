import * as React from "react";
import {ThemeProvider, useMediaQuery} from "@mui/material";
import theme from "../theme";
import {createTheme} from "@mui/material/styles";

export const DispatchContext = React.createContext((payload) => {
    throw new Error("Forgot to give the dispatch context a value")
})

const themeDefaultOptions = {
    paletteMode: 'light',
    paletteColors: {}
}

export default function ThemeContextProvider ({children}) {

    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
    const preferredMode = prefersDarkMode ? 'dark' : 'light'

    const reducer = (state, action) => {
        switch (action.type) {
            case 'RESET_COLORS':
                return {
                    ...state,
                    paletteColors: themeDefaultOptions.paletteColors,
                };
            case 'CHANGE':
                return {
                    ...state,
                    paletteMode: action.payload.paletteMode || state.paletteMode,
                    paletteColors: action.payload.paletteColors || state.paletteColors,
                }
            default:
                throw new Error(`Unrecognized type ${action.type}`)
        }
    }

    const [themeOptions, dispatch] = React.useReducer(
        reducer,
        {...themeDefaultOptions, paletteMode: preferredMode}
    )

    const brandingTheme = React.useMemo(() => {
        const designTokens = theme(themeOptions.paletteMode)
        return createTheme({
            ...designTokens,
            palette: {
                ...designTokens.palette,
                ...themeOptions.paletteColors,
                mode: themeOptions.paletteMode
            }
        })
    }, [themeOptions])

    React.useEffect(() => {
        try {
            const item = window.localStorage.getItem("themeOptions")
            if (item) {
                console.log(JSON.parse(item))
                dispatch({type: "CHANGE", payload: JSON.parse(item)})
            }
        } catch (e) {
            console.error(e)
        }
    }, [])

    React.useEffect(() => {
        // Save state to local storage for later use
        try {
            window.localStorage.setItem("themeOptions", JSON.stringify(themeOptions))
        } catch (e) {
            console.error(e)
        }
    }, [themeOptions])


    return (
        <ThemeProvider theme={brandingTheme}>
            <DispatchContext.Provider value={dispatch}>
                {children}
            </DispatchContext.Provider>
        </ThemeProvider>
    )
}

export function useChangeTheme() {
    const dispatch = React.useContext(DispatchContext)
    return React.useCallback((options) => dispatch({
        type: 'CHANGE',
        payload: options
    }), [dispatch])
}
