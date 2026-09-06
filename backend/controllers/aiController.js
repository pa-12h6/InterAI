const Groq = require("groq-sdk");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { createWorker } = require("tesseract.js");
const { createCanvas } = require("@napi-rs/canvas");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Generate interview questions
const generateQuestions = async (req, res) => {
  try {
    const { role, experience, difficulty } = req.body;

    if (!role || !experience || !difficulty) {
      return res.status(400).json({
        message: "Role, experience and difficulty are required",
      });
    }

    const prompt = `
You are an expert technical interviewer.

Generate 5 interview questions for:

Job Role: ${role}
Experience Level: ${experience}
Difficulty: ${difficulty}

Return ONLY a valid JSON array.

Format:
[
  {
    "question": "Interview question here",
    "topic": "Topic name"
  }
]
`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;

    const questions = JSON.parse(
      content.replace(/```json/g, "").replace(/```/g, "").trim()
    );

    res.status(200).json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error("Question Generation Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate interview questions",
      error: error.message,
    });
  }
};


// Evaluate candidate answer
const evaluateAnswer = async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        message: "Question and answer are required",
      });
    }

    const prompt = `
You are an expert technical interviewer.

Evaluate the candidate's answer.

Interview Question:
${question}

Candidate's Answer:
${answer}

Return ONLY valid JSON in exactly this format:

{
  "score": 8,
  "correctness": 8,
  "technicalQuality": 7,
  "communication": 9,
  "feedback": "Your answer is clear and mostly correct.",
  "suggestions": "Add more technical details and a practical example."
}

Rules:
- score must be between 0 and 10
- correctness must be between 0 and 10
- technicalQuality must be between 0 and 10
- communication must be between 0 and 10
- feedback should briefly explain the evaluation
- suggestions should explain how the candidate can improve
`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const content = completion.choices[0].message.content;

    const evaluation = JSON.parse(
      content.replace(/```json/g, "").replace(/```/g, "").trim()
    );

    res.status(200).json({
      success: true,
      evaluation,
    });
  } catch (error) {
    console.error("Answer Evaluation Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to evaluate answer",
      error: error.message,
    });
  }
};


// OCR scanned PDF
const extractTextFromScannedPDF = async (buffer) => {
  console.log("Starting OCR for scanned PDF...");

  const { getDocument } = await import(
    "pdfjs-dist/legacy/build/pdf.mjs"
  );

  const pdf = await getDocument({
    data: new Uint8Array(buffer),
  }).promise;

  console.log(`PDF pages found: ${pdf.numPages}`);

  const worker = await createWorker("eng");

  let extractedText = "";

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      console.log(`Processing PDF page ${pageNumber}/${pdf.numPages}...`);

      const page = await pdf.getPage(pageNumber);

      const viewport = page.getViewport({
        scale: 2,
      });

      const canvas = createCanvas(
        Math.ceil(viewport.width),
        Math.ceil(viewport.height)
      );

      const context = canvas.getContext("2d");

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;

      const imageBuffer = canvas.toBuffer("image/png");

      const result = await worker.recognize(imageBuffer);

      extractedText += "\n" + result.data.text;
    }
  } finally {
    await worker.terminate();
  }

  return extractedText.trim();
};


// Analyze resume
const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a resume",
      });
    }

    let resumeText = "";

    // PDF
    if (req.file.mimetype === "application/pdf") {
      console.log("Reading PDF...");

      // First try normal PDF text extraction
      const data = await pdfParse(req.file.buffer);

      resumeText = data.text.trim();

      // If no text, use OCR
      if (!resumeText) {
        console.log("No selectable text found. Starting OCR...");

        resumeText = await extractTextFromScannedPDF(
          req.file.buffer
        );
      }
    }

    // DOCX
    else if (
      req.file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      console.log("Reading DOCX...");

      const result = await mammoth.extractRawText({
        buffer: req.file.buffer,
      });

      resumeText = result.value.trim();
    }

    else {
      return res.status(400).json({
        success: false,
        message: "Only PDF and DOCX files are supported",
      });
    }

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: "Could not extract text from the resume",
      });
    }

    console.log("Resume text extracted successfully.");
    console.log("Characters extracted:", resumeText.length);

    const prompt = `
You are an expert resume reviewer and career advisor.

Analyze the following resume and provide a detailed but concise evaluation.

RESUME:
${resumeText}

Return ONLY valid JSON in exactly this format:

{
  "score": 85,
  "summary": "Short overall assessment of the resume.",
  "strengths": [
    "Strength 1",
    "Strength 2",
    "Strength 3"
  ],
  "weaknesses": [
    "Weakness 1",
    "Weakness 2",
    "Weakness 3"
  ],
  "skills": [
    "Skill 1",
    "Skill 2",
    "Skill 3"
  ],
  "suggestions": [
    "Suggestion 1",
    "Suggestion 2",
    "Suggestion 3",
    "Suggestion 4"
  ]
}

Rules:
- score must be between 0 and 100
- Do not invent information that is not present in the resume
- Give practical suggestions for improving the resume
- Focus on technical skills, projects, experience, education, structure and job-readiness
`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    let content = completion.choices[0].message.content;

    content = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const analysis = JSON.parse(content);

    res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Resume Analysis Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to analyze resume",
      error: error.message,
    });
  }
};


module.exports = {
  generateQuestions,
  evaluateAnswer,
  analyzeResume,
};