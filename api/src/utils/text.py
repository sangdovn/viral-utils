import unicodedata


def build_search_text(value: str | None) -> str:
    # Return an empty searchable value for None or empty input.
    if not value:
        return ""

    # Convert the text to a Unicode-aware lowercase form, then decompose
    # accented characters into a base character and combining accent marks.
    # Example: "Ệ" -> "ệ" -> "e" + combining marks.
    normalized = unicodedata.normalize("NFD", value.casefold())

    # Remove combining accent marks (Unicode category "Mn").
    # Replace Vietnamese "đ" separately because NFD does not decompose it.
    # Example: "chuyện đường" -> "chuyen duong".
    without_accents = "".join(
        character for character in normalized if unicodedata.category(character) != "Mn"
    ).replace("đ", "d")

    # Keep letters and numbers, replacing punctuation, symbols, and existing
    # whitespace with spaces so adjacent words do not become joined.
    # Example: "api-server_v2!" -> "api server v2 ".
    alphanumeric_text = "".join(
        character if character.isalnum() else " " for character in without_accents
    )

    # Remove leading and trailing whitespace and collapse consecutive spaces,
    # tabs, and newlines into one regular space.
    # Example: "  chuyen   nha\nnho " -> "chuyen nha nho".
    return " ".join(alphanumeric_text.split())
