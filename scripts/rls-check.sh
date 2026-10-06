#!/usr/bin/env bash
set -euo pipefail

# Kasbon RLS Leak Verification Script
# Usage:
#   bash scripts/rls-check.sh

URL="${SUPABASE_URL:-${NEXT_PUBLIC_SUPABASE_URL:-}}"
KEY="${SUPABASE_PUBLISHABLE_KEY:-${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:-}}"
A_EMAIL="${USER_A_EMAIL:-usera@kasbon.test}"
A_PASS="${USER_A_PASSWORD:-Password123!}"
B_EMAIL="${USER_B_EMAIL:-userb@kasbon.test}"
B_PASS="${USER_B_PASSWORD:-Password123!}"

if [[ -z "$URL" || -z "$KEY" ]]; then
  echo "❌ ERROR: Environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are required."
  echo "Please set them in your environment or .env file before running scripts/rls-check.sh"
  exit 1
fi


echo "🔍 Starting Kasbon RLS Leak Verification against $URL..."

login_user() {
  local email="$1"
  local pass="$2"
  
  curl -s -X POST "$URL/auth/v1/signup" \
    -H "apikey: $KEY" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$pass\"}" >/dev/null || true

  curl -s -f -X POST "$URL/auth/v1/token?grant_type=password" \
    -H "apikey: $KEY" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$pass\"}"
}

# 1. Login A
RESPONSE_A=$(login_user "$A_EMAIL" "$A_PASS")
A_TOKEN=$(echo "$RESPONSE_A" | jq -r '.access_token // empty')
A_USER_ID=$(echo "$RESPONSE_A" | jq -r '.user.id // empty')
if [[ -z "$A_TOKEN" || "$A_TOKEN" == "null" ]]; then
  echo "❌ Check 1 failed: Could not log in as User A ($A_EMAIL). Response: $RESPONSE_A"
  exit 1
fi
echo "✅ Check 1: Authenticated User A ($A_USER_ID)"

# 2. Login B
RESPONSE_B=$(login_user "$B_EMAIL" "$B_PASS")
B_TOKEN=$(echo "$RESPONSE_B" | jq -r '.access_token // empty')
B_USER_ID=$(echo "$RESPONSE_B" | jq -r '.user.id // empty')
if [[ -z "$B_TOKEN" || "$B_TOKEN" == "null" ]]; then
  echo "❌ Check 2 failed: Could not log in as User B ($B_EMAIL). Response: $RESPONSE_B"
  exit 1
fi
echo "✅ Check 2: Authenticated User B ($B_USER_ID)"

INIT_RPC_B=$(curl -s -X POST "$URL/rest/v1/rpc/debt_summary" -H "apikey: $KEY" -H "Authorization: Bearer $B_TOKEN")
INIT_RPC_OPEN_COUNT=$(echo "$INIT_RPC_B" | jq -r '.[0].open_count // 0')


