const getApiKey = () => process.env.API_KEY || process.env.GEMINI_API_KEY;

const getContextForUser = (grade?: string, subject?: string, campus?: string, periodName?: string) => {
  const gradeNum = grade ? parseInt(grade.replace(/\D/g, ''), 10) : 0;
  const isFaulk = campus?.includes('Faulk');

  let gradeLevelContext = '';
  if (gradeNum >= 9 || grade?.includes('High')) {
    gradeLevelContext = `
      SECONDARY (9-12) ARANSAS PASS HS CONTEXT:
      - Class/Period: ${periodName || 'Standard'}
      - Focus on student-led inquiry and critical synthesis.
      - T-TESS Dimension 1.4: Lessons must connect to college/career/military pathways.
      - Fundamental 5: Prioritize "Write Critically" with complex analytical prompts.
    `;
  } else if (gradeNum >= 6) {
    gradeLevelContext = `
      MIDDLE SCHOOL (6-8) A.C. BLUNT CONTEXT:
      - Class/Period: ${periodName || 'Standard'}
      - Focus on Socratic methods and peer discourse.
      - T-TESS Dimension 2.1: Achieving "Distinguished" requires student-to-student coaching.
      - Fundamental 5: Prioritize "Purposeful Talk" every 10-15 minutes.
    `;
  } else {
    gradeLevelContext = `
      ELEMENTARY (PK-5) FAULK/CHARLIE MARSHALL CONTEXT:
      - Focus on high-engagement literacy/numeracy and modeling.
      - T-TESS Dimension 2.4: Differentiation through small group manipulation.
      - Fundamental 5: Prioritize "Power Zone" and "Framing the Lesson".
    `;
  }

  const paxContext = isFaulk
    ? `
    SPECIAL INSTRUCTION: This is Faulk Elementary. INTEGRATE PAX Good Behavior Game (PAXGBG) elements (Kernels, Spleems, PAX Vision).
  `
    : '';

  return `
    DISTRICT: Aransas Pass ISD
    CAMPUS: ${campus || 'District-Wide'}
    CORE FRAMEWORKS: Texas T-TESS, Fundamental 5, and TEKS.
    SUBJECT: ${subject || 'General Education'}
    ${gradeLevelContext}
    ${paxContext}
  `;
};

type GeminiContent = string | { parts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }> };

const callGemini = async (model: string, contents: GeminiContent, responseMimeType?: 'application/json') => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY. Set GEMINI_API_KEY in your environment before running the app.');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: typeof contents === 'string' ? [{ role: 'user', parts: [{ text: contents }] }] : [{ role: 'user', ...contents }],
        generationConfig: responseMimeType ? { responseMimeType } : undefined,
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API request failed (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? '').join('') ?? '';
};

export const analyzeLessonPlan = async (
  base64File: string,
  mimeType: string,
  lessonFocus: string,
  curriculum: string,
  studentNeeds?: string,
  studentTiers?: string,
  transitionStrategies?: string,
  spedRegistryContext?: string,
  grade?: string,
  userSubject?: string,
  campus?: string,
  periodName?: string,
) => {
  const context = getContextForUser(grade, userSubject || curriculum, campus, periodName);

  const prompt = `
    Act as an ELITE Instructional Coach for an Aransas Pass ISD teacher.
    FRAMEWORK: ${context}.

    CONTEXT:
    - PERIOD: ${periodName}
    - TEKS FOCUS: "${lessonFocus}"
    - CLASS PROFILE: ${studentNeeds}
    - STUDENT TIERS: ${studentTiers}
    - SPED/504 ACCOMMODATIONS: ${spedRegistryContext}

    YOUR TASK:
    1. Analyze the lesson for strict TEKS ALIGNMENT.
    2. REWRITE to achieve "DISTINGUISHED" status on T-TESS rubrics.

    REQUIRED OUTPUT STRUCTURE:
    - [T-TESS RATING & GAP ANALYSIS]

    - [DUAL-ACTION BLUEPRINT]
      Provide a side-by-side or clearly delineated list of:
      * TEACHER ACTIONS: (Power Zone moves, Framing, Purposeful Talk prompts).
      * STUDENT ACTIONS: (Engagement tasks, Critical writing, Discourse).

    - [STUDENT SELF-MONITORING STRATEGIES]
      Define 2-3 visual/tactile ways students track their own progress (e.g., Progress Lights, PAX counters).

    - [REAL-TIME DIFFERENTIATION PROTOCOL]
      * HIGH FLYER JOBS: Define roles like "Lead Inspector" or "Peer Coach" for students who master the concept early.
      * TIER 3 INTERVENTION TRIGGER: Specific signals for moving struggling students to a teacher-led small group cluster.

    - [REWRITTEN DISTINGUISHED PLAN]

    IMPORTANT: Include a line at the top: "PLANNING SCORE: [0-100]"
  `;

  return callGemini('gemini-2.0-flash', {
    parts: [{ inlineData: { data: base64File, mimeType } }, { text: prompt }],
  });
};

