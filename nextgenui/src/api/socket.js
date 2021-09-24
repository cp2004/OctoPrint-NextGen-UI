import SockJS from "sockjs-client";
import * as React from "react"
import {useEffect} from "react";

const normalClose = 1000;  // Error code for normal close

class OctoPrintSocketClient {
    constructor(url, opts) {
        this.options = {
            timeouts: [0, 1, 1, 2, 3, 5, 8, 13, 20, 40, 100],
            connectTimeout: 5000,
            rateSlidingWindowSize: 20,
            ...opts
        }

        this.url = url
        if (!url.endsWith("/")){
            this.url = url + "/"
        }

        this.socket = undefined
        this.reconnecting = false
        this.reconnectTrial = 0
        this.registeredHandlers = {}

        this.rateThrottleFactor = 1
        this.rateBase = 500
        this.rateLastMeasurements = []

        this.connectTimeout = undefined

        this.onMessage("connected", () => {
            if (this.connectTimeout){
                clearTimeout(this.connectTimeout)
                this.connectTimeout = undefined
            }
        })
    }

    propagateMessage = (data) => {
        const start = new Date().getTime()

        const catchAllHandlers = this.registeredHandlers["*"]
        const registeredHandlers = this.registeredHandlers[Object.keys(data)[0]]

        const handlers = [].concat(catchAllHandlers ? catchAllHandlers : []).concat(registeredHandlers ? registeredHandlers : [])

        if (handlers && handlers.length) {
            handlers.forEach(handler => handler(data))
        }

        const end = new Date().getTime()

        this.analyzeTiming(end - start)
    }

    connect = (opts) => {
        opts = opts || {}
        const self = this
        self.disconnect()

        let timeout = self.options.connectTimeout
        if (opts.hasOwnProperty("connectTimeout")) {
            timeout = opts.connectTimeout
            delete opts.connectTimeout;
        }

        const onOpen = () => {
            self.reconnecting = false
            self.reconnectTrial = 0
            self.onConnected();
        }

        const onClose = (e) => {
            if (e.code === normalClose){
                return
            }

            if (self.onReconnectAttempt(self.reconnectTrial)){
                return
            }

            self.onDisconnected(e.code);

            if (self.reconnectTrial < self.options.timeouts.length) {
                const timeout = self.options.timeouts[self.reconnectTrial]
                setTimeout(() => self.reconnect(), timeout * 1000);
                self.reconnectTrial++
            } else {
                self.onReconnectFailed()
            }
        }

        const onMessage = (msg) => {
            self.propagateMessage(msg.data)
        }

        if (self.connectTimeout) {
            clearTimeout(self.connectTimeout)
        }
        if (timeout > 0) {
            self.connectTimeout = setTimeout(() => self.onConnectTimeout(), timeout)
        }

        self.socket = new SockJS(this.url + "sockjs", undefined, opts)
        self.socket.onopen = onOpen
        self.socket.onclose = onClose
        self.socket.onmessage = onMessage;
    }

    reconnect = () => {
        this.disconnect();
        this.socket = undefined;
        this.connect()
    }

    disconnect = () => {
        if (this.socket !== undefined) {
            this.socket.close()
        }
    }

    onMessage = (message, handler) => {
        if (!this.registeredHandlers.hasOwnProperty(message)){
            this.registeredHandlers[message] = []
        }
        this.registeredHandlers[message].push(handler)
        return this;
    }

    removeMessage = (message, handler) => {
        if (!this.registeredHandlers.hasOwnProperty(message)) {
            // No handlers registered, do nothing
            return;
        }
        const index = this.registeredHandlers[message].indexOf(handler)
        if (index > -1){
            this.registeredHandlers[message].splice(index, 1)
        }
    }

    increaseRate = () => {
        if (this.rateThrottleFactor <= 1) {
            this.rateThrottleFactor = 1;
            return
        }
        this.rateThrottleFactor--
        this.sendThrottleFactor()
    }

    decreaseRate = () => {
        this.rateThrottleFactor++;
        this.sendThrottleFactor()
    }

    sendThrottleFactor = () => {
        this.sendMessage("throttle", this.rateThrottleFactor)
    }

    sendAuth = (userID, session) =>{
        this.sendMessage("auth", `${userID}:${session}`)
    }

    sendMessage = (type, payload) => {
        const data = {}
        data[type] = payload;
        this.socket.send(JSON.stringify(data));
    }

    // noinspection UnusedParameter
    onReconnectAttempt = (trial) => {}
    onReconnectFailed = () => {}
    onConnected = () => {}
    onDisconnected = (code) => {}
    onConnectTimeout = () => {}
    onRateTooLow = (measured, minimum) => {
        this.increaseRate()
    }
    onRateTooHigh = (measured, maximum) => {
        this.decreaseRate()
    }


    analyzeTiming = (measurement) => {
        while (this.rateLastMeasurements.length >= this.options.rateSlidingWindowSize) {
            this.rateLastMeasurements.shift()
        }
        this.rateLastMeasurements.push(measurement)

        const processingLimit = this.rateThrottleFactor * this.rateBase
        if (measurement > processingLimit){
            this.onRateTooHigh(measurement, processingLimit)
        } else if (this.rateThrottleFactor > 1) {
            const maxProcessingTime = Math.max.apply(null, this.rateLastMeasurements)
            const lowerProcessingLimit = (this.rateThrottleFactor - 1) * this.rateBase;
            if (maxProcessingTime < lowerProcessingLimit) {
                this.onRateTooLow(maxProcessingTime, lowerProcessingLimit)
            }
        }
    }
}

export default OctoPrintSocketClient


const SocketContext = React.createContext(null)

export const SocketProvider = SocketContext.Provider

export function useSocket (message, callback) {
    const socketClient = React.useContext(SocketContext)
    return useEffect(() => {
        socketClient.onMessage(message, callback)
        // Prevent memory leak from infinite handlers
        return () => {socketClient.removeMessage(message, callback)}
    }, [socketClient, callback, message])
}
