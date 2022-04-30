import React, {VFC, memo, useMemo} from 'react';
import {IChat, IDM} from '@typings/db'
import { ChatWrapper } from './styles';
import gravatar from 'gravatar';
import dayjs from'dayjs'
import regexifyString from 'regexify-string';
import { Link, useParams } from 'react-router-dom';

interface Props {
    data : (IDM| IChat);
}

const BACK_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3095' : 'https://sleact.nodebird.com';
const Chat: VFC<Props> = ({data}) => {
    const user = 'Sender' in data ? data.Sender : data.User; // DM, Channel
    const { workspace } = useParams<{ workspace: string; channel: string }>();
    // 정규 표현식 @[제로초](3) 알아두는 것이 좋다! 
    // \d 숫자 +는 1개 이상, ? 0개나 1개 이상  
    const result = useMemo(
        () => 
    // uploads //로 오면 이미지 태그로 바꿔라 
    data.content.startsWith('uploads/') ? (
        <img src={`${BACK_URL}/${data.content}`} style={{ maxHeight: 200 }} />
    ):(
    regexifyString({
        input: data.content,
        pattern: /@\[(.+?)]\((\d+?)\)|\n/g,
        decorator(match, index){
            const arr: string[] | null = match.match(/@\[(.+?)]\((\d+?)\)/)!;
            if (arr) {
                return (
                    <Link key={match + index} to={`/workspace/${workspace}/dm/${arr[2]}`}>
                      @{arr[1]}
                    </Link>
                );
            }
            return <br key={index} />;
        }
    })), [data.content])


    return (
        <ChatWrapper>
            <div className='chat-img'>
                <img src={gravatar.url(user.email, {s : '36px', d: 'retro'})} alt = {user.nickname}/>
            </div>
            <div className='chat-text'>
                <div className='chat-user'>
                    <b>{user.nickname}</b>
                    <span>{dayjs(data.createdAt.toString()).format('h:mm A')}</span>
                </div>
                <p>{result}</p>
            </div>
        </ChatWrapper>
    )
}

export default memo(Chat);