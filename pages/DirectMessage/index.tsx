import React, {useCallback, useRef} from 'react'
import { Container, Header } from './styles';
import gravatar from 'gravatar'
import useSWR from 'swr';
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


const DirectMessage = () => {
    const { workspace, id } = useParams<{ workspace: string, id: string }>();
    const { data: myData } = useSWR('/api/users', fetcher);
    const { data: userData } = useSWR(`/api/workspaces/${workspace}/users/${id}`, fetcher);
    const [chat, onChangeChat, setChat] = useInput('')
    const {data: chatData, mutate: mutateChat} = useSWR<IDM[]> (
        `/api/workspaces/${workspace}/dms/${id}/chats?perPage=30&page=1`,
        fetcher
    )
    const scrollbarRef = useRef<Scrollbars>(null) // 스크롤바를 컨트롤 > 채팅을하다가 스크롤 올리고 다시 채팅을 했을 때 내려가야함 

    const onSubmitForm = useCallback((e: any)=> {
        e.preventDefault();
        if (chat?.trim() && chatData){
            axios.post(`/api/workspaces/${workspace}/dms/${id}/chats`, {
                content: chat
            })
            .then(() => {
                mutateChat()
                setChat('')
            })
            .catch((error) => {
                console.log(error)
            })
        }
    },[chat, workspace, id, myData, userData, chatData, mutateChat, setChat])


    if (!userData || !myData) {
        return null;
      }

    //immutable하게 reverse! concat을 써도됨 
    const chatSections = makeSection(chatData ? [...chatData].reverse() : []) 


    return (
        <Container>
            <Header>
                <img src={gravatar.url(userData.email, { s: '24px', d: 'retro' })} alt={userData.nickname} />
                <span>{userData.nickname}</span>
            </Header>
            <ChatList chatSections = {chatSections} ref={scrollbarRef} />
            <ChatBox chat ={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm}/>
        </Container>
    )
}

export default DirectMessage;