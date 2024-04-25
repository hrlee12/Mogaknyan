package com.chilbaeksan.mokaknyang.attack_situation.service;

import com.chilbaeksan.mokaknyang.attack_situation.domain.AttackSituation;
import com.chilbaeksan.mokaknyang.attack_situation.dto.request.AttackSituationRegist;
import com.chilbaeksan.mokaknyang.attack_situation.repository.AttackSituationRepository;
import com.chilbaeksan.mokaknyang.party.domain.Party;
import com.chilbaeksan.mokaknyang.party.repository.PartyRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AttackSituationService {
    private final AttackSituationRepository attackSituationRepository;
    private final PartyRepository partyRepository;

    public AttackSituation registAttackSituation(AttackSituationRegist attackSituationRegist){
        log.debug("attack_situation_id:"+attackSituationRegist.getGroupId());

        Party party = partyRepository.findByPartyId(attackSituationRegist.getGroupId())
                .orElseThrow(() -> new NoSuchElementException("Value not present"));

        AttackSituation attackSituation = attackSituationRepository.save(
                AttackSituation.builder()
                .party(party)
                .attackSituationCode(attackSituationRegist.getAttackSituationCode())
                .build());

        return attackSituation;
    }
}
