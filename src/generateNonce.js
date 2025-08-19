export const generateNonce = async (userId) => {
    const nonce = new Uint8Array(24); // 24-byte nonce for ChaCha encryption
    crypto.getRandomValues(nonce);
    console.log("🔑 Generated Nonce:", nonce);
    return nonce;
};
