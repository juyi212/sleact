import React, {useCallback, useEffect, useRef, useState} from 'react'
import { Container, Header } from './styles';
import gravatar from 'gravatar'
import useSWR, { mutate } from 'swr';
import useSWRInfinite from 'swr/infinite'
import { IChannel, IDM, IUser } from '@typings/db';
import { useParams } from 'react-router';
import fetcher from '@utils/fetcher';
import ChatBox from '@components/ChatBox';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useInput';
import axios from 'axios';
import makeSection from '@utils/makeSection';
import Scrollbars from 'react-custom-scrollbars';
import useSocket from '@hooks/useSocket';
import { DragOver } from '@pages/Channel/styles';


const DirectMessage = () => {
    const { workspace, id } = useParams<{ workspace: string, id: string }>();
    const { data: myData } = useSWR('/api/users', fetcher);
    const { data: userData } = useSWR(`/api/workspaces/${workspace}/users/${id}`, fetcher);
    const [chat, onChangeChat, setChat] = useInput('')
    const [dragOver, setDragOver] = useState(false)
    const [socket] = useSocket(workspace)
    const {data: chatData, mutate: mutateChat, setSize } = useSWRInfinite<IDM[]> ((index) =>
        `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=${index+1}`,
        fetcher
    ) // 2차원 배열임 > [[{id:1}, {id:3}],[{id:3}, {id:4}]] 이런식   
    const isEmpty = chatData?.[0]?.length === 0; // 데이터가 비어있을 경우  
    const isReachingEnd = isEmpty || (chatData && chatData[chatData.length-1]?.length < 20) || false;
    const scrollbarRef = useRef<Scrollbars>(null) // 스크롤바를 컨트롤 > 채팅을하다가 스크롤 올리고 다시 채팅을 했을 때 내려가야함 

    const onSubmitForm = useCallback((e: any)=> {
        e.preventDefault();
        if (chat?.trim() && chatData){
            const savedChat = chat ; //옵티멉스 UI 
            mutateChat((prevChatData) => {
                prevChatData?.[0].unshift({
                    id: (chatData[0][0]?.id || 0) + 1,
                    content: savedChat,
                    SenderId: myData.id,
                    Sender: myData,
                    ReceiverId: userData.id,
                    Receiver: userData,
                    createdAt: new Date(),
                })
                return prevChatData
            }, false)
            .then(() => {
              localStorage.setItem(`${workspace}-${id}`, new Date().getTime().toString());
              setChat('');
              mutateChat()
              if (scrollbarRef.current) {
                console.log('scrollToBottom!', scrollbarRef.current?.getValues());
                scrollbarRef.current.scrollToBottom();
              }
            })
            axios.post(`/api/workspaces/${workspace}/dms/${id}/chats`, {
                content: chat
            })
            .catch((error) => {
                console.log(error)
            })
        }
    },[chat, workspace, id, myData, userData, chatData, mutateChat, setChat])
    
    const onMessage = useCallback(
        (data: IDM) => {
          if (data.SenderId === Number(id) && myData.id !== Number(id)) {
            mutateChat((chatData) => {
              chatData?.[0].unshift(data);
              return chatData;
            }, false).then(() => {
              if (scrollbarRef.current) {
                if (
                  scrollbarRef.current.getScrollHeight() <
                  scrollbarRef.current.getClientHeight() + scrollbarRef.current.getScrollTop() + 250
                ) {
                  //console.log('scrollToBottom!', scrollbarRef.current?.getValues());
                  setTimeout(() => {
                    scrollbarRef.current?.scrollToBottom();
                  }, 100);
                }
              }
            });
          }
        },
        [id, myData, mutateChat],
      );
    
      useEffect(() => {
        localStorage.setItem(`${workspace}-${id}`, new Date().getTime().toString());
    }, [workspace, id]);

      
    const onDrop = useCallback((e: any) => {
      e.preventDefault()
      const formData = new FormData();
      if (e.dataTransfer.items) {
        for (var i = 0; i < e.dataTransfer.items.length; i++) {
          if (e.dataTransfer.items[i].kind === 'file') {
            var file = e.dataTransfer.items[i].getAsFile();
            console.log('... file[' + i + '].name = ' + file.name);
            formData.append('image', file)
          }
        }
      } else {
        for (var i = 0; i < e.dataTransfer.files.length; i++) {
          console.log('... file[' + i + '].name = ' + e.dataTransfer.files[i].name);
          formData.append('image', e.dataTransfer.files[i]);
        }
      }
      axios.post(`/api/workspaces/${workspace}/dms/${id}/images`, formData). then(() => {
        setDragOver(false)
        mutateChat();
        localStorage.setItem(`${workspace}-${id}`, new Date().getTime().toString());
      })
    } ,[])

    const onDragOver = useCallback((e: any) => {
      e.preventDefault()
      setDragOver(true)
    } ,[])

    // DM 보내기
    useEffect(() => {
        socket?.on('dm', onMessage)
        return () => {
            socket?.off('dm', onMessage)
        }
    }, [socket, onMessage])

    useEffect(() => {
        // 스크롤바 맨 아래로 
        if(chatData?.length === 1) {
            scrollbarRef.current?.scrollToBottom();
        }
    },[chatData])


    if (!userData || !myData) {
        return null;
      }

    //immutable하게 reverse! concat을 써도됨 
    // flat 2차원을 1차원으로 
    const chatSections = makeSection(chatData ? chatData.flat().reverse() : []) 


    return (
        <Container onDrop={onDrop} onDragOver={onDragOver}>
            <Header>
                <img src={gravatar.url(userData.email, { s: '24px', d: 'retro' })} alt={userData.nickname} />
                <span>{userData.nickname}</span>
            </Header>
            <ChatList 
                chatSections = {chatSections} 
                scrollbarRef={scrollbarRef} 
                setSize = {setSize} 
                isEmpty = {isEmpty}
                isReachingEnd = {isReachingEnd}
                />
            <ChatBox chat ={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm}/>
            {dragOver && <DragOver>업로드! </DragOver>}
        </Container>
    )
}

export default DirectMessage;