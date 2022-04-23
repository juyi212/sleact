import io from 'socket.io-client';
import { useCallback } from 'react';
import axios from 'axios';

const backUrl = 'http://localhost:3095'
const sockets: { [key : string]: SocketIOClient.Socket} = {}
const useSocket = (workspace? : string): [SocketIOClient.Socket | undefined, () => void ]=> {
    const disconnet = useCallback(() => {
        if(workspace) {
            sockets[workspace].disconnect()
            delete sockets[workspace] // 연결도 끊었으니 객체 지우기  
        }
    }, [workspace])
    if (!workspace){
        return [undefined, disconnet] 
    }
    if (!sockets[workspace]) {
        sockets[workspace] = io.connect(`${backUrl}/ws-${workspace}`, {
            transports: ['websocket']
        })
    }

    return [sockets[workspace], disconnet]
}

export default useSocket;