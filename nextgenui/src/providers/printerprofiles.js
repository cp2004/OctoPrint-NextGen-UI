/*
Providers for printer profiles
 */

import * as React from 'react';

const ProfileContext = React.createContext({
    profiles: []
})

export const ProfileProvider = ProfileContext.Provider

export function useProfiles() {
    return React.useContext(ProfileContext)
}

export function useActiveProfile () {
    const context = React.useContext(ProfileContext)
    let selectedProfile = {}
    if (context.profiles){
        Object.values(context.profiles).forEach((profile) => {
            if (profile.current) {
                selectedProfile = profile
            }
        })
    }
    return selectedProfile
}

export function useProfile(id) {
    const context = React.useContext(ProfileContext)
    return context.profiles[id]
}

export function useProfileList() {
    const context = React.useContext(ProfileContext)
    return Object.keys(context.profiles)
}
