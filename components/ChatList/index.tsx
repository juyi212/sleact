import React, {VFC, useCallback, forwardRef} from 'react';
import { ChatZone, Section, StickyHeader } from '@components/ChatList/styles';
import {IDM} from '@typings/db'
import Chat from '@components/Chat'
import { Scrollbars } from 'react-custom-scrollbars';


interface Props {
    chatSections: {[key: string]: IDM[]}; //객체임 
}

const ChatList = forwardRef<Scrollbars, Props>(({chatSections}, ref) => {
    const onScroll =  useCallback((values: any) => {   
        // 위로 스크롤해서 과거채팅들 로딩 구현 
        if (values.scrollTop === 0) {
            // 가장 위일때, 데이터 로딩 

        }
    }, [])


    return (
        <ChatZone>
            <Scrollbars ref={ref} onScrollFrame={onScroll}>
            {Object.entries(chatSections).map(([date, chats]) => { 
                return (
                    <Section className={`section-${date}`} key = {date}>
                        <StickyHeader>
                            <button>{date}</button>
                        </StickyHeader>
                        {chats.map((chat)=> (
                            <Chat key = {chat.id} data={chat} />
                        ))}
                    </Section>
                )
            })}
            </Scrollbars>
        </ChatZone>
    )
})

export default ChatList;