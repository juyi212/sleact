import React, {FC, useCallback} from 'react'

import useSWR from 'swr';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import { Redirect } from 'react-router';
import gravatar from 'gravatar';

import {
    AddButton,
    Channels,
    Chats,
    Header,
    LogOutButton,
    MenuScroll,
    ProfileImg,
    ProfileModal,
    RightMenu,
    WorkspaceButton,
    WorkspaceModal,
    WorkspaceName,
    Workspaces,
    WorkspaceWrapper,
  } from './styles';

type Props = {
    children?: React.ReactNode
  };

const Workspace: React.FC<Props> = ({children}) => {
    const { data: userData, error, mutate }  = useSWR('http://localhost:3095/api/users', fetcher);

    const onLogout = useCallback(() => {
        axios.post('http://localhost:3095/api/users/logout', null, {
            withCredentials: true,
        })
        .then((res) => {
            mutate(false,false)
        })
    },[])

    if(!userData) {
        return <Redirect to = '/login' />
    }


    return (
        <div>
            <Header>test</Header>
            <RightMenu>
                <span>
                    <ProfileImg src={gravatar.url(userData.email, {s: '28px', d: 'retro'})} alt={userData.nickname}/>
                </span>
            </RightMenu>
            <button onClick= {onLogout}>로그아웃</button>
            <WorkspaceWrapper>
                <Workspaces>test</Workspaces>
                <Channels>
                    <WorkspaceName>Sleact</WorkspaceName>
                    <MenuScroll>
                       menu 
                    </MenuScroll>
                </Channels>
                <Chats></Chats>
            </WorkspaceWrapper>
            {children}
        </div>
    )
}

export default Workspace;