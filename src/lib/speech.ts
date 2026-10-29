// Lettura ad alta voce delle istruzioni, se il dispositivo la supporta.

export const canSpeak = (): boolean => typeof window !== 'undefined' && 'speechSynthesis' in window;

export function speak(text: string) {
  if (!canSpeak()) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'it-IT';
    u.rate = 0.92;
    const it = window.speechSynthesis.getVoices().find((v) => v.lang?.toLowerCase().startsWith('it'));
    if (it) u.voice = it;
    window.speechSynthesis.speak(u);
  } catch {
    /* niente: la lettura è un aiuto in più, non indispensabile */
  }
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel();
}
