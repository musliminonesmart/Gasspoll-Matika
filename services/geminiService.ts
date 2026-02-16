
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Grade, Difficulty, ChatMessage } from "../types";

// Always initialize GoogleGenAI using a named parameter with process.env.API_KEY
const ai = new GoogleGenAI({ 
  apiKey: process.env.API_KEY 
});

export async function sendChatMatikaMessage(
  history: ChatMessage[],
  message: string,
  classLevel: string,
  topicHint: string | null
): Promise<string> {
  const systemPrompt = `
    PERAN: Kak Chat Matika — Konsultan pakar matematika SD (kelas 4–6), khusus persiapan TKA/ujian.
    TARGET: Siswa kelas ${classLevel} SD.
    
    MODE RESPONS:
    1. KONSULTASI (Default): Gunakan gaya WhatsApp (baris pendek, *bold*).
    2. VISUAL_REQUEST: Aktif jika siswa minta "gambar", "diagram", "ilustrasi", "visual", "bagan", "grafik", "plot", "buatkan gambar", "tolong gambarkan", atau sejenisnya.

    ATURAN VISUAL_REQUEST (WAJIB):
    Jika siswa minta visual, respons HARUS berupa JSON valid (TANPA teks tambahan di luar JSON) dengan format:
    {
      "type": "diagram_spec",
      "title": "Judul Diagram",
      "topic": "Topik Terkait",
      "level": ${classLevel},
      "svg": "<svg viewBox='0 0 900 520' xmlns='http://www.w3.org/2000/svg'>...</svg>",
      "caption": "✨ *INTI*: ...\\n🧩 *CARA LIHATNYA*: ...\\n✅ *KESIMPULAN*: ...",
      "printable": true,
      "tags": ["pecahan", "garis_bilangan", "bangun_datar", "diagram_batang", "diagram_lingkaran"]
    }

    PANDUAN SVG UNTUK ANAK (VISUAL_REQUEST):
    - ViewBox: "0 0 900 520". Background: putih (<rect width='900' height='520' fill='white'/>).
    - Font: Arial. Ukuran: Judul min 22px, Label min 18px.
    - Warna pastel/ramah: Matcha (#769F76), Blue (#60A5FA), Yellow (#FBBF24), Purple (#A78BFA), Gray (#e5e7eb).
    - DILARANG menggunakan LaTeX ($...$). Gunakan simbol biasa (×, ÷, √, =, akar()).
    - Pie chart pecahan: gunakan path dengan arc. 
    - Garis bilangan: sertakan angka negatif jika relevan.
    - Bangun datar: sertakan label panjang sisi atau nama sudut yang jelas.

    GAYA BICARA KONSULTASI (NON-VISUAL):
    - Gunakan GAYA WHATSAPP: baris pendek, *bold* untuk penekanan.
    - Tanpa LaTeX. Gunakan ×, ÷, √.
    - Struktur: ✨ *INTI KONSEP*, 🧩 *LANGKAH CEPAT*, ✅ *CONTOH MINI*, ⭐ *TIPS*.

    ATURAN KHUSUS:
    - JANGAN PERNAH minta siswa mengetik jawaban bebas; latihan SELALU PG A–D.
    - Jika curhat: respon empatik singkat + beri 1 langkah kecil.
  `;

  try {
    const formattedHistory = history
      .filter(h => h.role !== 'system')
      .map(h => ({
        role: h.role === 'assistant' ? 'model' : h.role,
        parts: [{ text: h.text }]
      }));

    // Use ai.models.generateContent for querying GenAI with model and prompt
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: systemPrompt,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    // Access .text property directly from response
    return response.text || "Maaf Kak Chat Matika sedang tidak bisa menjawab. Coba lagi ya!";
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    return "Ups, ada gangguan sinyal! Kak Chat Matika coba sambung lagi nanti ya 😊";
  }
}

export async function generateQuestions(grade: Grade, topic: string, difficulty: Difficulty, count: number): Promise<Question[]> {
  const prompt = `Generate ${count} math questions for Grade ${grade} Indonesian elementary school. Topic: ${topic}. Difficulty: ${difficulty}. Format as JSON matching the schema. Use NO LaTeX.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING },
              answer: { type: Type.STRING },
              answer_text: { type: Type.STRING },
              choices: {
                type: Type.OBJECT,
                properties: { A: { type: Type.STRING }, B: { type: Type.STRING }, C: { type: Type.STRING }, D: { type: Type.STRING } }
              },
              hint: { type: Type.ARRAY, items: { type: Type.STRING } },
              explanation: { type: Type.STRING },
              topic: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['choice'] }
            }
          }
        }
      }
    });
    // response.text is a property, not a method
    return JSON.parse(response.text || "[]");
  } catch (error) { return []; }
}

export async function generateTopicMaterial(grade: Grade, topic: string) {
  const prompt = `Buatkan ringkasan materi matematika lengkap untuk Kelas ${grade} SD. Topik: ${topic}. Format as JSON. NO LaTeX.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            formulas: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, formula: { type: Type.STRING }, description: { type: Type.STRING } } } },
            example: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, steps: { type: Type.ARRAY, items: { type: Type.STRING } }, answer: { type: Type.STRING } } },
            subtopics: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, title: { type: Type.STRING } } } }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) { return null; }
}

export async function generateSubtopicMaterial(grade: Grade, topic: string, subtopicTitle: string) {
  const prompt = `Buatkan detail materi untuk subtopik matematika Kelas ${grade} SD. Topik Utama: ${topic}. Subtopik: ${subtopicTitle}. Format as JSON. NO LaTeX.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            concept: { type: Type.STRING },
            formula: { type: Type.STRING },
            examples: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, steps: { type: Type.ARRAY, items: { type: Type.STRING } }, answer: { type: Type.STRING } } } },
            drills: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, answer: { type: Type.STRING } } } }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) { return null; }
}

export async function generateTkaExplanation(qNo: number, topic: string, sub: string, userAns: string, correctAns: string): Promise<string> {
  const prompt = `Sebagai Kak Chat Matika, jelaskan pembahasan soal nomor ${qNo} tentang ${topic}. NO LaTeX. Gunakan gaya WhatsApp. Konteks: Siswa jawab ${userAns}, Harusnya ${correctAns}.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Maaf, pembahasan soal ini belum tersedia.";
  } catch (error) {
    return "Gagal mengambil pembahasan.";
  }
}

export async function generateRemedialQuestions(topic: string, count: number): Promise<Question[]> {
  return generateQuestions(Grade.K6, topic, Difficulty.Serius, count);
}
