package com.chilbaeksan.mokaknyang.chat.service;

import com.chilbaeksan.mokaknyang.chat.domain.ChatMessage;
import com.chilbaeksan.mokaknyang.chat.dto.ChatSendRequestDto;
import com.chilbaeksan.mokaknyang.chat.dto.PublishMessage;
import com.chilbaeksan.mokaknyang.chat.repository.ChatRepository;
import com.chilbaeksan.mokaknyang.exception.BaseException;
import com.chilbaeksan.mokaknyang.exception.ErrorCode;
import com.chilbaeksan.mokaknyang.member.domain.Member;
import com.chilbaeksan.mokaknyang.member.repository.MemberRepository;
import com.chilbaeksan.mokaknyang.member_party.domain.MemberParty;
import com.chilbaeksan.mokaknyang.member_party.repository.MemberPartyRepository;
import com.chilbaeksan.mokaknyang.party.domain.Party;
import com.chilbaeksan.mokaknyang.party.repository.PartyRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.flogger.Flogger;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService{
    private final ChatRepository chatRepository;
    private final MemberPartyRepository memberPartyRepository;
    private final MemberRepository memberRepository;
    private final PartyRepository partyRepository;

    private final RedisPublisher redisPublisher;

    private ChannelTopic getTopic(Integer partyId){
        return new ChannelTopic("party_"+ partyId);
    }

    @Override
    public void publishMessage(ChatSendRequestDto chatSendRequestDto, Integer memberId, Integer partyId) {
        Member member = memberRepository.findByMemberId(memberId).orElseThrow(() -> new BaseException(ErrorCode.MEMBER_NOT_FOUND));

        PublishMessage message = PublishMessage.builder()
                .partyId(partyId)
                .senderId(memberId)
                .sendNickname(member.getNickname())
                .contents(chatSendRequestDto.getContents())
                .sendTime(LocalDateTime.now().toString())
                .build();
        
        redisPublisher.publish(getTopic(partyId), message);
        
        // TODO: Redis에서 전송 즉시 캐싱하기
    }

    //DB에 저장
    @Transactional
    @Override
    public void saveMessage(ChatSendRequestDto chatSendRequestDto, Integer memberId, Integer partyId) {
        // 각 맴버 및 파티 유효성 검사
        Member member = memberRepository.findByMemberId(memberId).orElseThrow(() -> new BaseException(ErrorCode.MEMBER_NOT_FOUND));
        Party party = partyRepository.findByPartyId(partyId).orElseThrow(() -> new BaseException(ErrorCode.PARTY_NOT_FOUND));

        // 채팅을 저장한다.
        ChatMessage entity;
        try{
            entity = ChatMessage.builder()
                    .partyId(partyId)
                    .senderId(memberId)
                    .senderNickname(member.getNickname())
                    .contents(chatSendRequestDto.getContents())
                    .sendTime(LocalDateTime.now().toString())
                    .build();
        }catch(Exception e){
            throw new BaseException(ErrorCode.CHAT_BAD_REQUEST);
        }
        chatRepository.save(entity);
    }

    // 정보 조회
    @Override
    public Page<ChatMessage> getPartyMessages(Pageable pageable, Integer memberId, Integer partyId) {
        // 파티 가입하고 있는지 확인
        MemberParty res = memberPartyRepository.findByMemberAndParty(Member.builder().memberId(memberId).build(), Party.builder().partyId(partyId).build())
                .orElseThrow(() -> new BaseException(ErrorCode.MEMBER_PARTY_UNAUTHORIZATION));

        //가입하고 있다면 데이터를 가지고 온다.
        Page<ChatMessage> result =  chatRepository.findAllByPartyIdOrderBySendTimeDesc(partyId, pageable);
        log.info(result.getContent().toString());
        return result;

        // TODO: Redis 캐싱 기법 적용하여, 조회 속도 빠르게 하기
    }
}
