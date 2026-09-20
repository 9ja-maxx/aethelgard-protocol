# Aethelgard Protocol API Reference

## View Functions

### `get_market(market_id: u32) -> dict`
Returns full state dictionary:
```json
{
  "market_id": 0,
  "creator": "0x...",
  "title": "Will...",
  "criteria": "Resolves YES if...",
  "primary_url": "https://...",
  "secondary_url": "",
  "created_at_iso": "2026-06-01T00:00:00.000000Z",
  "deadline_iso": "2026-06-02T00:00:00.000000Z",
  "status": 0,
  "total_yes_stake": "10000000000000000",
  "total_no_stake": "20000000000000000",
  "total_pool_volume": "30000000000000000",
  "yes_percent": 33,
  "no_percent": 67
}
```

### `get_user_stake(market_id: u32, user_address: Address) -> dict`
Returns user position:
```json
{
  "yes_stake": "10000000000000000",
  "no_stake": "0",
  "claimed": false,
  "claimable_amount": "20000000000000000"
}
```
