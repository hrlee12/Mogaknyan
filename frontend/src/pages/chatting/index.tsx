import React, { useEffect, useState, useRef } from 'react';
import BasicFrame from '@/components/frame/basicFrame';
import InputBox from '@/components/inputbox';
import Button from '@/components/button';
import { Socket } from '@/apis/websocket/Socket.ts';
import { useAuthStore } from '@/stores/useAuthStore.ts';
import { getChattingList } from '@/apis/group.ts';
import ChatBox from '@/pages/chatting/chatBox.tsx';
import { getMyInfo } from '@/apis/member.ts';
import { useParams } from 'react-router-dom';

interface ChatMessage {
  userId: number;
  userNickname: string;
  contents: string;
  sendTime: string;
}

const Chatting = () => {
  const { groupId } = useParams();
  const partyId = Number(groupId);
  const token = useAuthStore.getState().accessToken;
  const [myName, setMyName] = useState<string>('');
  const [messageList, setMessageList] = useState<ChatMessage[]>([]);
  const [socketMessageList, setSocketMessageList] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchChattingList = async () => {
      const response = await getChattingList(partyId);
      const chatMessages = response.chatMessages.map((msg: any) => ({
        userId: msg.userId,
        userNickname: msg.userNickname,
        contents: msg.contents,
        sendTime: msg.sendTime,
      }));
      setMessageList(chatMessages);
      console.log(chatMessages);
    };

    const fetchMyInfo = async () => {
      try {
        const response = await getMyInfo();
        setMyName(response.memberCatName);
      } catch (error) {
        console.log(error);
      }
    };

    fetchChattingList();
    fetchMyInfo();

    const chatWsUrl = `https://mogaknyang-back.duckdns.org/ws`;
    const socket = new Socket();
    socket.connect(chatWsUrl, partyId, token);

    socket.onMessage((data: string) => {
      const parsedData: ChatMessage = JSON.parse(data);
      console.log('Received message:', parsedData); // 수신된 메시지를 콘솔에 출력
      setSocketMessageList((prevMessages) => [...prevMessages, parsedData]);
    });

    socketRef.current = socket;

    return () => {
      socketRef.current?.disconnect();
    };
  }, [partyId, token]);

  useEffect(() => {
    scrollToBottom();
  }, [socketMessageList]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = () => {
    if (message.trim() && socketRef.current?.connected) {
      socketRef.current.sendMessage(partyId, message);
      setSocketMessageList((prevMessages) => [
        ...prevMessages,
        {
          userId: 0, // 현재 사용자 ID를 설정하거나 다른 값으로 대체할 수 있습니다.
          userNickname: myName,
          contents: message,
          sendTime: new Date().toISOString(),
        },
      ]);
      setMessage('');
      scrollToBottom(); // 메시지 전송 후 스크롤을 맨 아래로 이동
    } else {
      console.error('WebSocket is not connected or message is empty');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <BasicFrame>
      <div
        id={'here'}
        className='flex flex-col overflow-y-auto max-h-[400px] space-y-1'
      >
        {messageList.reverse().map((msg, index) => (
          <ChatBox
            key={`message-${index}`}
            userNickname={msg.userNickname || myName}
            contents={msg.contents}
          />
        ))}
        {socketMessageList.reverse().map((msg, index) => (
          <ChatBox
            key={`socketMessage-${index}`}
            userNickname={msg.userNickname || myName}
            contents={msg.contents}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className='fixed bottom-28 flex flex-row pl-6'>
        <div className={'pt-2'}>
          <InputBox
            name={'채팅창'}
            size={'chatting'}
            type={'text'}
            addStyle={'pl-3'}
            placeholder={'채팅 입력'}
            value={message}
            onChange={handleInputChange}
          />
        </div>
        <Button
          text={'전송'}
          size={'small'}
          color={'green'}
          onClick={handleSendMessage}
        />
      </div>
    </BasicFrame>
  );
};

export default Chatting;
