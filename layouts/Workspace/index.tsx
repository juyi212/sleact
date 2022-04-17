import React, {FC, useCallback,useState} from 'react'
import useSWR from 'swr';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import { Link, Redirect, Route, Switch } from 'react-router-dom';
import gravatar from 'gravatar';
import Menu from '@components/Menu';
import { IChannel, IUser } from '@typings/db';
import { Button, Input, Label } from '@pages/SignUp/styles';

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
import Modal from '@components/Modal';

type Props = {
    children?: React.ReactNode
  };

const Workspace: React.FC<Props> = ({children}) => {
    const { data: userData, error, mutate }  = useSWR<IUser | false>('http://localhost:3095/api/users', fetcher);
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);

    const onLogout = useCallback(() => {
        axios.post('http://localhost:3095/api/users/logout', null, {
            withCredentials: true,
        })
        .then((res) => {
            mutate(false,false)
        })
    },[])

    const onClickUserProfile = useCallback(() => {
        setShowUserMenu((prev) => !prev)
    }, [])

    const onClickCreateWorkspace = useCallback(() => {
        setShowCreateWorkspaceModal(true)
    },[])



    if(!userData) {
        return <Redirect to = '/login' />
    }


    return (
        <div>
            <Header>test</Header>
            <RightMenu>
                <span onClick={onClickUserProfile}>
                    <ProfileImg src={gravatar.url(userData.email, {s: '28px', d: 'retro'})} alt={userData.nickname}/>
                    {showUserMenu && (
                        <Menu style={{ right: 0, top: 38 }} show={showUserMenu} onCloseModal={onClickUserProfile} >
                            <ProfileModal>
                                <img src={gravatar.url(userData.email, {s: '28px', d: 'retro'})} alt={userData.nickname}/>
                                <div>
                                <span id="profile-name">{userData.nickname}</span>
                                <span id="profile-active">Active</span>
                                </div>
                            </ProfileModal>
                            <LogOutButton onClick= {onLogout}>로그아웃</LogOutButton>
                        </Menu> 
                        )}
                </span>
            </RightMenu>
            <WorkspaceWrapper>
                <Workspaces>
                    {userData.Workspaces.map((ws) => {
                        return (
                            <Link key = {ws.id} to={`/workspace/${ws.url}/channel/일반`} >
                                <WorkspaceButton>{ws.name.slice(0,1).toUpperCase()}</WorkspaceButton>
                            </Link>
                        )
                })}
                    <AddButton onClick={onClickCreateWorkspace}>+</AddButton>
                </Workspaces>
                <Channels>
                    <WorkspaceName>Sleact</WorkspaceName>
                    <MenuScroll>
                       menu 
                    </MenuScroll>
                </Channels>
                <Chats>
                    {children}
                </Chats>
            </WorkspaceWrapper>
            {children}
            <Modal show = {showCreateWorkspaceModal} onCloseModal = {onCloseModal}>
                <form onSubmit={onCreateWorkspace}>
                    <Label id='workspace-label'></Label>
                </form>
            </Modal>
        </div>
    )
}

export default Workspace;