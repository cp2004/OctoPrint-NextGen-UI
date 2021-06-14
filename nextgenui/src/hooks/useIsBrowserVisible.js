import * as React from "react"

export default function useIsBrowserVisible(){
    const [isVisible, setIsVisible] = React.useState(true)

    const handleVisibilityChange = () => {
        if (document.hidden){
            setIsVisible(false)
        } else {
            setIsVisible(true)
        }
    }

    React.useEffect(() => {
        document.addEventListener("visibilitychange", handleVisibilityChange, false)
    }, [])

    return isVisible
}
