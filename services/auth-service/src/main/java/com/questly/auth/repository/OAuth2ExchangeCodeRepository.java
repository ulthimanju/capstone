package com.questly.auth.repository;

import com.questly.auth.model.OAuth2ExchangeCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;

@Repository
public interface OAuth2ExchangeCodeRepository extends JpaRepository<OAuth2ExchangeCode, String> {

    /** Purge stale codes older than the given expiry threshold. */
    @Modifying
    @Query("DELETE FROM OAuth2ExchangeCode e WHERE e.expiryDate < :threshold")
    void deleteExpiredCodes(OffsetDateTime threshold);
}
