
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeLessonPlan = async (
  base64File: string, 
  mimeType: string, 
  lessonFocus: string, 
  curriculum: string,
  studentNeeds?: string
) => {
  const ai = getAI();
  const prompt = `
    Act as a T-TESS expert and master instructional coach. 
    
    CONTEXT:
    - Target Lesson: ${lessonFocus}
    - Curriculum: ${curriculum}
    - Student Population Needs: ${studentNeeds || 'Standard mixed-ability classroom'}
    
    TASK:
    Analyze the attached week's worth of plans for the specific "${lessonFocus}" section. 
    Modify and rewrite the plan to achieve T-TESS "Distinguished" status.

    MANDATORY ENHANCEMENTS:
    1. DIFFERENTIATION MATRIX:
       - Provide specific scaffolds for "Struggling Learners" (Tier 3 focus).
       - Provide "Extension/Stretch" activities for "Advanced Learners" (High-performing focus).
    2. TIER 2 & 3 PLANNING:
       - Define 10-15 minutes of "Small Group Purposeful Talk" (FSGPT) specifically for Tier 2 students.
       - Include 1-2 specific "PAX Kernels" adapted for behavior support in Tiered intervention groups.
    3. MISCONCEPTION MAPPING:
       - Identify the top 3 common student misconceptions for this specific topic (especially within ${curriculum}).
       - Provide a "Corrective Action Script" for the teacher to use when these misconceptions occur.
    4. FUNDAMENTAL 5 & PAX:
       - Ensure "Power Zone" and "Framing" are explicitly linked to checking for understanding (CFU).

    REQUIRED OUTPUT STRUCTURE:
    - [LESSON OVERVIEW]: Summary of objectives and Framing.
    - [GAP ANALYSIS]: What was missing (e.g., lack of differentiation, no misconception planning).
    - [MISCONCEPTION & SOLUTIONS]: Table showing (Misconception | Corrective Strategy).
    - [DIFFERENTIATION PLAN]: Specific Tiers (Tier 1, Tier 2, Tier 3) and High-Achiever strategies.
    - [FULL DISTINGUISHED PLAN]: The complete rewritten lesson incorporating all framework requirements.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64File, mimeType } },
        { text: prompt }
      ]
    },
  });

  return response.text;
};

export const analyzeLessonExecution = async (base64File: string, mimeType: string) => {
  const ai = getAI();
  const prompt = `
    Analyze this classroom lesson recording (Audio/Video).
    Focus on:
    1. T-TESS Distinguished criteria (Engagement, Questioning, Differentiation).
    2. Fundamental 5: Did the teacher leave the Power Zone to address Tier 2/3 needs?
    3. PAX Kernels: Effectiveness of behavior management.
    4. Student Responses: Did the teacher catch misconceptions in real-time?
    
    Provide a formative grade and 3 "High-Leverage Actions" for the next lesson.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64File, mimeType } },
        { text: prompt }
      ]
    },
  });

  return response.text;
};

export const provideCoaching = async (scores: number[], reflection: string) => {
  const ai = getAI();
  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  const prompt = `
    Analyze this student data for an educator.
    - Scores: ${scores.join(', ')} (Average: ${average.toFixed(2)})
    - Teacher Reflection: "${reflection}"

    As an Instructional Coach:
    1. DATA CLASSIFICATION: Group students into Tiers based on these scores (e.g., 0-60 Tier 3, 61-80 Tier 2, 81+ Tier 1).
    2. CAUSE ANALYSIS: Connect specific Fundamental 5 gaps (e.g., weak framing or lack of FSGPT) to the score distribution.
    3. RE-TEACH PLAN: Provide a 15-minute re-teaching strategy for Tier 2/3 students that addresses likely misconceptions.
    4. DIFFERENTIATION ADVICE: How should the teacher change the *next* lesson's plan for high and low students based on this specific data?
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });

  return response.text;
};