# 3. User A creates a debt row
CREATE_A=$(curl -s -X POST "$URL/rest/v1/debts" \
  -H "apikey: $KEY" \
  -H "Authorization: Bearer $A_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "{\"type\":\"owed_to_me\",\"counterpart_name\":\"RLS Test Person\",\"amount\":100000,\"debt_date\":\"2026-10-06\"}")

A_ROW_ID=$(echo "$CREATE_A" | jq -r '.[0].id // empty')
if [[ -z "$A_ROW_ID" ]]; then
  echo "❌ Check 3 failed: User A could not create debt row. Response: $CREATE_A"
  exit 1
fi
echo "✅ Check 3: User A created debt row ($A_ROW_ID)"

# 4. User B tries to read User A's row by ID
READ_BY_ID=$(curl -s -X GET "$URL/rest/v1/debts?id=eq.$A_ROW_ID" \
  -H "apikey: $KEY" \
  -H "Authorization: Bearer $B_TOKEN")
if [[ "$READ_BY_ID" != "[]" ]]; then
  echo "❌ Check 4 failed: User B was able to read User A's row: $READ_BY_ID"
  exit 1
fi
echo "✅ Check 4: User B cannot read User A's row by ID (returned [])"

# 5. User B lists all debts
LIST_B=$(curl -s -X GET "$URL/rest/v1/debts" \
  -H "apikey: $KEY" \
  -H "Authorization: Bearer $B_TOKEN")
CONTAINS_A=$(echo "$LIST_B" | jq "[.[] | select(.id == \"$A_ROW_ID\")] | length")
if [[ "$CONTAINS_A" -ne 0 ]]; then
  echo "❌ Check 5 failed: User B list response contains User A's row"
  exit 1
fi
echo "✅ Check 5: User B listing debts contains none of User A's rows"

# 6. User B tries to PATCH User A's row
PATCH_B=$(curl -s -X PATCH "$URL/rest/v1/debts?id=eq.$A_ROW_ID" \
  -H "apikey: $KEY" \
  -H "Authorization: Bearer $B_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "{\"amount\":1}")
if [[ "$PATCH_B" != "[]" ]]; then
  echo "❌ Check 6 failed: User B patch succeeded: $PATCH_B"
  exit 1
fi
READ_A=$(curl -s -X GET "$URL/rest/v1/debts?id=eq.$A_ROW_ID" \
  -H "apikey: $KEY" \
  -H "Authorization: Bearer $A_TOKEN")
A_AMOUNT=$(echo "$READ_A" | jq -r '.[0].amount')
if [[ "$A_AMOUNT" -ne 100000 ]]; then
  echo "❌ Check 6 failed: User A's row amount was modified to $A_AMOUNT"
  exit 1
fi
echo "✅ Check 6: User B cannot PATCH User A's row (amount unchanged at 100000)"

# 7. User B tries to DELETE User A's row
DELETE_B=$(curl -s -X DELETE "$URL/rest/v1/debts?id=eq.$A_ROW_ID" \
  -H "apikey: $KEY" \
  -H "Authorization: Bearer $B_TOKEN" \
  -H "Prefer: return=representation")
if [[ "$DELETE_B" != "[]" ]]; then
  echo "❌ Check 7 failed: User B delete returned representation: $DELETE_B"
  exit 1
fi
READ_A_AGAIN=$(curl -s -X GET "$URL/rest/v1/debts?id=eq.$A_ROW_ID" \
  -H "apikey: $KEY" \
  -H "Authorization: Bearer $A_TOKEN")
A_ROW_EXISTS=$(echo "$READ_A_AGAIN" | jq -r '.[0].id // empty')
if [[ -z "$A_ROW_EXISTS" ]]; then
  echo "❌ Check 7 failed: User A's row was deleted by User B!"
  exit 1
fi
echo "✅ Check 7: User B cannot DELETE User A's row (row still exists)"

# 8. User B tries to POST a row with User A's user_id
POST_IMPERS=$(curl -s -i -X POST "$URL/rest/v1/debts" \
  -H "apikey: $KEY" \
  -H "Authorization: Bearer $B_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"user_id\":\"$A_USER_ID\",\"type\":\"owed_to_me\",\"counterpart_name\":\"Impersonated\",\"amount\":50000}")
if echo "$POST_IMPERS" | grep -q -E "201 Created|200 OK"; then
  echo "❌ Check 8 failed: User B created row under User A's user_id!"
  exit 1
fi
echo "✅ Check 8: User B inserting with User A's user_id is rejected by RLS WITH CHECK"

# 9. User B tries to PATCH own row with user_id set to User A
CREATE_B=$(curl -s -X POST "$URL/rest/v1/debts" \
  -H "apikey: $KEY" \
  -H "Authorization: Bearer $B_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "{\"type\":\"i_owe\",\"counterpart_name\":\"User B Debt\",\"amount\":20000,\"debt_date\":\"2026-10-06\"}")
B_ROW_ID=$(echo "$CREATE_B" | jq -r '.[0].id // empty')
PATCH_REASSIGN=$(curl -s -i -X PATCH "$URL/rest/v1/debts?id=eq.$B_ROW_ID" \
  -H "apikey: $KEY" \
  -H "Authorization: Bearer $B_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"user_id\":\"$A_USER_ID\"}")
READ_B_ROW=$(curl -s -X GET "$URL/rest/v1/debts?id=eq.$B_ROW_ID" \
  -H "apikey: $KEY" \
  -H "Authorization: Bearer $B_TOKEN")
B_ROW_UID=$(echo "$READ_B_ROW" | jq -r '.[0].user_id // empty')
if [[ "$B_ROW_UID" == "$A_USER_ID" ]]; then
  echo "❌ Check 9 failed: User B reassigned row user_id to User A!"
  exit 1
fi
echo "✅ Check 9: User B cannot reassign row ownership to User A"

# Cleanup B's row
curl -s -X DELETE "$URL/rest/v1/debts?id=eq.$B_ROW_ID" -H "apikey: $KEY" -H "Authorization: Bearer $B_TOKEN" >/dev/null

# 10. Anonymous user tries to read debts
ANON_READ=$(curl -s -i -X GET "$URL/rest/v1/debts" -H "apikey: $KEY")
if echo "$ANON_READ" | grep -q "200 OK"; then
  echo "❌ Check 10 failed: Anonymous request returned 200 OK"
  exit 1
fi
echo "✅ Check 10: Anonymous request to /rest/v1/debts is rejected (401/403)"

# 11. RPC debt_summary returns only B's totals
RPC_B=$(curl -s -X POST "$URL/rest/v1/rpc/debt_summary" \
  -H "apikey: $KEY" \
  -H "Authorization: Bearer $B_TOKEN")
RPC_OPEN_COUNT=$(echo "$RPC_B" | jq -r '.[0].open_count // 0')
if [[ "$RPC_OPEN_COUNT" -ne "$INIT_RPC_OPEN_COUNT" ]]; then
  echo "❌ Check 11 failed: debt_summary for User B returned open_count = $RPC_OPEN_COUNT (expected $INIT_RPC_OPEN_COUNT)"
  exit 1
fi
echo "✅ Check 11: RPC debt_summary returns only authenticated caller's totals"


# 12. Cleanup User A's row
CLEANUP_A=$(curl -s -X DELETE "$URL/rest/v1/debts?id=eq.$A_ROW_ID" \
  -H "apikey: $KEY" \
  -H "Authorization: Bearer $A_TOKEN" \
  -H "Prefer: return=representation")
CLEANUP_ID=$(echo "$CLEANUP_A" | jq -r '.[0].id // empty')
if [[ "$CLEANUP_ID" != "$A_ROW_ID" ]]; then
  echo "❌ Check 12 failed: Could not delete User A's test row"
  exit 1
fi
echo "✅ Check 12: User A successfully cleaned up test row"

echo "🎉 ALL 12 RLS CHECKS PASSED SUCCESSFULLY!"
