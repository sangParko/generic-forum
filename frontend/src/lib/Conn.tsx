export interface ServerMsg {
    Function: string;
    Data: string;
}

export default class Conn {
    socket: WebSocket;
    routes: Map<string, (data: string) => void>;

    constructor() {
        this.socket = this.setupSocket()
        this.routes = new Map<string, (data: string) => void>();
        this.registerRoute("message", (msg: string) => {
            console.log(msg)
        })
    }

    registerRoute = (route: string, func: (data: string) => void) => {
        this.routes.set(route, func)
    }

    handleReq = (route: string, data: string) => {
        if (!this.routes.has(route)) {
            console.error("undefined route");
            return;
        }
        let func = this.routes.get(route) as Function;
        func(data);
    }

    setupSocket = () => {
        this.socket = new WebSocket('ws://' + window.location.hostname + ':443/ws');
        // this.socket = new WebSocket('wss://' + window.location.hostname + ':443/ws');
        this.socket.onopen = this.onopen;
        this.socket.onmessage = this.onMessage();
        this.socket.onclose = this.onclose;
        this.socket.onerror = this.onerror;
        return this.socket
    }

    onMessage = () => {
        return (event: MessageEvent) => {
            let serverMsg: ServerMsg = JSON.parse(event.data);
            console.log(serverMsg.Data);
            this.handleReq(serverMsg.Function, serverMsg.Data)
        };
    }

    send = (msg: string) => {
        if(this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(msg);
            return
        }

        if(this.socket.readyState === WebSocket.CLOSED ||
            this.socket.readyState === WebSocket.CLOSING) {
            this.setupSocket();
        }
    };

    onopen = (e: Event) => {

    };

    onclose = (event: CloseEvent) => {
        if (!event.wasClean) {
            console.error('connection died');
            this.setupSocket()
        }
    };

    onerror = (error: Event) => {
        console.log(error);
    };
}