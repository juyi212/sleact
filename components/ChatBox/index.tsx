import React, {FC, useCallback, useRef, useEffect} from 'react';
import { ChatArea, Form, Toolbox, MentionsTextarea, SendButton, EachMention } from './styles';
import autosize from 'autosize';
import {Mention, SuggestionDataItem} from 'react-mentions'
import { useParams } from 'react-router';
import useSWR from 'swr';
import { IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import gravatar from 'gravatar'

interface Props {
    chat: string;
    onSubmitForm : (e: any) => void;
    onChangeChat : (e: any) => void;
    placeholder? : string;
}

const ChatBox : FC<Props> = ({chat, onSubmitForm, onChangeChat, placeholder}) => {
    const textareaRef = useRef(null)
    const { workspace } = useParams<{ workspace: string}> ();
    const { data: userData, mutate: revalidateUser } = useSWR<IUser | false>('/api/users', fetcher);
    const { data: memberData } = useSWR<[]> (
        userData ? `/api/workspaces/${workspace}/members`: null,
        fetcher
    )
    useEffect(() => {
        if (textareaRef.current) {
            autosize(textareaRef.current)
        }
    },[])

    const onKeydownChat = useCallback(
        (e: any) => {
          if (e.key === 'Enter') {
            if (!e.shiftKey) {
              e.preventDefault();
              onSubmitForm(e);
            }
          }
        },
        [onSubmitForm],
      );

      const renderUserSuggestion: (
        suggestion: SuggestionDataItem,
        search: string,
        highlightedDisplay: React.ReactNode,
        index: number,
        focused: boolean,
      ) => React.ReactNode = useCallback(
        (member, search, highlightedDisplay, index, focus) => {
          if (!memberData) {
            return null;
          }
          return (
            <EachMention focus={focus}>
              <img src={gravatar.url(memberData[index], { s: '20px', d: 'retro' })} alt={memberData[index]} />
              <span>{highlightedDisplay}</span>
            </EachMention>
          );
        },
        [memberData],
      );

    return (
        <ChatArea>
        <Form onSubmit={onSubmitForm}>
          <MentionsTextarea
            id='editor-chat'
            value={chat} 
            onChange ={onChangeChat} 
            onKeyDown ={onKeydownChat}
            placeholder ={placeholder}
            ref={textareaRef}
            allowSuggestionsAboveCursor
          >
            <Mention 
              appendSpaceOnAdd 
              trigger="@" 
              data={memberData?.map((v: any) => ({ id: v.id, display: v.nickname })) || []} 
              renderSuggestion = {renderUserSuggestion}
              />
          </MentionsTextarea> 
          <Toolbox>
            <SendButton className={
              'c-button-unstyled c-icon_button c-icon_button--light c-icon_button--size_medium c-texty_input__button c-texty_input__button--send' +
              (chat?.trim() ? '' : ' c-texty_input__button--disabled')
            }
            data-qa="texty_send_button"
            aria-label="Send message"
            data-sk="tooltip_parent"
            type="submit"
            disabled={!chat?.trim()}
            >
              <i className="c-icon c-icon--paperplane-filled" aria-hidden="true" />
            </SendButton>
          </Toolbox>
        </Form>
      </ChatArea>
    )
}

export default ChatBox;