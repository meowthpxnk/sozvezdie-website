const CODE_VERIFIER_ALPHABET =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";

export function generateCodeVerifier(length = 64): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);

    let result = "";
    for (let i = 0; i < length; i++) {
        result += CODE_VERIFIER_ALPHABET[array[i] % CODE_VERIFIER_ALPHABET.length];
    }

    return result;
}
