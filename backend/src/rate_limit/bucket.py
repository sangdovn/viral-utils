import asyncio
import time


class TokenBucket:
    def __init__(self, capacity: int, refill_rate: float):
        self.capacity = capacity
        self.refill_rate = refill_rate  # tokens added per second (e.g. 1.0)
        self.tokens = float(capacity)  # start full
        self.last_refill = time.monotonic()  # track last refilled
        self._lock = asyncio.Lock()  # prevent race condition

    async def acquire(self):
        while True:
            async with self._lock:  # only one coroutine enters at a time
                self._refill()  # top up tokens based on time elapsed
                if self.tokens >= 1:  # if at least 1 token available
                    self.tokens -= 1  # consume it
                    return
            await asyncio.sleep(
                1 / self.refill_rate  # no token? wait ... then try again
            )  # other coroutines can acquire lock during this time

    def _refill(self):
        now = time.monotonic()  # seconds elapsed since system boot, always increasing
        elapsed = now - self.last_refill  # time since last refill
        self.tokens = min(
            self.capacity,  # never exceed max capacity
            self.tokens + elapsed * self.refill_rate,  # add tokens based on time
        )
        self.last_refill = now  # reset timer
