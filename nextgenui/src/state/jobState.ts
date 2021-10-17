import create from "zustand";
import {useSocket} from "../api/socket";

interface JobState {
    file: object;
    estimatedPrintTime: number;
    lastPrintTime: number;
    filament: {
        length: number;
        volume: number;
    }
}

interface JobStateStore extends JobState {
    set: (newState: JobState) => void;
}

export const useJobStateStore = create<JobStateStore>(set => ({
    file: {},
    estimatedPrintTime: 0,
    lastPrintTime: 0,
    filament: {
        length: 0,
        volume: 0,
    },
    set: (newState) => set(newState)
}))

export const useJobState = () => {
    return useJobStateStore()
}

export const useTrackJobState = () => {
    const setJobState = useJobStateStore(state => state.set)

    console.log(setJobState)

    const onMessage = (msg: any) => {
        const data = msg.history ? msg.history : msg.current

        setJobState(data.job)
    }

    useSocket("current", onMessage)
    useSocket("history", onMessage)
}
