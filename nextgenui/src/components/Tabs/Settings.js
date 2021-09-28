import {useActiveProfile, useProfiles} from "../../providers/printerprofiles";

export default function Settings (props) {
    const activeProfileName = useActiveProfile().name

    return (
        <p>Profiles Test: {activeProfileName}</p>
    )
}
