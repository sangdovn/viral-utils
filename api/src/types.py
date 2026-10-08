from typing import Annotated

from pydantic import StringConstraints

SystemName = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=2, max_length=255),
]
