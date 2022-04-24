import React, {VFC, useCallback, useRef} from 'react';
import { ChatZone, Section, StickyHeader } from '@components/ChatList/styles';
import {IDM} from '@typings/db'
import Chat from '@components/Chat'
import { Scrollbars } from 'react-custom-scrollbars';


interface Props {
    chatData? : IDM[];
}

const ChatList: VFC<Props> = ({chatData}) => {
    const scrollbarRef = useRef(null)
    const onScroll =  useCallback(() => {   
        // 위로 스크롤해서 과거채팅들 로딩 구현 
    }, [])


    return (
        <ChatZone>
            <Scrollbars ref={scrollbarRef} onScrollFrame={onScroll}>
            {chatData?.map((chat) => (
                <Chat key={chat.id} data= {chat}/>
                ))}
            </Scrollbars>
        </ChatZone>
    )
}

export default ChatList;