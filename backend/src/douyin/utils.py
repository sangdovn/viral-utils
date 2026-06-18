def extract_sec_uid(url: str) -> str:
    start = url.rfind("/") + 1  # skip the slash
    end = url.find("?")  # will be -1 if not found
    if end == -1:
        return url[start:]  # take until the end
    return url[start:end]
