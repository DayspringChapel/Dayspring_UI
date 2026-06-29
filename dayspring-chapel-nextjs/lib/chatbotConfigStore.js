if (!global.__dayspringChatConfig) {
    global.__dayspringChatConfig = {
        additionalInfo: '',
    };
}

export function getChatConfig() {
    return global.__dayspringChatConfig;
}

export function setChatConfig(data) {
    if (typeof data.additionalInfo === 'string') {
        global.__dayspringChatConfig.additionalInfo = data.additionalInfo;
    }
    return global.__dayspringChatConfig;
}
