import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BasicFrame from '@/components/frame/basicFrame';
import * as constants from '@/pages/group/constants';
import { groupDetail, leaveGroup } from '@/apis/group.ts';
import { GroupProps } from '@/types/group';
import { useAuthStore } from '@/stores/useAuthStore.ts';
import ProfileCat from '@/components/cat/profile';
import MultiPomodoro from '@/components/timer/pomodoro/multiPomodoro';
import Button from '@/components/button';
import { GroupSocket } from '@/apis/websocket/groupSocket.ts';

interface StatusMessage {
  userId: number;
  status: string;
}

const GroupInfoPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const defaultGroupInfo: GroupProps = {
    partyId: 0,
    partyName: '',
    partyGoal: '',
    partyManagerId: 0,
    memberCatName: '',
    partyManagerName: '',
    partyMembers: [],
  };
  const partyId = Number(groupId);
  const myId = useAuthStore.getState().accessToken; // 변경: memberId를 가져옴
  const [groupInfo, setGroupInfo] = useState<GroupProps>(defaultGroupInfo);
  const [, setUserIds] = useState<number[]>([]); // userIds 배열을 상태로 추가
  const socketRef = useRef<GroupSocket | null>(null);

  useEffect(() => {
    const fetchGroupInfo = async () => {
      try {
        const response = await groupDetail(partyId);
        setGroupInfo(response);
      } catch (error) {
        console.log(error);
      }
    };

    fetchGroupInfo();

    const socket = new GroupSocket(myId, partyId);
    socket.connect();

    socket.onMessage((data: StatusMessage[]) => {
      console.log('Received status message:', data); // 수신된 메시지를 콘솔에 출력
      const ids = data.map((msg) => msg.userId); // userId 값을 추출하여 배열에 저장
      setUserIds(ids); // 상태로 userId 배열을 설정
    });

    socketRef.current = socket;

    return () => {
      socketRef.current?.disconnect();
    };
  }, [partyId, myId]);

  const clickLeaveGroup = async (partyId: number) => {
    try {
      await leaveGroup(partyId);
      navigate(-1); // 그룹 탈퇴 후 이전 페이지로 이동
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <BasicFrame>
      <div className='flex flex-col'>
        <div className='flex flex-row place-content-around gap-10'>
          <div className='font-dnf text-4xl pl-3 pt-8'>
            {groupInfo.partyName}
          </div>
          <Button
            text={'채팅'}
            size={'small'}
            color={'blue'}
            addStyle={'top-5'}
            onClick={() => navigate(`/chatting/${partyId}`)}
          />
        </div>
        <div className='font-dnf text-2xl pl-5 pt-3'>
          {constants.GROUP_INFO.GOAL} :{' '}
          {groupInfo.partyGoal || constants.GROUP_INFO.NO_GOAL}
        </div>
        <div className='font-dnf text-2xl pl-5 pt-1'>
          {constants.GROUP_INFO.COUNT} : {groupInfo.partyMembers?.length || 0}
        </div>
        {groupInfo.partyMembers?.length > 0 && (
          <div className='grid grid-cols-2'>
            {groupInfo.partyMembers.map((member) => (
              <div key={member.memberId} className='flex pl-5 items-center'>
                <ProfileCat catId={member.catId} />
                <div className='font-neo text-xl pl-2'>
                  {member.memberCatName}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className='flex flex-col font-dnf text-2xl pl-5 py-2'>
          {constants.GROUP_INFO.POMODORO}
        </div>
        <MultiPomodoro groupId={partyId} />
        <div className='flex justify-center pt-3'>
          {myId === groupInfo.partyManagerId ? (
            <Button
              text={'그룹 설정'}
              size='small'
              color='navy'
              onClick={() => navigate(`/groupSetting/${partyId}`)}
            />
          ) : (
            <Button
              text={'그룹 탈퇴'}
              size='small'
              color='gray'
              onClick={() => clickLeaveGroup(partyId)}
            />
          )}
          <Button
            text={'뒤로 가기'}
            size='small'
            color='gray'
            onClick={() => navigate(-1)}
          />
        </div>
      </div>
    </BasicFrame>
  );
};

export default GroupInfoPage;
