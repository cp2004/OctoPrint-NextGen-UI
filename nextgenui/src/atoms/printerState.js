import {atom, useRecoilValue, useSetRecoilState} from "recoil"
import {useSocket} from "../api/socket";

const printerState = atom({
    key: "printerState",
    default: {
        text: "",
        notSetYet: true, // Removed on first socket message, used to show 'skeleton' elements
        flags: {
            operational: false,
            paused: false,
            printing: false,
            pausing: false,
            cancelling: false,
            sdReady: false,
            error: false,
            ready: false,
            closedOrError: true,  // Assume no printer to start with
        }
    }
})

export const usePrinterState = () => {
    return useRecoilValue(printerState)
}

// Name starting with 'use' is weird, but it is a hook...
export const useTrackPrinterState = () => {
    const setPrinterState = useSetRecoilState(printerState)

    const onMessage = (msg) => {
        const data = msg.history ? msg.history : msg.current

        setPrinterState(data.state)
    }

    useSocket("current", onMessage)
    useSocket("history", onMessage)
}
