import React, {useCallback} from 'react'
import { Container, Header } from './styles';
import gravatar from 'gravatar'
import useSWR from 'swr';
import { IChannel, IDM, IUser } from '@typings/db';
import { useParams } from 'react-router';
import fetcher from '@utils/fetcher';
import ChatBox from '@components/ChatBox';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useInput';
import axios from 'axios';


const DirectMessage = () => {
    const { workspace, id } = useParams<{ workspace: string, id: string }>();
    const { data: myData } = useSWR('/api/users', fetcher);
    const { data: userData } = useSWR(`/api/workspaces/${workspace}/users/${id}`, fetcher);
    const [chat, onChangeChat, setChat] = useInput('')
    const {data: chatData, mutate: mutateChat} = useSWR<IDM[]>(
        `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=1`,
        fetcher
    )

    const onSubmitForm = useCallback((e: any)=> {
        e.preventDefault();
        if (chat?.trim()){
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
    return (
        <Container>
            <Header>
                <img src={gravatar.url(userData.email, { s: '24px', d: 'retro' })} alt={userData.nickname} />
                <span>{userData.nickname}</span>
            </Header>
            <ChatList />
            <ChatBox chat ={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm}/>
        </Container>
    )
}

export default DirectMessage;