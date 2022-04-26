import React, {VFC, useCallback, forwardRef, RefObject} from 'react';
import { ChatZone, Section, StickyHeader } from '@components/ChatList/styles';
import {IDM} from '@typings/db'
import Chat from '@components/Chat'
import { Scrollbars } from 'react-custom-scrollbars';


interface Props {
    scrollbarRef: RefObject<Scrollbars>;
    chatSections: {[key: string]: IDM[]}; //객체임 
    setSize: (f: (size: number) => number) => Promise<IDM[][] | undefined>;
    isEmpty : boolean;
    isReachingEnd : boolean;
}

const ChatList = forwardRef<Scrollbars, Props>(({scrollbarRef, chatSections, setSize, isEmpty, isReachingEnd}) => {
    const onScroll =  useCallback((values: any) => {   
        // 위로 스크롤해서 과거채팅들 로딩 구현 
        if (values.scrollTop === 0 && !isReachingEnd) {
            // 가장 위일때, 데이터 로딩 
            setSize ((prevSize: number) => prevSize + 1)
            .then(() => {
                scrollbarRef.current?.scrollTop(scrollbarRef.current?.getScrollHeight() - values.getScrollHeight)
            })
        }
    }, [])


    return (
        <ChatZone>
            <Scrollbars ref={scrollbarRef} onScrollFrame={onScroll}>
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