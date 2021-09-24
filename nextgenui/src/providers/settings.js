import * as React from "react"

const SettingsContext = React.createContext({})

export const SettingsProvider = SettingsContext.Provider

export function useSettings () {
    return React.useContext(SettingsContext)
}

export function usePluginSettings (plugin) {
    const context = React.useContext(SettingsContext)
    return (context.plugins ? context.plugins[plugin] : {})
}
