import Workspace from '@layouts/Workspace'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import { Container, DragOver, Header } from './styles'
import ChatList from '@components/ChatList'
import ChatBox from '@components/ChatBox'
import useInput from '@hooks/useInput'
import { useParams } from 'react-router'
import { stringify } from 'querystring'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'
import fetcher from '@utils/fetcher'
import { IChannel, IChat, IUser } from '@typings/db'
import useSocket from '@hooks/useSocket';
import { Scrollbars } from 'react-custom-scrollbars';
import makeSection from '@utils/makeSection'
import InviteChannelModal from '@components/InviteChannelModal'
import axios from 'axios'

const Channel = () => {
    const {workspace, channel} = useParams<{workspace: string, channel: string}>();
    const [socket] = useSocket(workspace);
    const [dragOver, setDragOver] = useState(false)
    const { data: userData } = useSWR<IUser>('/api/users', fetcher);
    const [chat, onChangeChat, setChat] = useInput('')
    const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);
    const { data: channelsData } = useSWR<IChannel[]>(`/api/workspaces/${workspace}/channels`, fetcher);
    const channelData = channelsData?.find((v) => v.name === channel)
    const {data: channelMembersData} = useSWR<IUser[]>(
        userData ? `/api/workspaces/${workspace}/channels/${channel}/members`: null,
        fetcher,
    )
    const {data : chatData, mutate: mutateChat, setSize} = useSWRInfinite<IChat[]>(
        (index) => `/api/workspaces/${workspace}/channels/${channel}/chats?perPage=20&page=${index + 1}`,
        fetcher,
    )
    const scrollbarRef = useRef<Scrollbars>(null);
    const isEmpty = chatData?.[0]?.length === 0;
    const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20);
    
    const onCloseModal = useCallback(() => {
        setShowInviteChannelModal(false)
    }, [])

    const onSubmitForm = useCallback(
        (e: any) => {
          e.preventDefault();
          if (chat?.trim() && chatData && channelData && userData) {
            const savedChat = chat;
            mutateChat((prevChatData) => {
              prevChatData?.[0].unshift({
                id: (chatData[0][0]?.id || 0) + 1,
                content: savedChat,
                UserId: userData.id,
                User: userData,
                createdAt: new Date(),
                ChannelId: channelData.id,
                Channel: channelData,
              });
              return prevChatData;
            }, false).then(() => {
              localStorage.setItem(`${workspace}-${channel}`, new Date().getTime().toString());
              setChat('');
              mutateChat()
              if (scrollbarRef.current) {
                console.log('scrollToBottom!', scrollbarRef.current?.getValues());
                scrollbarRef.current.scrollToBottom();
              }
            });
            axios
              .post(`/api/workspaces/${workspace}/channels/${channel}/chats`, {
                content: savedChat,
              })
              .catch(console.error);
          }
        },
        [chat, workspace, channel, channelData, userData, chatData, mutateChat, setChat],
      );

    const onClickInviteChannel = useCallback(() => {
        setShowInviteChannelModal(true);
      }, []);

      const onMessage = useCallback(
        (data: IChat) => {
          if (
            data.Channel.name === channel && (data.content.startsWith('uploads/') || data.UserId !== userData?.id)) 
            {
            mutateChat((chatData) => {
              chatData?.[0].unshift(data);
              return chatData;
            }, false).then(() => {
              if (scrollbarRef.current) {
                if (
                  scrollbarRef.current.getScrollHeight() <
                  scrollbarRef.current.getClientHeight() + scrollbarRef.current.getScrollTop() + 150
                ) {
                  console.log('scrollToBottom!', scrollbarRef.current?.getValues());
                  setTimeout(() => {
                    scrollbarRef.current?.scrollToBottom();
                  }, 100);
                }
              }
            });
          }
        },
        [channel, userData, mutateChat],
      );

      useEffect(() => {
        localStorage.setItem(`${workspace}-${channel}`, new Date().getTime().toString());
      }, [workspace, channel]);

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
        axios.post(`/api/workspaces/${workspace}/channels/${channel}/images`, formData). then(() => {
          setDragOver(false)
          mutateChat();
          localStorage.setItem(`${workspace}-${channel}`, new Date().getTime().toString());
        })
      } ,[])
  
      const onDragOver = useCallback((e: any) => {
        e.preventDefault()
        setDragOver(true)
      } ,[])


    useEffect(() => {
    socket?.on('message', onMessage);
    return () => {
        socket?.off('message', onMessage);
    };
    }, [socket, onMessage]);
    
    const chatSections = makeSection(chatData ? chatData.flat().reverse() : []) 

    return (
        <Container onDrop={onDrop} onDragOver={onDragOver}>
            <Header>
                <span>#{channel}</span>
                <div>
                    <span>{channelMembersData?.length}</span>
                    <button
                        onClick={onClickInviteChannel}
                        className="c-button-unstyled p-ia__view_header__button"
                        aria-label="Add people to #react-native"
                        data-sk="tooltip_parent"
                        type="button"
                    >
                        <i className="c-icon p-ia__view_header__button_icon c-icon--add-user" aria-hidden="true" />
                    </button>
                </div>
            </Header>
            <ChatList
                scrollbarRef={scrollbarRef}
                isReachingEnd={isReachingEnd}
                isEmpty={isEmpty}
                chatSections={chatSections}
                setSize={setSize}
            />
            <ChatBox
                onSubmitForm={onSubmitForm}
                chat={chat}
                onChangeChat={onChangeChat}
                placeholder={`Message #${channel}`}
                data={channelMembersData}
            />
            <InviteChannelModal
                show={showInviteChannelModal}
                onCloseModal={onCloseModal}
                setShowInviteChannelModal={setShowInviteChannelModal}
            />
            {dragOver && <DragOver>업로드! </DragOver>}
        </Container>
    )
}

export default Channel;