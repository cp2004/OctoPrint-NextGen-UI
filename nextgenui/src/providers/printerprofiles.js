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
    // TODO this doesn't seem to work, always giving me back the empty list ?!
    const context = React.useContext(ProfileContext)
    let selectedProfile = {}
    if (context.profiles && context.profiles.length){
        Object.values(context.profiles).forEach((profile) => {
            selectedProfile = profile
            // if (profile.active) {
            //     selectedProfile = profile
            // }
        })
    }
    console.log(selectedProfile)
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
