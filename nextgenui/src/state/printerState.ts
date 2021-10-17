import {useSocket} from "../api/socket";
import create from "zustand";

interface PrinterState {
    text: string,
    notSetYet?: boolean,
    flags: {
        operational: boolean,
        paused: boolean,
        printing: boolean,
        pausing: boolean,
        cancelling: boolean,
        sdReady: boolean,
        error: boolean,
        ready: boolean,
        closedOrError: boolean,
    }
}

interface PrinterStateStore extends PrinterState {
    set: (newState: object) => void;
}

export const usePrinterStateStore = create<PrinterStateStore>(set => ({
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
    },
    set: (newState) => set({
        notSetYet: false,
        ...newState
    })
}))

export const usePrinterState = () => {
    return usePrinterStateStore()
}

// Name starting with 'use' is weird, but it is a hook...
export const useTrackPrinterState = () => {
    const setPrinterState = usePrinterStateStore(state => state.set)

    const onMessage = (msg: any) => {
        const data = msg.history ? msg.history : msg.current

        setPrinterState(data.state)
    }

    useSocket("current", onMessage)
    useSocket("history", onMessage)
}
