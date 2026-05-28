package com.questly.gamification.dto;

import com.questly.gamification.model.XpLedger;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class XpResponse {
    private int total;
    private List<XpLedger> ledger;
}
