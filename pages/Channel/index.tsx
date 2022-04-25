import Workspace from '@layouts/Workspace'
import React, {useCallback} from 'react'
import { Container, Header } from './styles'
import ChatList from '@components/ChatList'
import ChatBox from '@components/ChatBox'
import useInput from '@hooks/useInput'

const Channel = () => {
    const [chat, onChangeChat, setChat] = useInput('')

    const onSubmitForm = useCallback((e: any)=> {
        e.preventDefault() 
        setChat('')
    },[])
    
    return (
        <Container>
            <Header>채널 ! </Header>
            {/* <ChatList /> */}
            <ChatBox chat ={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm}/>
        </Container>
    )
}

export default Channel;