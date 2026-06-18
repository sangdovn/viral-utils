from deep_translator import GoogleTranslator


def translate(text: str, src: str = "auto", dest: str = "vi") -> str:
    translated = GoogleTranslator(source=src, target=dest).translate(text)
    return translated
