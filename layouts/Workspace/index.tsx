import React, {FC, useCallback,useEffect,useState} from 'react'
import useSWR from 'swr';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import { Link, Redirect, Route, Switch } from 'react-router-dom';
import gravatar from 'gravatar';
import Menu from '@components/Menu';
import { IChannel, IUser } from '@typings/db';
import { Button, Input, Label } from '@pages/SignUp/styles';
import useInput from '@hooks/useInput';
import { toast } from 'react-toastify';
import CreateChannelModal from '@components/CreateChannelModal';
import Channel from '@pages/Channel';
import DirectMessage from '@pages/DirectMessage';
import InviteWorkspaceModal from '@components/InviteWorkspaceModal';
import InviteChannelModal from '@components/InviteChannelModal';
import { useParams } from 'react-router';
import Modal from '@components/Modal';
import ChannelList from '@components/ChannelList';
import DMList from '@components/DMList';
import useSocket from '@hooks/useSocket';

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
import { disconnect } from 'process';

type Props = {
    children?: React.ReactNode
  };

const Workspace: React.FC<Props> = ({children}) => {
    const { workspace } = useParams<{ workspace: string}> ();
    const { data: userData, mutate: revalidateUser } = useSWR<IUser | false>('/api/users', fetcher);
    const { data: channelData } = useSWR<IChannel[]> (
        userData ? `/api/workspaces/${workspace}/channels`: null,
        fetcher
    )
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [showWorkspaceModal, setShowWorkspaceModal] = useState(false)
    const [showCreateChannelModal,setShowCreateChannelModal] = useState(false)
    const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);
    const [showInviteWorkspaceModal, setShowInviteWorkspaceModal] = useState(false)
    const [showInviteChannelModal, setShowInviteChannelModal] = useState(false)
    const [newWorkspace, onChangeNewWorkspace, setNewWorkspace] = useInput('')
    const [newUrl, onChangeNewUrl, setNewUrl] = useInput('')
    const [socket, disconnect] = useSocket(workspace);

    useEffect(() => {
        // 내가 로그인했다는 것을 알려준다 모든 워크스페이스 등등에 
        if( channelData && userData && socket) {
            console.log(socket)
            socket.emit('login', {id : userData.id, channels: channelData.map((v) => v.id) })
        }
    },[socket, channelData, userData])
    useEffect(() => {
        return () => {
            disconnect()
        }
    },[workspace,disconnect])

    const onLogout = useCallback(() => {
        axios.post('http://localhost:3095/api/users/logout', null, {
            withCredentials: true,
        })
        .then((res) => {
            revalidateUser()
        })
        .catch((error) => {
        console.dir(error);
        toast.error(error.response?.data, { position: 'bottom-center' });
      });
    },[])

    const onClickUserProfile = useCallback((e: any) => {
        e.stopPropagation()
        setShowUserMenu((prev) => !prev)
    }, [])

    const onClickCreateWorkspace = useCallback(() => {
        setShowCreateWorkspaceModal(true);
    },[])

    const onCloseModal = useCallback(() => {
        setShowCreateWorkspaceModal(false);
        setShowCreateChannelModal(false)
        setShowInviteChannelModal(false)
        setShowInviteWorkspaceModal(false)
    }, [])
    
    const onCreateWorkspace = useCallback((e: any) => {
        e.preventDefault();
        // 빈값도 걸러줌 
        if (!newWorkspace || !newWorkspace.trim()) return;
        if (!newUrl || !newUrl.trim()) return;
        axios.post('http://localhost:3095/api/workspaces', {
            workspace: newWorkspace,
            url : newUrl
        }, {
            withCredentials: true,
        })
        .then(() => {
            revalidateUser()
            setShowCreateWorkspaceModal(false)
            setNewWorkspace('')
            setNewUrl('')
        })
        .catch((error) => {
            console.dir(error)
            toast.error(error.response?.data, { position: 'bottom-center' });
        })
    }, [newWorkspace, newUrl])

    const toggleWorkspaceModal = useCallback(() => {
        setShowWorkspaceModal((prev) => !prev);
    },[])

    const onClickAddChannel = useCallback(() => {
        setShowCreateChannelModal(true);
    },[])

    const onClickInviteWorkspace = useCallback(() => {
        setShowInviteWorkspaceModal(true)
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
                    {userData?.Workspaces.map((ws) => {
                        return (
                            <Link key = {ws.id} to={`/workspace/${ws.url}/channel/일반`} >
                                <WorkspaceButton>{ws.name.slice(0,1).toUpperCase()}</WorkspaceButton>
                            </Link>
                        )
                })}
                    <AddButton onClick={onClickCreateWorkspace}>+</AddButton>
                </Workspaces>
                <Channels>
                    <WorkspaceName onClick={toggleWorkspaceModal}>Sleact</WorkspaceName>
                    <MenuScroll>
                       <Menu show = {showWorkspaceModal} onCloseModal = {toggleWorkspaceModal} style={{ top: 95, left: 80}}>
                        <WorkspaceModal>
                            <h2>Sleact</h2>
                            <button onClick={onClickInviteWorkspace}>워크스페이스에 사용자 초대</button>
                            <button onClick={onClickAddChannel}>채널 만들기</button>
                            <button onClick={onLogout}>로그아웃</button>
                        </WorkspaceModal>
                       </Menu>
                       <ChannelList />
                       <DMList />
                    </MenuScroll>
                </Channels>
                <Chats>
                <Switch>
                    <Route path="/workspace/:workspace/channel/:channel" component={Channel} />
                    <Route path="/workspace/:workspace/dm/:id" component={DirectMessage} />
                </Switch>
                </Chats>
            </WorkspaceWrapper>

            <Modal show = {showCreateWorkspaceModal} onCloseModal = {onCloseModal}>
                <form onSubmit={onCreateWorkspace}>
                <Label id="workspace-label">
                    <span>워크스페이스 이름</span>
                    <Input id="workspace" value={newWorkspace} onChange={onChangeNewWorkspace} />
                </Label>
                <Label id="workspace-url-label">
                    <span>워크스페이스 url</span>
                    <Input id="workspace-url" value={newUrl} onChange={onChangeNewUrl} />
                </Label>
                <Button type="submit">생성하기</Button>
                </form>
            </Modal>
            <CreateChannelModal 
                show={showCreateChannelModal} 
                onCloseModal = {onCloseModal} 
                setShowCreateChannelModal={setShowCreateChannelModal}
            />
            <InviteWorkspaceModal show = {showInviteWorkspaceModal} onCloseModal={onCloseModal} setShowInviteWorkspaceModal = {setShowInviteWorkspaceModal}/>
            {/* <InviteChannelModal show = {showInviteChannelModal} onCloseModal={onCloseModal} setShowInviteChannelModal = {setShowInviteChannelModal}/> */}
        </div>
    )
}

export default Workspace;