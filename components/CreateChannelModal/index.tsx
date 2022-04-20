import React, {useCallback} from 'react';
import { Button, Input, Label } from '@pages/SignUp/styles';
import Modal from '@components/Modal';
import useInput from '@hooks/useInput';
import axios from 'axios';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { IChannel, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';

interface Props {
    show : boolean;
    onCloseModal: () => void;
    setShowCreateChannelModal: (flag: boolean) => void; // 다시 전달 
}


const CreateChannelModal : React.FC<Props>= ({show, onCloseModal, setShowCreateChannelModal}) => {
    const [newChannel, onChangeNewChannel, setNewChannel] = useInput('');
    const params = useParams<{ workspace?: string }>();
    const { workspace } = params;

    const { data: userData }  = useSWR<IUser | false>('http://localhost:3095/api/users', fetcher, {
        dedupingInterval: 2000
    });
    const { mutate: revalidateChannel } = useSWR<IChannel[]> (
        userData ? `http://localhost:3095/api/workspaces/${workspace}/channels`: null,
        fetcher
    )

    const onCreateChannel = useCallback((e: any) => {
      e.preventDefault()
      axios.post(`http://localhost:3095/api/workspaces/${workspace}/channels`, {
        name: newChannel,
      }, {
        withCredentials: true,
      })
      .then(() => {
        revalidateChannel()
        setShowCreateChannelModal(false)
        setNewChannel('')
      })
      .catch((error) => {
        console.dir(error)
        toast.error(error.response?.data, { position: 'bottom-center' });
      })
    }, [newChannel, revalidateChannel, setNewChannel, setShowCreateChannelModal, workspace])


    return (
        <Modal show={show} onCloseModal={onCloseModal}>
        <form onSubmit={onCreateChannel}>
          <Label id="channel-label">
            <span>채널 이름</span>
            <Input id="channel" value={newChannel} onChange={onChangeNewChannel} />
          </Label>
          <Button>생성하기</Button>
        </form>
      </Modal>
    )
}

export default CreateChannelModal;