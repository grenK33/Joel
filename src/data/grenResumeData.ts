export interface PerceptionQuote {
  quote: string;
  source: string;
  context: string;
}

export interface PatternItem {
  id: string;
  title: string;
  consensus: string;
  description: string;
  quotes: PerceptionQuote[];
  takeaway: string;
}

export const GREN_PROFILE = {
  name: "Gren",
  handle: "@Gren",
  title: "Fast-Thinking, Dependable & Driven Teammate / Leader",
  email: "GrenKevin10@gmail.com",
  date: "Oct 5, 2026",
  documentTitle: "Perception Audit – Summary",
  pdfPath: "/assets/aistudio/Perception_Audit___Summary__1__3952750c.pdf",
  essenceWords: ["Dependable", "Quick-thinking", "Driven"],
  headlineStrength: "Speed: reacting, calculating, solving, and adapting under high pressure",
  
  auditOverview: {
    respondentsCount: 5,
    respondentsList: [
      { relation: "Grandma", language: "Estonian", note: "Noted quick reactions in life & sport; said Gren could lead a team" },
      { relation: "Grandpa", language: "Estonian", note: "Highlighted quick calculating and 'less talk, more action' approach" },
      { relation: "Mom", language: "Estonian", note: "Praised quickly finding clever solutions and a fighter's spirit" },
      { relation: "Girlfriend", language: "Estonian", note: "Emphasized solving problems fast while staying calm; caring nature" },
      { relation: "Online Friend", language: "Online only", note: "Pointed out adapting faster than most people & charisma" }
    ],
    summaryNote: "Personal perception audit conducted with 5 closest stakeholders (translated from Estonian). Offers unfiltered insight into verified instincts, character under pressure, and interpersonal impact."
  },

  patterns: [
    {
      id: "fast-thinker",
      title: "Fast Thinker Under Pressure",
      consensus: "5/5 Consensus (4/5 named #1 Superpower)",
      description: "Exceptional cognitive speed, adapting quickly to chaotic or high-stakes scenarios while maintaining composure.",
      quotes: [
        { quote: "Quick reactions in life and in sport", source: "Grandma", context: "Reaction speed" },
        { quote: "Quick calculating", source: "Grandpa", context: "Analytical pace" },
        { quote: "Quickly finding clever solutions", source: "Mom", context: "Problem-solving ingenuity" },
        { quote: "Solving problems fast while staying calm", source: "Girlfriend", context: "Poise under pressure" },
        { quote: "Adapts faster than most people", source: "Online Friend", context: "Adaptability" }
      ],
      takeaway: "Headline strength: Rapid problem diagnosis and execution under pressure."
    },
    {
      id: "dependable",
      title: "Rock-Solid Dependability",
      consensus: "4/5 Consensus",
      description: "Consistent accountability, keeps commitments, and remains a pillar teammates can turn to in difficulties.",
      quotes: [
        { quote: "Never leaves you in trouble", source: "Grandma", context: "Loyalty & backup" },
        { quote: "Can always be counted on", source: "Mom", context: "Consistency" },
        { quote: "Keeps promises and trustworthy", source: "Girlfriend", context: "Integrity" },
        { quote: "Quite dependable", source: "Online Friend", context: "Reliability" }
      ],
      takeaway: "Lead with sound judgment, integrity, and rock-solid reliability."
    },
    {
      id: "driven",
      title: "Driven and Competitive",
      consensus: "4/5 Consensus",
      description: "Determined, decisive mindset with a fighter's spirit and relentless focus on winning outcomes.",
      quotes: [
        { quote: "Gren has a fighter's spirit", source: "Mom", context: "Resilience" },
        { quote: "Winner's mentality, never gives up", source: "Consensus summary", context: "Tenacity" }
      ],
      takeaway: "High-agency execution that lifts team ambition and drives initiatives to completion."
    },
    {
      id: "team-player",
      title: "Impactful Teammate & Natural Leader",
      consensus: "4/5 Consensus",
      description: "Every 'who benefits' query pointed to team environments: building something new, brainstorming, or delivering on ambitious goals.",
      quotes: [
        { quote: "Could lead a team very well", source: "Grandma", context: "Leadership capacity" },
        { quote: "Best for teams building something new, brainstorming, needing good ideas", source: "All respondents", context: "Team fit" }
      ],
      takeaway: "Thrives in innovative, fast-moving teams and project-lead roles."
    },
    {
      id: "comm-style",
      title: "Friendly, Honest & Action-Oriented",
      consensus: "5/5 Friendly",
      description: "Direct and to the point. Grounded with light humor, preferring tangible results over unnecessary talk.",
      quotes: [
        { quote: "Less talk, more action", source: "Grandpa", context: "Execution bias" },
        { quote: "Good sense of reality / Both feet on the ground", source: "Grandma", context: "Groundedness" }
      ],
      takeaway: "Straightforward communication, realistic expectations, high trust."
    }
  ],

  surpriseInsight: {
    title: "The Caring Dimension",
    description: "While 4 out of 5 respondents focused on speed, calculation, and competitive drive, Gren's girlfriend revealed a deeper emotional intelligence superpower: Gren puts the people close to him above himself and makes them feel truly valued. It shows warmth, empathy, and genuine care that balances his high-drive exterior.",
    quote: "Gren puts the people close to him above himself and makes them feel valued."
  },

  dissonanceInsight: {
    title: "Quiet vs. Charismatic Nuance",
    description: "Grandparents perceive Gren as a person of few words, while his online friend calls him charismatic and grandpa calls him sociable. His partner notes both modest and self-confident. Gren operates with quiet confidence in familiar settings, while demonstrating high charisma and engagement in interactive collaborative environments."
  },

  idealRoles: [
    "Teams building 0-to-1 products or entering fast-paced growth phases",
    "Project Lead & Team Lead positions requiring rapid decision-making",
    "High-stakes problem-solving and rapid prototyping environments",
    "Collaborative initiatives that value dependable follow-through and honest, direct feedback"
  ],

  suggestedQuestions: [
    "What are Gren's top superpowers?",
    "How does Gren perform under high pressure?",
    "What do people say about Gren as a teammate and leader?",
    "What are Gren's 3 essence words?",
    "What kind of teams and projects benefit most from Gren?",
    "What is the surprising insight about his interpersonal style?",
    "What is Gren's communication and work ethic style?",
    "How can I get in touch with Gren?"
  ]
};

export const INITIAL_GREETING = "Hello, I am Gren's assistant, what would you like to know about him?";