/**
 * ADMIN AI AGENT FUNCTIONS
 */

export const scanCampusForPDNeeds = async (campusData: any[]) => {
  const prompt = `
    Act as the Aransas Pass ISD Strategic AI Analyst.
    Analyze the following campus performance data: ${JSON.stringify(campusData)}.

    Identify professional development (PD) needs based on T-TESS Dimensions and Fundamental 5.

    Output JSON format:
    {
      "heatMap": [
        {"dimension": "string", "score": number, "status": "Strong" | "Growth" | "Critical"}
      ],
      "topPDNeed": {
        "title": "string",
        "rationale": "string",
        "actionStep": "string"
      },
      "insight": "string"
    }
  `;
  const text = await callGemini('gemini-2.0-flash', prompt, 'application/json');
  return JSON.parse(text);
};

export const performCurriculumAudit = async (campusName: string, recentPlans: any[]) => {
  const prompt = `
    Act as a Curriculum Auditor for ${campusName} in Aransas Pass ISD.
    Review these recent lesson plans: ${JSON.stringify(recentPlans)}.

    Check for fidelity to district expectations:
    1. Are conceptual understanding blocks being taught or skipped for fluency?
    2. Is the Fundamental 5 "Write Critically" step present?

    Output JSON format:
    {
      "fidelityScore": number,
      "auditFindings": [
        {"area": "string", "deviation": number, "finding": "string"}
      ],
      "recommendation": "string"
    }
  `;
  const text = await callGemini('gemini-2.0-flash', prompt, 'application/json');
  return JSON.parse(text);
};

export const detectBehaviorClusters = async (behaviorLogs: any[]) => {
  const prompt = `
    Act as a PAX Behavior Specialist for Aransas Pass ISD.
    Analyze these campus behavior reports: ${JSON.stringify(behaviorLogs)}.

    Identify clusters (time, location, or grade) and suggest PAX Kernels.

    Output JSON format:
    {
      "clusters": [
        {"timeBlock": "string", "grade": "string", "issue": "string", "severity": "High" | "Medium" | "Low"}
      ],
      "paxSolution": {
        "kernel": "string",
        "implementation": "string"
      },
      "rootCauseHypothesis": "string"
    }
  `;
  const text = await callGemini('gemini-2.0-flash', prompt, 'application/json');
  return JSON.parse(text);
};

export const generateInterventionGroups = async (assessments: any[], history: any[]) => {
  const prompt = `Analyze Aransas Pass ISD student data for targeted intervention. DATA: ${JSON.stringify(assessments)} ${JSON.stringify(history)}. REQUIRED JSON FORMAT: [{"skill": "string", "studentNames": ["string"], "tier": 2 | 3, "lessonPlan": "markdown"}]`;
  const text = await callGemini('gemini-2.0-flash', prompt, 'application/json');
  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
};

export const refineLessonWithCoaching = async (originalPlan: string, coachingFeedback: string) =>
  callGemini('gemini-2.0-flash', `Refine this APISD lesson plan: ${originalPlan} based on: ${coachingFeedback}.`);

export const analyzeLessonExecution = async (base64File: string, mimeType: string, plannedLessonContent?: string) =>
  callGemini('gemini-2.0-flash', {
    parts: [{ inlineData: { data: base64File, mimeType } }, { text: 'Analyze classroom execution. DISCOURSE SCORE: [0-100]' }],
  });

export const analyzeLessonTranscript = async (transcript: string, plannedLessonContent?: string) =>
  callGemini('gemini-2.0-flash', {
    parts: [{ text: transcript }, { text: 'Analyze Aransas Pass ISD transcript. DISCOURSE SCORE: [0-100]' }],
  });

export const provideCoaching = async (
  students: any[],
  reflection: string,
  evidenceBase64?: string,
  evidenceMimeType?: string,
  behaviorNotes?: string,
  spedRegistryContext?: string,
) => {
  const parts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }> = [
    { text: `Provide T-TESS coaching: ${reflection} ${behaviorNotes} ${spedRegistryContext}` },
  ];
  if (evidenceBase64 && evidenceMimeType) {
    parts.unshift({ inlineData: { data: evidenceBase64, mimeType: evidenceMimeType } });
  }
  return callGemini('gemini-2.0-flash', { parts });
};

export const predictStudentGrowth = async (assessmentHistory: any[], dailyMasteryHistory: any[]) => {
  const prompt = `Predict Aransas Pass ISD student growth toward TEKS mastery.
    Assessment History: ${JSON.stringify(assessmentHistory)}
    Daily Mastery History: ${JSON.stringify(dailyMasteryHistory)}

    JSON format with keys moy and eoy.`;

  const text = await callGemini('gemini-2.0-flash', prompt, 'application/json');
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};
