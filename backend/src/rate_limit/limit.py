from src.rate_limit.bucket import TokenBucket


# TODO: self implement this
class RateLimiter:
    def __init__(self, capacity: int, refill_rate: float):
        self.capacity = capacity
        self.refill_rate = refill_rate
        self._buckets: dict[str, TokenBucket] = {}

    async def is_allowed(self, key: str, cost: int = 1) -> bool:
        return await self._buckets[key].consume(cost)

    async def wait(self, key: str, cost: int = 1):
        """Wait until the token is available. Never rejects."""
        await self._get_bucket(key).wait_and_consume(cost)

    def remaining(self, key: str) -> int:
        """How many tokens does this key have left?"""
        return self._get_bucket(key).remaining()

    def _get_bucket(self, key: str) -> TokenBucket:
        if key not in self._buckets:
            self._buckets[key] = TokenBucket(self.capacity, self.refill_rate)
        return self._buckets[key]
