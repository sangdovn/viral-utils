import asyncio
import time


class TokenBucket:
    def __init__(self, capacity: int, refill_rate: float):
        self.capacity = capacity
        self.refill_rate = refill_rate
        self.tokens = float(capacity)
        self.last_refill = time.monotonic()
        self._lock = asyncio.Lock()

    async def consume(self, cost: int = 1) -> bool:
        async with self._lock:
            self._refill()
            if self.tokens >= cost:
                self.tokens -= cost
                return True
            return False

    async def wait_and_consume(self, cost: int = 1):
        while True:
            async with self._lock:
                self._refill()
                if self.tokens >= cost:
                    self.tokens -= cost
                    return  # got the token, proceed
            await asyncio.sleep(0.05)  # wait a bit, then retry

    def remaining(self) -> int:
        self._refill()
        return int(self.tokens)

    def _refill(self):
        now = time.monotonic()
        elapsed = now - self.last_refill
        self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)
        self.last_refill = now
