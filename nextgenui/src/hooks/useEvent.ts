import {useSocket} from "../api/socket";

interface Event {
    event: {
        type: string,
        payload: object,
    }
}

export default function useEvent (callbackFn: Function, events: string[]) {
    const handleEvent = (data: Event) => {
        if (events.includes(data.event.type)){
            callbackFn(data.event.payload)
        }
    }

    useSocket("event", handleEvent)
}
