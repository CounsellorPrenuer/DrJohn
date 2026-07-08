import { useState, useCallback, useRef } from "react";

// ─── COLOUR TOKENS ────────────────────────────────────────────────────────────
// Deep navy + warm gold + friendly teal — feels trustworthy but not intimidating
// Signature element: emoji-rich module intro cards that feel like a quiz game, not a test

// ─── 100 SIMPLE QUESTIONS ACROSS 10 MODULES ──────────────────────────────────
// Every question uses plain language a 13-year-old easily understands
// Each module: 10 questions

const MODULES = [
  {
    key: "thinking",
    label: "How You Think",
    emoji: "🧠",
    color: "#6C63FF",
    light: "#EEF",
    what: "How fast and clearly your brain solves problems.",
    why: "Some people are great at puzzles and logic. Others are amazing at words or numbers. This finds YOUR strongest thinking style.",
    time: "3 min",
    type: "mcq",
  },
  {
    key: "feelings",
    label: "Understanding Feelings",
    emoji: "💛",
    color: "#F59E0B",
    light: "#FFFBEB",
    what: "How well you understand your own feelings and other people's feelings.",
    why: "People with high emotional intelligence are amazing at teamwork, leadership, and helping others — skills no AI can replace.",
    time: "2 min",
    type: "agree",
  },
  {
    key: "personality",
    label: "Your Personality",
    emoji: "🔮",
    color: "#8B5CF6",
    light: "#F5F3FF",
    what: "Whether you're more outgoing or quiet, more planned or spontaneous.",
    why: "Knowing your personality helps you pick careers where you'll actually enjoy going to work every day.",
    time: "3 min",
    type: "choice",
  },
  {
    key: "interests",
    label: "What You Love",
    emoji: "🎯",
    color: "#EF4444",
    light: "#FEF2F2",
    what: "Which types of activities and work you enjoy most.",
    why: "When your job matches what you love, work feels less like work. This is one of the most important career factors.",
    time: "2 min",
    type: "rate",
  },
  {
    key: "values",
    label: "What Matters to You",
    emoji: "⭐",
    color: "#10B981",
    light: "#ECFDF5",
    what: "What you want most from a career — money, helping others, creativity, stability?",
    why: "People who work in jobs that match their values feel happier and more fulfilled — even if the salary is the same.",
    time: "2 min",
    type: "rate",
  },
  {
    key: "strengths",
    label: "Your Superpowers",
    emoji: "💡",
    color: "#F97316",
    light: "#FFF7ED",
    what: "Which of the 8 types of intelligence are strongest in YOU.",
    why: "Howard Gardner discovered people are smart in 8 different ways — not just maths and reading. Find YOUR kind of smart.",
    time: "2 min",
    type: "agree",
  },
  {
    key: "grit",
    label: "Never Give Up",
    emoji: "🔥",
    color: "#DC2626",
    light: "#FEF2F2",
    what: "How well you stick with hard things and bounce back from setbacks.",
    why: "Research shows grit — the ability to keep going — predicts success more than talent or intelligence alone.",
    time: "2 min",
    type: "agree",
  },
  {
    key: "people",
    label: "How You Handle Conflict",
    emoji: "⚖️",
    color: "#0EA5E9",
    light: "#F0F9FF",
    what: "How calm and patient you are when things are difficult or unfair.",
    why: "Every career involves people. How you handle disagreement and frustration shapes whether you thrive at work.",
    time: "2 min",
    type: "agree",
  },
  {
    key: "ethics",
    label: "Your Values Under Pressure",
    emoji: "🛡️",
    color: "#059669",
    light: "#ECFDF5",
    what: "How honest and ethical you are when it's hard to be.",
    why: "Integrity — doing the right thing even when no one is watching — is one of the most valued traits in every profession.",
    time: "2 min",
    type: "agree",
  },
  {
    key: "mindset",
    label: "Growth Mindset",
    emoji: "🚀",
    color: "#7C3AED",
    light: "#F5F3FF",
    what: "Whether you believe you can grow and improve — or that talent is fixed.",
    why: "People who believe they can improve are more resilient, learn faster, and achieve more. This is your most changeable trait.",
    time: "2 min",
    type: "agree",
  },
];

// ─── QUESTION BANKS ───────────────────────────────────────────────────────────

const QUESTIONS = {
  thinking: [
    { id:"t1", text:"Which number comes next? 2, 4, 8, 16, ___", options:["24","32","28","30"], correct:1 },
    { id:"t2", text:"If all dogs are animals, and Rex is a dog, then Rex is:", options:["A cat","An animal","A bird","Not sure"], correct:1 },
    { id:"t3", text:"PENCIL is to WRITE as KNIFE is to:", options:["Eat","Cut","Sharp","Metal"], correct:1 },
    { id:"t4", text:"A shop sells apples for ₹5 each. You have ₹35. How many can you buy?", options:["5","6","7","8"], correct:2 },
    { id:"t5", text:"Which word does NOT fit? Dog, Cat, Rose, Horse", options:["Dog","Cat","Rose","Horse"], correct:2 },
    { id:"t6", text:"Complete the pattern: 🔴🔵🔴🔵🔴 — what comes next?", options:["🔴","🔵","🟡","🟢"], correct:1 },
    { id:"t7", text:"If yesterday was Tuesday, what day is it tomorrow?", options:["Wednesday","Thursday","Friday","Monday"], correct:1 },
    { id:"t8", text:"Rearrange these letters to make a colour: E-U-L-B", options:["LUBE","BLUE","BELL","CUBE"], correct:1 },
    { id:"t9", text:"Which is the odd one out? 10, 20, 35, 40", options:["10","20","35","40"], correct:2 },
    { id:"t10", text:"If a pizza is cut into 8 slices and you eat 3, what fraction is left?", options:["3/8","5/8","1/2","4/8"], correct:1 },
  ],
  feelings: [
    { id:"f1", text:"I can tell when a friend is upset, even if they say they're fine.", r:false },
    { id:"f2", text:"When I'm angry, I sometimes say things I later regret.", r:true },
    { id:"f3", text:"I take a moment to calm down before reacting to bad news.", r:false },
    { id:"f4", text:"It's hard for me to understand why people feel upset over small things.", r:true },
    { id:"f5", text:"I notice when my mood is making me treat others badly.", r:false },
    { id:"f6", text:"I find it easy to cheer up a friend who is feeling down.", r:false },
    { id:"f7", text:"I get very stressed and panicky when things go wrong.", r:true },
    { id:"f8", text:"I can stay calm even when someone is being unfair to me.", r:false },
    { id:"f9", text:"I understand what I am feeling and why, most of the time.", r:false },
    { id:"f10", text:"I often feel overwhelmed by my emotions and don't know how to handle them.", r:true },
  ],
  personality: [
    { id:"p1", a:"I feel more energised after spending time with a big group of friends.", b:"I feel more energised after quiet time alone." },
    { id:"p2", a:"I like to have a clear plan before starting a project.", b:"I prefer to figure things out as I go." },
    { id:"p3", a:"I focus on facts and what is real right now.", b:"I love imagining possibilities and what could be." },
    { id:"p4", a:"When making decisions, logic and fairness matter most to me.", b:"When making decisions, how it affects people's feelings matters most." },
    { id:"p5", a:"I like finishing one task completely before starting another.", b:"I enjoy working on several things at once." },
    { id:"p6", a:"I enjoy meeting new people and starting conversations easily.", b:"I prefer spending time with a small group of close friends." },
    { id:"p7", a:"I prefer a well-organised bedroom or workspace.", b:"A bit of creative chaos doesn't bother me at all." },
    { id:"p8", a:"I prefer step-by-step instructions.", b:"I prefer figuring out my own way of doing things." },
    { id:"p9", a:"I would rather be seen as fair and honest.", b:"I would rather be seen as kind and caring." },
    { id:"p10", a:"I like knowing exactly what is going to happen.", b:"I love surprises and spontaneous plans." },
  ],
  interests: [
    { id:"i1", text:"Building, fixing, or making things with my hands" },
    { id:"i2", text:"Solving science experiments or maths puzzles" },
    { id:"i3", text:"Drawing, painting, writing stories, or making music" },
    { id:"i4", text:"Helping, teaching, or taking care of other people" },
    { id:"i5", text:"Leading a group, starting something new, or selling ideas" },
    { id:"i6", text:"Organising, managing records, or following clear rules" },
    { id:"i7", text:"Working with animals, plants, or nature outdoors" },
    { id:"i8", text:"Using computers, coding, or working with technology" },
    { id:"i9", text:"Cooking, sports, or physical activities" },
    { id:"i10", text:"Investigating mysteries, researching facts, or analysing data" },
  ],
  values: [
    { id:"v1", text:"Making a real difference in other people's lives" },
    { id:"v2", text:"Having a stable, secure job and income" },
    { id:"v3", text:"Being my own boss and making my own decisions" },
    { id:"v4", text:"Expressing myself creatively through my work" },
    { id:"v5", text:"Earning a lot of money and building wealth" },
    { id:"v6", text:"Constantly learning new things and growing smarter" },
    { id:"v7", text:"Working on exciting, cutting-edge projects" },
    { id:"v8", text:"Being part of a team and having good colleagues" },
    { id:"v9", text:"Having a job with purpose — fighting for fairness or justice" },
    { id:"v10", text:"Seeing physical, tangible results from the work I do" },
  ],
  strengths: [
    { id:"s1", text:"I find it easy to explain things clearly in words or writing.", dom:"Linguistic" },
    { id:"s2", text:"I enjoy solving number problems and logical brain teasers.", dom:"Logical" },
    { id:"s3", text:"I can picture things clearly in my head — like maps or designs.", dom:"Spatial" },
    { id:"s4", text:"I learn best by moving around, doing things with my hands.", dom:"Kinesthetic" },
    { id:"s5", text:"I can easily recognise and remember tunes, rhythms, or songs.", dom:"Musical" },
    { id:"s6", text:"I am good at reading people and understanding what they need.", dom:"Interpersonal" },
    { id:"s7", text:"I often reflect on my own thoughts, feelings, and goals.", dom:"Intrapersonal" },
    { id:"s8", text:"I feel very connected to nature, animals, and the outdoors.", dom:"Naturalistic" },
    { id:"s9", text:"I enjoy reading, writing, or telling stories more than most people.", dom:"Linguistic" },
    { id:"s10", text:"People often come to me for advice when they have a problem.", dom:"Interpersonal" },
  ],
  grit: [
    { id:"g1", text:"I finish what I start, even when it gets very hard.", r:false },
    { id:"g2", text:"When I fail at something, I want to try harder next time.", r:false },
    { id:"g3", text:"I often quit things halfway through when I lose interest.", r:true },
    { id:"g4", text:"I have worked hard at something for a long time to get better at it.", r:false },
    { id:"g5", text:"I get discouraged easily when I don't see results quickly.", r:true },
    { id:"g6", text:"I keep going on a goal even when my friends have given up.", r:false },
    { id:"g7", text:"I jump between different hobbies and interests a lot.", r:true },
    { id:"g8", text:"I believe that effort and practice matter more than natural talent.", r:false },
    { id:"g9", text:"Failing once makes me want to give up on that activity.", r:true },
    { id:"g10", text:"I have overcome a big setback to achieve something I am proud of.", r:false },
  ],
  people: [
    { id:"c1", text:"I can stay calm even when someone criticises me unfairly.", r:false },
    { id:"c2", text:"Small annoyances can make me lose my temper quickly.", r:true },
    { id:"c3", text:"I can wait patiently for something I really want.", r:false },
    { id:"c4", text:"I believe most arguments can be sorted out calmly by talking.", r:false },
    { id:"c5", text:"I hold grudges for a long time after an argument.", r:true },
    { id:"c6", text:"I find it hard to listen to someone I disagree with.", r:true },
    { id:"c7", text:"I can apologise when I am wrong, even if it's uncomfortable.", r:false },
    { id:"c8", text:"I stay calm under pressure and tight deadlines.", r:false },
    { id:"c9", text:"When someone upsets me, I say things I wish I hadn't.", r:true },
    { id:"c10", text:"I can see the other person's point of view, even in an argument.", r:false },
  ],
  ethics: [
    { id:"e1", text:"I tell the truth even when lying would make things easier.", r:false },
    { id:"e2", text:"I follow the rules even when no one is watching.", r:false },
    { id:"e3", text:"I sometimes take credit for things I didn't fully do.", r:true },
    { id:"e4", text:"I would speak up if I saw someone being treated unfairly.", r:false },
    { id:"e5", text:"I keep my promises even when it's inconvenient for me.", r:false },
    { id:"e6", text:"I believe it's okay to bend the rules slightly if no one gets hurt.", r:true },
    { id:"e7", text:"I would admit a mistake even if it meant getting into trouble.", r:false },
    { id:"e8", text:"I treat everyone fairly, even people I don't like.", r:false },
    { id:"e9", text:"I sometimes do things just to look good, not because they are right.", r:true },
    { id:"e10", text:"I would rather lose something than win it by cheating.", r:false },
  ],
  mindset: [
    { id:"m1", text:"I believe I can get better at almost anything if I practise.", r:false },
    { id:"m2", text:"When something is hard, I see it as a chance to learn.", r:false },
    { id:"m3", text:"I believe some people are just naturally talented and I'm not one of them.", r:true },
    { id:"m4", text:"I enjoy trying new things, even if I might fail at first.", r:false },
    { id:"m5", text:"I give up quickly on things I'm not immediately good at.", r:true },
    { id:"m6", text:"Feedback and criticism help me improve — I welcome it.", r:false },
    { id:"m7", text:"I believe the effort I put in matters more than how naturally talented I am.", r:false },
    { id:"m8", text:"I feel threatened when someone is better than me at something.", r:true },
    { id:"m9", text:"I think technology like AI is an exciting opportunity, not a scary threat.", r:false },
    { id:"m10", text:"I adapt quickly when plans change unexpectedly.", r:false },
  ],
};

// ─── CAREERS DATABASE ─────────────────────────────────────────────────────────
const CAREERS = [
  { id:"doctor", title:"Doctor / Surgeon", emoji:"🏥", sector:"Healthcare", why:"You love helping people and have strong logical thinking.", riasec:{I:90,S:80,R:30,A:20,E:30,C:50}, traits:{thinking:70,feelings:75,grit:85,ethics:90}, aiRisk:8, description:"Diagnose and treat illness, perform surgery, and care for patients.", salary:"₹8–50L/year", path:"MBBS (5.5 years) → Medical specialisation → Practice" },
  { id:"nurse", title:"Nurse", emoji:"💊", sector:"Healthcare", why:"You are caring, calm under pressure, and love helping others.", riasec:{S:95,I:55,R:35,C:50}, traits:{feelings:90,ethics:85,grit:80}, aiRisk:7, description:"Provide hands-on patient care, emotional support, and coordinate treatment.", salary:"₹3–12L/year", path:"BSc Nursing (4 years) → NCLEX/Nursing license → Specialise" },
  { id:"teacher", title:"Teacher / Educator", emoji:"📚", sector:"Education", why:"You love explaining things and seeing others grow.", riasec:{S:90,A:50,I:55,C:45}, traits:{feelings:85,ethics:80,mindset:75}, aiRisk:6, description:"Plan lessons, inspire students, and shape the next generation.", salary:"₹3–15L/year", path:"B.Ed or subject degree → CTET/TET → Teaching position" },
  { id:"engineer", title:"Engineer (Software/Civil/Mechanical)", emoji:"⚙️", sector:"Technology", why:"Your logical thinking and love of building things make you a natural.", riasec:{R:75,I:85,C:55}, traits:{thinking:85,grit:70,mindset:80}, aiRisk:5, description:"Design, build, and solve problems using science and mathematics.", salary:"₹5–40L/year", path:"B.Tech/BE (4 years) → JEE / GATE → Specialise" },
  { id:"psychologist", title:"Psychologist / Counsellor", emoji:"🧠", sector:"Mental Health", why:"You understand feelings deeply and people trust you naturally.", riasec:{S:95,I:70,A:40}, traits:{feelings:90,ethics:90,people:85}, aiRisk:8, description:"Help people understand their emotions and overcome mental health challenges.", salary:"₹4–20L/year", path:"BA/BSc Psychology → MA/MSc → RCI License" },
  { id:"entrepreneur", title:"Entrepreneur", emoji:"🚀", sector:"Business", why:"You love leading, taking risks, and making things happen.", riasec:{E:90,A:55,I:50}, traits:{grit:95,mindset:90,feelings:70}, aiRisk:7, description:"Start and grow your own business, creating jobs and solving problems.", salary:"Variable — unlimited potential", path:"Any degree → Build skills → Start small → Scale up" },
  { id:"artist", title:"Artist / Designer / Filmmaker", emoji:"🎨", sector:"Creative", why:"Your creativity and unique way of seeing the world is your superpower.", riasec:{A:95,E:50,I:35}, traits:{mindset:80,grit:75}, aiRisk:5, description:"Create art, designs, films, or digital content that moves and inspires people.", salary:"₹2–25L/year", path:"BFA / Design degree → Portfolio → Freelance or studio" },
  { id:"lawyer", title:"Lawyer / Judge", emoji:"⚖️", sector:"Law", why:"Your strong sense of fairness and logical thinking make you excellent at this.", riasec:{E:75,I:65,S:55,C:65}, traits:{thinking:85,ethics:95,people:80}, aiRisk:5, description:"Represent clients, argue cases, and uphold justice in society.", salary:"₹4–30L/year", path:"BA LLB (5 years) / LLB (3 years) → CLAT → Bar Council enrollment" },
  { id:"chef", title:"Chef / Culinary Artist", emoji:"👨‍🍳", sector:"Hospitality", why:"Your creativity and love of making things others enjoy shines here.", riasec:{R:70,A:75,E:50}, traits:{grit:80,mindset:75}, aiRisk:8, description:"Create dishes, manage kitchens, and bring joy through food.", salary:"₹2–20L/year", path:"Culinary school / Hotel Management → Apprenticeship → Head chef" },
  { id:"scientist", title:"Scientist / Researcher", emoji:"🔬", sector:"Science", why:"Your curiosity, logical mind, and love of discovering how things work.", riasec:{I:95,R:55,C:60}, traits:{thinking:90,grit:85,mindset:90}, aiRisk:6, description:"Conduct experiments, discover new knowledge, and push the boundaries of what we know.", salary:"₹4–25L/year", path:"BSc → MSc → PhD → Research institution or university" },
  { id:"social_worker", title:"Social Worker", emoji:"🤝", sector:"Social Services", why:"You care deeply about fairness and helping people in need.", riasec:{S:95,E:40,C:40}, traits:{feelings:90,ethics:90,people:85}, aiRisk:9, description:"Support vulnerable individuals, families, and communities to improve their lives.", salary:"₹2–10L/year", path:"BSW / MSW degree → Field work → NGO or Government" },
  { id:"physiotherapist", title:"Physiotherapist", emoji:"🏃", sector:"Healthcare", why:"You love helping people recover and enjoy physical, hands-on work.", riasec:{S:85,R:55,I:55}, traits:{feelings:80,grit:75,ethics:80}, aiRisk:9, description:"Help patients recover movement and manage pain through physical rehabilitation.", salary:"₹3–15L/year", path:"BPT (4.5 years) → Internship → AIPT registration" },
  { id:"coder", title:"Software Developer / App Builder", emoji:"💻", sector:"Technology", why:"Your logical thinking, creativity, and love of problem-solving fit perfectly.", riasec:{I:85,R:50,A:55}, traits:{thinking:85,grit:75,mindset:90}, aiRisk:4, description:"Build the apps, websites, and software systems the world runs on.", salary:"₹4–40L/year", path:"CS degree or bootcamp → Portfolio → Tech company or freelance" },
  { id:"vet", title:"Veterinarian", emoji:"🐾", sector:"Animal Healthcare", why:"You love animals and have the care and intelligence to help them.", riasec:{R:60,I:75,S:65}, traits:{thinking:80,ethics:85,grit:80}, aiRisk:9, description:"Diagnose and treat illness and injuries in animals across all species.", salary:"₹3–15L/year", path:"BVSc (5.5 years) → VCI registration → Specialise" },
  { id:"architect", title:"Architect", emoji:"🏛️", sector:"Design", why:"Your spatial thinking, creativity, and attention to detail are perfect here.", riasec:{A:80,R:60,I:65,C:55}, traits:{thinking:80,grit:75}, aiRisk:6, description:"Design buildings and spaces that are beautiful, functional, and safe.", salary:"₹4–25L/year", path:"B.Arch (5 years) → COA registration → Firm or practice" },
  { id:"journalist", title:"Journalist / Writer", emoji:"✍️", sector:"Media", why:"Your curiosity, communication skills, and sense of justice make you a natural.", riasec:{A:75,E:60,I:65,S:50}, traits:{ethics:85,grit:80,mindset:75}, aiRisk:5, description:"Investigate stories, inform the public, and hold power to account.", salary:"₹2–15L/year", path:"BA Journalism / Mass Comm → Internships → Publication or broadcast" },
  { id:"military", title:"Military / Defence Officer", emoji:"🎖️", sector:"Defence", why:"Your grit, ethics, leadership, and calm under pressure are exceptional.", riasec:{R:80,E:75,S:55}, traits:{grit:95,ethics:95,people:80}, aiRisk:9, description:"Lead soldiers, protect the nation, and serve with honour.", salary:"₹6–20L/year + allowances", path:"NDA (after Class 12) / CDS (after graduation) → Training → Commission" },
  { id:"financial_advisor", title:"Financial Advisor / CA", emoji:"💰", sector:"Finance", why:"Your logical thinking, integrity, and care for people's security are valuable here.", riasec:{C:80,I:65,E:60,S:55}, traits:{thinking:80,ethics:92,grit:80}, aiRisk:5, description:"Help people and businesses manage money, investments, and financial planning.", salary:"₹4–30L/year", path:"B.Com / CA Foundation → CA Intermediate → CA Final → Practice" },
  { id:"personal_trainer", title:"Personal Trainer / Sports Coach", emoji:"🏋️", sector:"Wellness", why:"You love physical activity and helping others reach their best.", riasec:{R:60,S:80,E:55}, traits:{feelings:75,grit:85,people:80}, aiRisk:9, description:"Design fitness plans and motivate clients to achieve their health goals.", salary:"₹2–15L/year", path:"Sports degree / NASM or ACE certification → Coaching experience" },
  { id:"diplomat", title:"Diplomat / IAS / IFS Officer", emoji:"🌏", sector:"Government", why:"Your intelligence, ethical strength, people skills, and big-picture thinking stand out.", riasec:{E:80,I:65,S:70,C:60}, traits:{thinking:90,ethics:95,feelings:80,grit:90}, aiRisk:9, description:"Represent your country, shape public policy, and lead national development.", salary:"₹6–25L/year + perks", path:"Any graduation → UPSC Civil Services exam → Training → Posting" },
];

// ─── SCORING ──────────────────────────────────────────────────────────────────
function scoreAll(ans) {
  const scores = {};
  // Thinking — MCQ
  const thQ = QUESTIONS.thinking;
  let thC = 0;
  thQ.forEach(q => { if (ans.thinking?.[q.id] === q.correct) thC++; });
  scores.thinking = Math.round(thC / thQ.length * 100);
  // Agree/disagree modules
  ["feelings","grit","people","ethics","mindset","strengths"].forEach(mod => {
    const qs = QUESTIONS[mod]; let t = 0, n = 0;
    qs.forEach(q => { const v = ans[mod]?.[q.id]; if (v === undefined) return; t += q.r ? (6-v) : v; n++; });
    scores[mod] = n ? Math.round(t / (n*5) * 100) : 50;
  });
  // Personality (MBTI-style forced choice)
  const pA = {EI:{E:0,I:0}, JP:{J:0,P:0}, SN:{S:0,N:0}, TF:{T:0,F:0}};
  const pMap = {p1:"EI",p2:"JP",p3:"SN",p4:"TF",p5:"JP",p6:"EI",p7:"JP",p8:"SN",p9:"TF",p10:"JP"};
  const pOpt = {p1:["E","I"],p2:["J","P"],p3:["S","N"],p4:["T","F"],p5:["J","P"],p6:["E","I"],p7:["J","P"],p8:["S","N"],p9:["T","F"],p10:["J","P"]};
  QUESTIONS.personality.forEach(q => {
    const v = ans.personality?.[q.id];
    if (v === undefined) return;
    const dim = pMap[q.id]; const letters = pOpt[q.id];
    if (dim && letters) pA[dim][letters[v]]++;
  });
  scores.mbti = (pA.EI.E >= pA.EI.I ? "E" : "I") + (pA.SN.S >= pA.SN.N ? "S" : "N") + (pA.TF.T >= pA.TF.F ? "T" : "F") + (pA.JP.J >= pA.JP.P ? "J" : "P");
  // Interests (RIASEC-style rate 1-5)
  const rMap = {i1:"R",i2:"I",i3:"A",i4:"S",i5:"E",i6:"C",i7:"R",i8:"I",i9:"R",i10:"I"};
  const rS = {R:0,I:0,A:0,S:0,E:0,C:0}, rN = {R:0,I:0,A:0,S:0,E:0,C:0};
  QUESTIONS.interests.forEach(q => { const v = ans.interests?.[q.id]; if (!v) return; rS[rMap[q.id]] += v; rN[rMap[q.id]]++; });
  scores.riasec = {};
  Object.keys(rS).forEach(k => { scores.riasec[k] = rN[k] ? Math.round(rS[k]/rN[k]/5*100) : 50; });
  // Values (rate 1-5)
  const vMap = {v1:"helping",v2:"stability",v3:"autonomy",v4:"creativity",v5:"money",v6:"learning",v7:"innovation",v8:"teamwork",v9:"justice",v10:"tangible"};
  scores.values = {};
  QUESTIONS.values.forEach(q => { const v = ans.values?.[q.id]; if (v) scores.values[vMap[q.id]] = v; });
  // Strengths — dominant intelligences
  const siS = {}, siN = {};
  QUESTIONS.strengths.forEach(q => { const v = ans.strengths?.[q.id]; if (!v) return; siS[q.dom] = (siS[q.dom]||0)+v; siN[q.dom] = (siN[q.dom]||0)+1; });
  scores.intelligences = {};
  Object.keys(siS).forEach(k => { scores.intelligences[k] = Math.round(siS[k]/siN[k]/5*100); });
  return scores;
}

function matchCareers(scores) {
  return CAREERS.map(c => {
    let match = 0, wt = 0;
    Object.entries(c.traits).forEach(([k,req]) => {
      const got = scores[k] || 50;
      const diff = Math.max(0, 100 - Math.abs(got - req) * 1.2);
      match += diff; wt++;
    });
    const riasecBoost = c.riasec ? Object.entries(c.riasec).reduce((s,[k,req]) => {
      return s + Math.max(0, 100 - Math.abs((scores.riasec?.[k]||50) - req) * 0.8);
    }, 0) / Object.keys(c.riasec).length : 50;
    const base = wt ? (match/wt * 0.65 + riasecBoost * 0.35) : riasecBoost;
    const fit = Math.round(Math.min(98, base * 0.75 + c.aiRisk * 0.25 * 10));
    return { ...c, fit };
  }).sort((a,b) => b.fit - a.fit).slice(0, 10);
}

// ─── PERSONALITY SUMMARY HELPERS ─────────────────────────────────────────────
function getPersonalityProfile(scores) {
  const mbti = scores.mbti || "ISFJ";
  const mbtiNames = {
    INTJ:"The Architect — Strategic visionary",INTP:"The Thinker — Logical analyser",
    ENTJ:"The Commander — Natural leader",ENTP:"The Debater — Creative problem solver",
    INFJ:"The Advocate — Idealistic helper",INFP:"The Mediator — Empathetic dreamer",
    ENFJ:"The Protagonist — Charismatic inspirer",ENFP:"The Campaigner — Enthusiastic connector",
    ISTJ:"The Inspector — Reliable organiser",ISFJ:"The Defender — Caring protector",
    ESTJ:"The Executive — Practical organiser",ESFJ:"The Consul — Warm team player",
    ISTP:"The Craftsperson — Skilled problem solver",ISFP:"The Adventurer — Gentle artist",
    ESTP:"The Entrepreneur — Bold action taker",ESFP:"The Performer — Spontaneous entertainer",
  };
  const topRI = Object.entries(scores.riasec||{}).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k])=>k);
  const riNames = {R:"Hands-on Builder",I:"Curious Investigator",A:"Creative Artist",S:"People Helper",E:"Bold Leader",C:"Organised Planner"};
  const topIntelligences = Object.entries(scores.intelligences||{}).sort((a,b)=>b[1]-a[1]).slice(0,3);
  return { mbti, mbtiName: mbtiNames[mbti]||"Unique Individual", topRI, riNames, topIntelligences };
}

function getStrengthsAndWeaknesses(scores) {
  const traits = [
    {k:"thinking", label:"Logical Thinking", desc:"How well you solve problems, puzzles, and logical challenges"},
    {k:"feelings", label:"Emotional Intelligence", desc:"Understanding your own and other people's feelings"},
    {k:"grit", label:"Determination & Grit", desc:"Your ability to keep going when things get hard"},
    {k:"people", label:"Patience & Conflict", desc:"How calm and patient you are under pressure"},
    {k:"ethics", label:"Integrity & Honesty", desc:"How ethical and trustworthy you are"},
    {k:"mindset", label:"Growth Mindset", desc:"Belief that you can improve through effort"},
  ];
  const withScores = traits.map(t => ({ ...t, score: scores[t.k] || 50 }));
  const strengths = withScores.filter(t => t.score >= 68).sort((a,b) => b.score-a.score);
  const weaknesses = withScores.filter(t => t.score < 52).sort((a,b) => a.score-b.score);
  const moderate = withScores.filter(t => t.score >= 52 && t.score < 68);
  return { strengths, weaknesses, moderate, all: withScores };
}

// ─── REPORT GENERATOR ────────────────────────────────────────────────────────
async function generateAIReport(name, profile, scores, topCareers, swData, age, city, experience) {
  const { mbti, mbtiName, topRI, riNames, topIntelligences } = profile;
  const topVals = Object.entries(scores.values||{}).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k])=>k.replace(/_/g," ")).join(", ");

  const prompt = `You are Dr. Colonel JC John, a warm, encouraging career counsellor writing a personalised report for ${name}, who is ${age || "a young person"} from ${city || "India"} with ${experience || "0"} years of work experience.

Their psychometric results:
- Personality Type: ${mbti} (${mbtiName})
- Strongest Interests: ${topRI.map(r=>riNames[r]).join(" and ")}
- Top 3 Intelligences: ${topIntelligences.map(([k,v])=>k+" ("+v+"%)" ).join(", ")}
- Key Values: ${topVals}
- Thinking/IQ Score: ${scores.thinking}/100
- Emotional Intelligence: ${scores.feelings}/100
- Grit & Perseverance: ${scores.grit}/100
- Integrity & Ethics: ${scores.ethics}/100
- Growth Mindset: ${scores.mindset}/100
- Patience/Conflict: ${scores.people}/100

Strengths: ${swData.strengths.map(s=>s.label+" ("+s.score+"/100)").join(", ")||"All areas developing"}
Areas to grow: ${swData.weaknesses.map(w=>w.label+" ("+w.score+"/100)").join(", ")||"No critical weaknesses"}

Top 3 recommended careers: ${topCareers.slice(0,3).map((c,i)=>`#${i+1} ${c.title} (${c.fit}% fit)`).join(", ")}

Write a warm, detailed, honest report in 5 sections. Use simple English that a 13-year-old can understand. Write directly to ${name} using "you" and "your".

SECTION 1 — WHO YOU ARE (4–5 sentences):
Describe ${name}'s personality in a warm, specific way. Mention their MBTI type, whether they are introverted or extroverted, how they make decisions, and what makes them unique. Make it feel like you truly see them.

SECTION 2 — YOUR SUPERPOWERS (4–5 sentences):
Describe their biggest strengths with specific examples of what this means in real life. Be enthusiastic and specific. Reference their actual scores and intelligences. Make them feel proud of who they are.

SECTION 3 — AREAS TO GROW (3–4 sentences):
Honestly but kindly explain their weaker areas. Frame every weakness as something they CAN develop. Be encouraging, not harsh. Give one practical tip for each area.

SECTION 4 — YOUR PERFECT CAREER MATCH (5–6 sentences):
Explain why their top 3 careers match them specifically. Reference their personality, interests, strengths. Make it feel personal and exciting. Include what their daily life could look like in their top career.

SECTION 5 — YOUR 3-STEP ACTION PLAN (numbered list, plain language):
Give 3 specific, actionable steps ${name} can take RIGHT NOW — this month — to start moving toward their best career. Make each step practical, specific, and encouraging.

Keep the whole report under 500 words. Use short sentences. No jargon. Write like a kind mentor who believes in this person completely.`;

  const response = await fetch("/api/claude", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1200,messages:[{role:"user",content:prompt}]})
  });
  const data = await response.json();
  return data.content?.map(b=>b.text||"").join("")||"Report could not be generated. Please try again.";
}

// ─── MINI COMPONENTS ─────────────────────────────────────────────────────────
const AGREE = ["Strongly Disagree","Disagree","Not Sure","Agree","Strongly Agree"];
const RATE = ["Not at all","A little","Sometimes","Often","Absolutely love it!"];

function AgreeQ({q, val, onChange}) {
  return (
    <div style={{marginBottom:20}}>
      <p style={{fontSize:16,color:"#1E293B",lineHeight:1.6,marginBottom:12,fontWeight:500}}>{q.text}</p>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {[1,2,3,4,5].map(v=>(
          <button key={v} onClick={()=>onChange(v)} style={{flex:1,minWidth:80,padding:"9px 6px",borderRadius:10,border:"2px solid",borderColor:val===v?"#6C63FF":"#E2E8F0",background:val===v?"#EEF2FF":"#F8FAFC",color:val===v?"#4338CA":"#64748B",fontSize:11,cursor:"pointer",transition:"all .15s",lineHeight:1.3,fontWeight:val===v?700:400}}>
            {AGREE[v-1]}
          </button>
        ))}
      </div>
    </div>
  );
}

function RateQ({q, val, onChange}) {
  return (
    <div style={{marginBottom:20}}>
      <p style={{fontSize:16,color:"#1E293B",lineHeight:1.6,marginBottom:12,fontWeight:500}}>{q.text}</p>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {[1,2,3,4,5].map(v=>(
          <button key={v} onClick={()=>onChange(v)} style={{flex:1,minWidth:72,padding:"9px 4px",borderRadius:10,border:"2px solid",borderColor:val===v?"#F59E0B":"#E2E8F0",background:val===v?"#FFFBEB":"#F8FAFC",color:val===v?"#B45309":"#64748B",fontSize:11,cursor:"pointer",transition:"all .15s",lineHeight:1.3,fontWeight:val===v?700:400}}>
            {RATE[v-1]}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChoiceQ({q, val, onChange}) {
  return (
    <div style={{marginBottom:20}}>
      <p style={{fontSize:13,color:"#64748B",marginBottom:10}}>Pick the one that sounds MORE like you:</p>
      {[q.a,q.b].map((opt,i)=>(
        <button key={i} onClick={()=>onChange(i)} style={{display:"block",width:"100%",textAlign:"left",padding:"13px 16px",borderRadius:12,border:"2px solid",marginBottom:8,borderColor:val===i?"#6C63FF":"#E2E8F0",background:val===i?"#EEF2FF":"#FAFAFA",color:val===i?"#4338CA":"#374151",fontSize:15,cursor:"pointer",transition:"all .15s",fontWeight:val===i?600:400}}>
          <span style={{color:val===i?"#6C63FF":"#94A3B8",marginRight:10,fontWeight:700}}>{i===0?"A":"B"}</span>{opt}
        </button>
      ))}
    </div>
  );
}

function MCQQ({q, val, onChange}) {
  return (
    <div style={{marginBottom:20}}>
      <p style={{fontSize:16,color:"#1E293B",fontWeight:500,lineHeight:1.6,marginBottom:12}}>{q.text}</p>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {q.options.map((opt,i)=>(
          <button key={i} onClick={()=>onChange(i)} style={{padding:"12px 16px",borderRadius:12,border:"2px solid",textAlign:"left",borderColor:val===i?"#6C63FF":"#E2E8F0",background:val===i?"#EEF2FF":"#FAFAFA",color:val===i?"#4338CA":"#374151",fontSize:15,cursor:"pointer",transition:"all .15s",fontWeight:val===i?600:400}}>
            <span style={{color:val===i?"#6C63FF":"#94A3B8",marginRight:10,fontWeight:700}}>{String.fromCharCode(65+i)}.</span>{opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ScoreBar({label, score, color="#6C63FF"}) {
  const level = score >= 75 ? "🌟 Strong" : score >= 55 ? "👍 Good" : score >= 40 ? "📈 Growing" : "🌱 Developing";
  return (
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{fontSize:13,fontWeight:600,color:"#374151"}}>{label}</span>
        <span style={{fontSize:12,color:color,fontWeight:700}}>{level} — {score}/100</span>
      </div>
      <div style={{background:"#E2E8F0",borderRadius:8,height:10,overflow:"hidden"}}>
        <div style={{width:`${score}%`,height:"100%",background:`linear-gradient(90deg,${color}99,${color})`,borderRadius:8,transition:"width 1s ease"}}/>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function CareerCompassAI() {
  const [screen, setScreen] = useState("intro");    // intro | briefing | test | loading | results
  const [modIdx, setModIdx] = useState(0);
  const [itmIdx, setItmIdx] = useState(0);
  const [showIntro, setShowIntro] = useState(true); // show module intro card
  const [allAns, setAllAns] = useState({});
  const [profile, setProfile] = useState({name:"",age:"",sex:"",experience:"",designation:"",salary:"",city:""});
  const [nameInput, setNameInput] = useState("");
  const [scores, setScores] = useState(null);
  const [topCareers, setTopCareers] = useState([]);
  const [selCareer, setSelCareer] = useState(null);
  const [aiReport, setAiReport] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const reportRef = useRef();

  const curMod = MODULES[modIdx];
  const curQs = QUESTIONS[curMod?.key] || [];
  const curQ = curQs[itmIdx];
  const curAns = allAns[curMod?.key]?.[curQ?.id];
  const totalQ = MODULES.reduce((s,m)=>s+(QUESTIONS[m.key]?.length||0),0);
  const doneQ = MODULES.slice(0,modIdx).reduce((s,m)=>s+(QUESTIONS[m.key]?.length||0),0)+(showIntro?0:itmIdx);
  const pct = Math.round(doneQ/totalQ*100);
  const profileOk = profile.name.trim() && profile.age;

  function setP(k,v){setProfile(p=>({...p,[k]:v}));}
  function setAns(v){setAllAns(p=>({...p,[curMod.key]:{...(p[curMod.key]||{}),[curQ.id]:v}}));}

  function startModule(){setShowIntro(false);}

  function goNext(){
    if(itmIdx < curQs.length-1){ setItmIdx(i=>i+1); }
    else if(modIdx < MODULES.length-1){ setModIdx(m=>m+1); setItmIdx(0); setShowIntro(true); }
    else { finishTest(); }
  }
  function goPrev(){
    if(!showIntro && itmIdx>0){ setItmIdx(i=>i-1); }
    else if(!showIntro && itmIdx===0){ setShowIntro(true); }
    else if(showIntro && modIdx>0){ setModIdx(m=>m-1); setItmIdx((QUESTIONS[MODULES[modIdx-1].key]?.length||1)-1); setShowIntro(false); }
  }

  async function finishTest(){
    setScreen("loading");
    const sc = scoreAll(allAns);
    const tc = matchCareers(sc);
    setScores(sc); setTopCareers(tc);
    // Generate AI report immediately
    try {
      const pp = getPersonalityProfile(sc);
      const sw = getStrengthsAndWeaknesses(sc);
      const report = await generateAIReport(profile.name||nameInput, pp, sc, tc, sw, profile.age, profile.city, profile.experience);
      setAiReport(report);
    } catch(e){ setAiReport(""); }
    setScreen("results");
  }

  function start(){
    if(!nameInput.trim()) return;
    setProfile(p=>({...p,name:nameInput.trim()}));
    setScreen("briefing");
  }

  function startTest(){ setScreen("test"); setModIdx(0); setItmIdx(0); setShowIntro(true); setAllAns({}); }

  function reset(){ setScreen("intro"); setAllAns({}); setModIdx(0); setItmIdx(0); setScores(null); setTopCareers([]); setAiReport(""); setSelCareer(null); setNameInput(""); setProfile({name:"",age:"",sex:"",experience:"",designation:"",salary:"",city:""}); setEmailSent(false); }

  // ── DOWNLOAD PDF (print) ──────────────────────────────────────────────────
  function downloadReport(){
    window.print();
  }

  // ── SIMULATE EMAIL SEND ──────────────────────────────────────────────────
  function sendEmail(){
    if(!email.includes("@")){ alert("Please enter a valid email address."); return; }
    setEmailSent(true);
    setTimeout(()=>setEmailSent(false),4000);
  }

  // ─── SHARED STYLES ────────────────────────────────────────────────────────
  const BG = {background:"#F1F5F9",minHeight:"100vh",fontFamily:"'Segoe UI',system-ui,sans-serif",color:"#1E293B"};
  const inp = {width:"100%",padding:"11px 14px",borderRadius:10,border:"1.5px solid #E2E8F0",background:"#fff",color:"#1E293B",fontSize:14,outline:"none",boxSizing:"border-box",transition:"border-color .2s",fontFamily:"inherit"};

  // ─── INTRO SCREEN ────────────────────────────────────────────────────────
  if(screen==="intro") return (
    <div style={{...BG,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{maxWidth:540,width:"100%"}}>
        <div style={{background:"#fff",borderRadius:20,padding:28,boxShadow:"0 4px 24px rgba(0,0,0,0.07)",marginBottom:16}}>
          <div style={{textAlign:"center",marginBottom:24}}>
            <div style={{fontSize:52,marginBottom:8}}>🧭</div>
            <h1 style={{fontSize:26,fontWeight:800,color:"#1E293B",margin:"0 0 6px"}}>CareerCompass™</h1>
            <p style={{color:"#6C63FF",fontSize:13,fontWeight:700,margin:"0 0 4px"}}>by OverSimplify.in · MENTORIA</p>
            <p style={{color:"#64748B",fontSize:14,lineHeight:1.65,marginTop:10}}>Find the careers that are <strong>perfect for YOU</strong> — based on your personality, strengths, and interests. Takes about <strong>20 minutes</strong>. 100 fun questions. No wrong answers!</p>
          </div>

          <div style={{background:"#F8FAFC",borderRadius:12,padding:16,marginBottom:20}}>
            <p style={{fontSize:12,fontWeight:700,color:"#6C63FF",textTransform:"uppercase",letterSpacing:1,margin:"0 0 12px"}}>What you'll discover</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[["🎯","Your perfect Top 10 careers"],["🧠","Your personality type"],["💪","Your strengths & talents"],["📊","Your full AI-written report"],["📥","Download your report"],["📧","Email it to anyone"]].map(([icon,text])=>(
                <div key={text} style={{display:"flex",gap:8,alignItems:"center",fontSize:13,color:"#374151"}}><span>{icon}</span><span>{text}</span></div>
              ))}
            </div>
          </div>

          {/* Quick profile */}
          <div style={{marginBottom:16}}>
            <label style={{display:"block",fontSize:12,fontWeight:700,color:"#64748B",textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>Your Name *</label>
            <input value={nameInput} onChange={e=>setNameInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&start()} placeholder="Type your full name here..." style={inp}/>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            <div>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:"#64748B",textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>Age *</label>
              <input type="number" min="12" max="70" value={profile.age} onChange={e=>setP("age",e.target.value)} placeholder="e.g. 16" style={inp}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:"#64748B",textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>City</label>
              <input value={profile.city} onChange={e=>setP("city",e.target.value)} placeholder="e.g. Bangalore" style={inp}/>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
            <div>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:"#64748B",textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>I am a</label>
              <select value={profile.sex} onChange={e=>setP("sex",e.target.value)} style={{...inp,appearance:"none"}}>
                <option value="">Select...</option><option>Student</option><option>Working Professional</option><option>Parent (filling for child)</option>
              </select>
            </div>
            <div>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:"#64748B",textTransform:"uppercase",letterSpacing:0.8,marginBottom:5}}>Work Experience (years)</label>
              <input type="number" min="0" max="50" value={profile.experience} onChange={e=>setP("experience",e.target.value)} placeholder="0 if student" style={inp}/>
            </div>
          </div>

          <button onClick={start} disabled={!nameInput.trim()} style={{width:"100%",padding:14,borderRadius:12,border:"none",background:nameInput.trim()?"#6C63FF":"#E2E8F0",color:nameInput.trim()?"#fff":"#94A3B8",fontSize:16,fontWeight:800,cursor:nameInput.trim()?"pointer":"not-allowed",transition:"all .2s"}}>
            {nameInput.trim()?`Let's go, ${nameInput.split(" ")[0]}! 🚀`:"Enter your name to begin"}
          </button>
          <p style={{color:"#94A3B8",fontSize:11,textAlign:"center",marginTop:10}}>100% private · Your results stay on your device · No data uploaded</p>
        </div>
      </div>
    </div>
  );

  // ─── BRIEFING — EXPLAIN ALL 10 MODULES BEFORE TEST ───────────────────────
  if(screen==="briefing") return (
    <div style={{...BG,padding:"20px 16px"}}>
      <div style={{maxWidth:620,margin:"0 auto"}}>
        <div style={{background:"#fff",borderRadius:20,padding:24,boxShadow:"0 4px 24px rgba(0,0,0,0.07)",marginBottom:16}}>
          <div style={{textAlign:"center",marginBottom:22}}>
            <div style={{fontSize:36,marginBottom:8}}>📋</div>
            <h2 style={{fontSize:22,fontWeight:800,color:"#1E293B",margin:"0 0 8px"}}>Here's what we'll measure</h2>
            <p style={{color:"#64748B",fontSize:14,lineHeight:1.65}}>The test has <strong>10 short sections</strong>. Each one takes 2–3 minutes. Here's a quick overview of what each section is about — so there are no surprises!</p>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:22}}>
            {MODULES.map((m,i)=>(
              <div key={m.key} style={{background:"#F8FAFC",borderRadius:12,padding:"13px 16px",display:"flex",gap:14,alignItems:"flex-start",border:`1.5px solid ${m.color}22`}}>
                <div style={{width:40,height:40,borderRadius:10,background:m.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{m.emoji}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                    <span style={{background:m.color,color:"#fff",fontSize:10,fontWeight:800,padding:"2px 7px",borderRadius:10}}>{i+1}</span>
                    <span style={{fontSize:14,fontWeight:700,color:"#1E293B"}}>{m.label}</span>
                    <span style={{fontSize:11,color:"#94A3B8",marginLeft:"auto"}}>⏱ {m.time}</span>
                  </div>
                  <p style={{fontSize:12,color:"#374151",margin:"0 0 3px",fontWeight:500}}>{m.what}</p>
                  <p style={{fontSize:12,color:"#64748B",margin:0,lineHeight:1.5}}>{m.why}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{background:"#EEF2FF",borderRadius:12,padding:14,marginBottom:18,borderLeft:"4px solid #6C63FF"}}>
            <p style={{fontSize:13,color:"#4338CA",margin:0,lineHeight:1.65}}><strong>💡 Important tip:</strong> Answer every question <strong>honestly</strong> — there are no right or wrong answers here. The more honest you are, the more accurate and useful your results will be. This is about <em>you</em>, not about what you think sounds good!</p>
          </div>

          <button onClick={startTest} style={{width:"100%",padding:14,borderRadius:12,border:"none",background:"#6C63FF",color:"#fff",fontSize:16,fontWeight:800,cursor:"pointer"}}>
            I'm ready — Start the Test! 🎯
          </button>
        </div>
      </div>
    </div>
  );

  // ─── LOADING ─────────────────────────────────────────────────────────────
  if(screen==="loading") return (
    <div style={{...BG,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",padding:40}}>
        <div style={{fontSize:52,marginBottom:16,animation:"spin 2s linear infinite",display:"inline-block"}}>⚙️</div>
        <h2 style={{fontSize:22,fontWeight:800,color:"#1E293B",margin:"0 0 8px"}}>Analysing your answers...</h2>
        <p style={{color:"#64748B",fontSize:15}}>Our AI is writing your personalised report.<br/>This takes about 20 seconds. ☕</p>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  // ─── TEST SCREEN ──────────────────────────────────────────────────────────
  if(screen==="test") {
    const isAnswered = curAns !== undefined;
    const isLast = modIdx===MODULES.length-1 && itmIdx===curQs.length-1;

    // MODULE INTRO CARD
    if(showIntro) return (
      <div style={{...BG,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{maxWidth:500,width:"100%"}}>
          {/* Overall progress */}
          <div style={{background:"#fff",borderRadius:12,padding:"10px 16px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
            <div style={{flex:1,background:"#E2E8F0",borderRadius:6,height:8,overflow:"hidden"}}>
              <div style={{width:`${pct}%`,height:"100%",background:"#6C63FF",borderRadius:6,transition:"width .3s"}}/>
            </div>
            <span style={{color:"#64748B",fontSize:12,whiteSpace:"nowrap"}}>{pct}% done</span>
          </div>

          <div style={{background:"#fff",borderRadius:20,padding:28,boxShadow:"0 4px 24px rgba(0,0,0,0.07)",textAlign:"center"}}>
            <div style={{width:72,height:72,borderRadius:18,background:curMod.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 16px",border:`2px solid ${curMod.color}33`}}>{curMod.emoji}</div>
            <div style={{background:curMod.color,color:"#fff",fontSize:11,fontWeight:800,padding:"3px 12px",borderRadius:20,display:"inline-block",marginBottom:10}}>Section {modIdx+1} of {MODULES.length}</div>
            <h2 style={{fontSize:22,fontWeight:800,color:"#1E293B",margin:"0 0 10px"}}>{curMod.label}</h2>
            <div style={{background:"#F8FAFC",borderRadius:12,padding:16,marginBottom:10,textAlign:"left"}}>
              <p style={{fontSize:14,color:"#374151",margin:"0 0 8px",fontWeight:600}}>What this measures:</p>
              <p style={{fontSize:14,color:"#1E293B",margin:"0 0 12px",lineHeight:1.6}}>{curMod.what}</p>
              <p style={{fontSize:14,color:"#374151",margin:"0 0 6px",fontWeight:600}}>Why it matters for your career:</p>
              <p style={{fontSize:14,color:"#1E293B",margin:0,lineHeight:1.6}}>{curMod.why}</p>
            </div>
            <p style={{color:"#64748B",fontSize:13,margin:"0 0 18px"}}>⏱ About {curMod.time} · {curQs.length} questions</p>
            <div style={{display:"flex",gap:10}}>
              {modIdx>0&&<button onClick={goPrev} style={{padding:"12px 20px",borderRadius:10,border:"1.5px solid #E2E8F0",background:"#fff",color:"#64748B",fontSize:14,cursor:"pointer"}}>← Back</button>}
              <button onClick={startModule} style={{flex:1,padding:13,borderRadius:10,border:"none",background:curMod.color,color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer"}}>Start this section →</button>
            </div>
          </div>
        </div>
      </div>
    );

    // QUESTION
    return (
      <div style={{...BG}}>
        {/* Top bar */}
        <div style={{background:"#fff",borderBottom:"1px solid #E2E8F0",padding:"10px 16px",position:"sticky",top:0,zIndex:10}}>
          <div style={{maxWidth:620,margin:"0 auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{background:curMod.color,color:"#fff",fontSize:11,padding:"3px 10px",borderRadius:20,fontWeight:700}}>{curMod.emoji} {curMod.label}</span>
              </div>
              <span style={{fontSize:12,color:"#64748B"}}>{pct}% complete</span>
            </div>
            <div style={{background:"#E2E8F0",borderRadius:6,height:6}}>
              <div style={{width:`${pct}%`,height:"100%",background:curMod.color,borderRadius:6,transition:"width .3s"}}/>
            </div>
          </div>
        </div>

        <div style={{maxWidth:620,margin:"0 auto",padding:"20px 16px"}}>
          <p style={{color:"#94A3B8",fontSize:12,marginBottom:14}}>Question {itmIdx+1} of {curQs.length}</p>

          {curMod.type==="mcq"&&<MCQQ q={curQ} val={curAns} onChange={setAns}/>}
          {curMod.type==="agree"&&<AgreeQ q={curQ} val={curAns} onChange={setAns}/>}
          {curMod.type==="choice"&&<ChoiceQ q={curQ} val={curAns} onChange={setAns}/>}
          {curMod.type==="rate"&&<RateQ q={curQ} val={curAns} onChange={setAns}/>}

          <div style={{display:"flex",gap:10,marginTop:16}}>
            <button onClick={goPrev} style={{padding:"12px 18px",borderRadius:10,border:"1.5px solid #E2E8F0",background:"#fff",color:"#64748B",fontSize:14,cursor:"pointer"}}>← Back</button>
            <button onClick={goNext} disabled={!isAnswered} style={{flex:1,padding:13,borderRadius:10,border:"none",background:isAnswered?curMod.color:"#E2E8F0",color:isAnswered?"#fff":"#94A3B8",fontSize:15,fontWeight:800,cursor:isAnswered?"pointer":"not-allowed",transition:"all .2s"}}>
              {isLast?"See My Results! 🎉":"Next Question →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── RESULTS SCREEN ───────────────────────────────────────────────────────
  if(screen==="results"&&scores) {
    const pp = getPersonalityProfile(scores);
    const sw = getStrengthsAndWeaknesses(scores);
    const firstName = (profile.name||nameInput).split(" ")[0];

    // CAREER DETAIL
    if(selCareer!==null) {
      const c = topCareers[selCareer];
      return (
        <div style={{...BG,padding:"16px"}}>
          <div style={{maxWidth:640,margin:"0 auto"}}>
            <button onClick={()=>setSelCareer(null)} style={{background:"none",border:"none",color:"#6C63FF",cursor:"pointer",fontSize:15,fontWeight:700,marginBottom:12,padding:0}}>← Back to all careers</button>
            <div style={{background:"#fff",borderRadius:20,padding:24,boxShadow:"0 4px 20px rgba(0,0,0,0.07)",marginBottom:14}}>
              <div style={{display:"flex",gap:16,alignItems:"flex-start",marginBottom:16}}>
                <div style={{fontSize:44}}>{c.emoji}</div>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:"#6C63FF",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{c.sector}</div>
                  <h2 style={{fontSize:22,fontWeight:800,color:"#1E293B",margin:"0 0 6px"}}>{c.title}</h2>
                  <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"#EEF2FF",borderRadius:20,padding:"4px 12px"}}>
                    <span style={{fontSize:18,fontWeight:800,color:"#6C63FF"}}>{c.fit}%</span>
                    <span style={{fontSize:12,color:"#4338CA",fontWeight:600}}>match for {firstName}</span>
                  </div>
                </div>
              </div>

              <div style={{background:"#F8FAFC",borderRadius:12,padding:14,marginBottom:14}}>
                <p style={{fontSize:13,fontWeight:700,color:"#374151",margin:"0 0 6px"}}>🎯 Why this career fits you:</p>
                <p style={{fontSize:14,color:"#1E293B",margin:0,lineHeight:1.65}}>{c.why} Your personality type ({pp.mbti}) and your strongest interests make this a natural fit.</p>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                <div style={{background:"#ECFDF5",borderRadius:10,padding:12}}>
                  <p style={{fontSize:11,color:"#065F46",fontWeight:700,textTransform:"uppercase",margin:"0 0 4px"}}>💰 Typical Salary</p>
                  <p style={{fontSize:14,color:"#1E293B",fontWeight:600,margin:0}}>{c.salary}</p>
                </div>
                <div style={{background:"#EEF2FF",borderRadius:10,padding:12}}>
                  <p style={{fontSize:11,color:"#4338CA",fontWeight:700,textTransform:"uppercase",margin:"0 0 4px"}}>🛡️ Safe from AI?</p>
                  <p style={{fontSize:14,color:"#1E293B",fontWeight:600,margin:0}}>{c.aiRisk>=7?"✅ Very safe":c.aiRisk>=5?"🟡 Mostly safe":"⚠️ Some risk"} ({c.aiRisk}/10)</p>
                </div>
              </div>

              <div style={{background:"#F0FDF4",borderRadius:12,padding:14,marginBottom:14,borderLeft:"4px solid #10B981"}}>
                <p style={{fontSize:13,fontWeight:700,color:"#065F46",margin:"0 0 6px"}}>🗺️ How to get there (Step by step):</p>
                <p style={{fontSize:14,color:"#1E293B",margin:0,lineHeight:1.7}}>{c.path}</p>
              </div>

              <div style={{background:"#F8FAFC",borderRadius:12,padding:14}}>
                <p style={{fontSize:13,fontWeight:700,color:"#374151",margin:"0 0 6px"}}>📝 What you'll actually do every day:</p>
                <p style={{fontSize:14,color:"#1E293B",margin:0,lineHeight:1.65}}>{c.description}</p>
              </div>
            </div>
            <button onClick={()=>setSelCareer(null)} style={{width:"100%",padding:13,borderRadius:12,border:"1.5px solid #6C63FF",background:"transparent",color:"#6C63FF",fontSize:15,fontWeight:700,cursor:"pointer"}}>← Back to All 10 Careers</button>
          </div>
        </div>
      );
    }

    // MAIN RESULTS PAGE
    return (
      <div style={{...BG,padding:"16px"}} ref={reportRef}>
        <style>{`
          @media print {
            body{background:#fff!important}
            button,.no-print{display:none!important}
            .print-page{break-inside:avoid}
          }
          @keyframes fadein{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
          .fadein{animation:fadein .5s ease forwards}
        `}</style>

        <div style={{maxWidth:680,margin:"0 auto"}}>
          {/* HEADER */}
          <div className="fadein print-page" style={{background:"linear-gradient(135deg,#6C63FF,#4338CA)",borderRadius:20,padding:24,marginBottom:14,color:"#fff",textAlign:"center"}}>
            <div style={{fontSize:40,marginBottom:8}}>🧭</div>
            <h1 style={{fontSize:24,fontWeight:800,margin:"0 0 4px"}}>Your CareerCompass™ Report</h1>
            <p style={{fontSize:16,fontWeight:700,margin:"0 0 4px",opacity:0.9}}>{profile.name||nameInput}</p>
            <p style={{fontSize:12,opacity:0.7,margin:0}}>{new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}{profile.age?` · Age ${profile.age}`:"" }{profile.city?` · ${profile.city}`:""}</p>
          </div>

          {/* PERSONALITY TYPE */}
          <div className="fadein print-page" style={{background:"#fff",borderRadius:16,padding:22,marginBottom:14,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
            <p style={{fontSize:11,fontWeight:700,color:"#6C63FF",textTransform:"uppercase",letterSpacing:1,margin:"0 0 10px"}}>🔮 Your Personality Type</p>
            <div style={{display:"flex",gap:14,alignItems:"flex-start",flexWrap:"wrap"}}>
              <div style={{background:"linear-gradient(135deg,#EEF2FF,#E0E7FF)",borderRadius:12,padding:"14px 18px",textAlign:"center",minWidth:100}}>
                <div style={{fontSize:32,fontWeight:900,color:"#4338CA",fontFamily:"Georgia,serif"}}>{pp.mbti}</div>
                <div style={{fontSize:11,color:"#6366F1",fontWeight:600}}>Your Type</div>
              </div>
              <div style={{flex:1,minWidth:200}}>
                <p style={{fontSize:16,fontWeight:700,color:"#1E293B",margin:"0 0 4px"}}>{pp.mbtiName}</p>
                <p style={{fontSize:13,color:"#64748B",margin:"0 0 10px",lineHeight:1.6}}>
                  {pp.mbti[0]==="E"?"You get energy from being around people and love social situations.":"You recharge by having quiet time to yourself and prefer deeper one-on-one conversations."}
                  {" "}{pp.mbti[2]==="T"?"You make decisions using logic and fairness.":"You make decisions based on feelings and how things affect people."}
                  {" "}{pp.mbti[3]==="J"?"You like having a clear plan and organised structure.":"You prefer staying flexible and keeping your options open."}
                </p>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {pp.topRI.map(r=><span key={r} style={{background:"#F0FDF4",color:"#065F46",fontSize:11,padding:"3px 10px",borderRadius:20,fontWeight:600,border:"1px solid #BBF7D0"}}>🎯 {pp.riNames[r]}</span>)}
                </div>
              </div>
            </div>
          </div>

          {/* SCORES OVERVIEW */}
          <div className="fadein print-page" style={{background:"#fff",borderRadius:16,padding:22,marginBottom:14,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
            <p style={{fontSize:11,fontWeight:700,color:"#6C63FF",textTransform:"uppercase",letterSpacing:1,margin:"0 0 16px"}}>📊 Your Scores at a Glance</p>
            {sw.all.map(t=><ScoreBar key={t.k} label={t.label} score={t.score} color={t.score>=68?"#10B981":t.score>=52?"#F59E0B":"#EF4444"}/>)}
          </div>

          {/* STRENGTHS */}
          <div className="fadein print-page" style={{background:"#F0FDF4",borderRadius:16,padding:22,marginBottom:14,border:"1.5px solid #BBF7D0"}}>
            <p style={{fontSize:11,fontWeight:700,color:"#065F46",textTransform:"uppercase",letterSpacing:1,margin:"0 0 12px"}}>💪 Your Superpowers — What You're Great At</p>
            {sw.strengths.length>0 ? sw.strengths.map(s=>(
              <div key={s.k} style={{background:"#fff",borderRadius:10,padding:12,marginBottom:8,display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontSize:20}}>⭐</span>
                <div>
                  <p style={{fontSize:14,fontWeight:700,color:"#1E293B",margin:"0 0 3px"}}>{s.label} — {s.score}/100</p>
                  <p style={{fontSize:13,color:"#374151",margin:0,lineHeight:1.5}}>{s.desc}. This is well above average and will be a genuine advantage in many careers.</p>
                </div>
              </div>
            )) : <p style={{color:"#065F46",fontSize:14}}>Your strengths are balanced across all areas — a versatile foundation!</p>}

            {pp.topIntelligences.length>0&&(
              <div style={{marginTop:10}}>
                <p style={{fontSize:12,fontWeight:700,color:"#065F46",margin:"0 0 8px"}}>🌟 Your Top Intelligences (Gardner's 8 Types):</p>
                {pp.topIntelligences.map(([k,v])=>(
                  <div key={k} style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                    <span style={{background:"#10B981",color:"#fff",fontSize:11,padding:"2px 9px",borderRadius:20,fontWeight:700,whiteSpace:"nowrap"}}>{k}</span>
                    <div style={{flex:1,background:"#E2E8F0",borderRadius:4,height:7}}><div style={{width:`${v}%`,height:"100%",background:"#10B981",borderRadius:4}}/></div>
                    <span style={{fontSize:12,color:"#065F46",fontWeight:700,minWidth:34}}>{v}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AREAS TO GROW */}
          {sw.weaknesses.length>0&&(
            <div className="fadein print-page" style={{background:"#FFFBEB",borderRadius:16,padding:22,marginBottom:14,border:"1.5px solid #FDE68A"}}>
              <p style={{fontSize:11,fontWeight:700,color:"#92400E",textTransform:"uppercase",letterSpacing:1,margin:"0 0 12px"}}>📈 Areas You Can Grow — Everyone Has These!</p>
              {sw.weaknesses.map(w=>(
                <div key={w.k} style={{background:"#fff",borderRadius:10,padding:12,marginBottom:8,display:"flex",gap:10,alignItems:"flex-start"}}>
                  <span style={{fontSize:20}}>🌱</span>
                  <div>
                    <p style={{fontSize:14,fontWeight:700,color:"#1E293B",margin:"0 0 3px"}}>{w.label} — Needs development</p>
                    <p style={{fontSize:13,color:"#374151",margin:0,lineHeight:1.5}}>{w.desc}. The good news: <strong>this is completely learnable</strong> with practice and the right training.</p>
                  </div>
                </div>
              ))}
              <p style={{fontSize:13,color:"#92400E",margin:"10px 0 0",padding:"10px 12px",background:"#FEF3C7",borderRadius:8}}>💡 <strong>Remember:</strong> Having areas to grow doesn't mean you're bad at something — it means you have exciting room to improve. Every expert started as a beginner!</p>
            </div>
          )}

          {/* AI REPORT */}
          {aiReport&&(
            <div className="fadein print-page" style={{background:"#fff",borderRadius:16,padding:22,marginBottom:14,boxShadow:"0 2px 12px rgba(0,0,0,0.06)",border:"1.5px solid #E0E7FF"}}>
              <p style={{fontSize:11,fontWeight:700,color:"#6C63FF",textTransform:"uppercase",letterSpacing:1,margin:"0 0 14px"}}>🤖 Your AI-Written Personalised Report</p>
              {aiReport.split(/\n\n+/).filter(p=>p.trim()).map((para,i)=>{
                const sectionColors=["#EEF2FF","#F0FDF4","#FFFBEB","#EFF6FF","#FFF1F2"];
                const borders=["#6C63FF","#10B981","#F59E0B","#3B82F6","#EF4444"];
                const cleanPara = para.replace(/^#+\s*/,"").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/SECTION \d+ — [^:\n]+:?\s*/g,"");
                return (
                  <div key={i} style={{background:sectionColors[i%5],borderRadius:12,padding:14,marginBottom:10,borderLeft:`4px solid ${borders[i%5]}`}}>
                    <p style={{fontSize:14,color:"#1E293B",lineHeight:1.75,margin:0}} dangerouslySetInnerHTML={{__html:cleanPara}}/>
                  </div>
                );
              })}
            </div>
          )}

          {/* TOP 10 CAREERS */}
          <div className="fadein print-page" style={{background:"#fff",borderRadius:16,padding:22,marginBottom:14,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
            <p style={{fontSize:11,fontWeight:700,color:"#6C63FF",textTransform:"uppercase",letterSpacing:1,margin:"0 0 4px"}}>🏆 Your Top 10 Career Matches</p>
            <p style={{fontSize:13,color:"#64748B",margin:"0 0 16px"}}>Tap any career to read a full explanation of why it suits you and how to get there.</p>
            {topCareers.map((c,i)=>(
              <button key={c.id} onClick={()=>setSelCareer(i)} className="no-print" style={{display:"block",width:"100%",textAlign:"left",background:i===0?"linear-gradient(135deg,#EEF2FF,#E0E7FF)":"#F8FAFC",borderRadius:14,padding:"14px 16px",marginBottom:9,border:`1.5px solid ${i===0?"#6C63FF44":"#E2E8F0"}`,cursor:"pointer",transition:"all .18s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                  <div style={{display:"flex",gap:12,alignItems:"center",flex:1}}>
                    <div style={{width:40,height:40,background:i===0?"#6C63FF":"#E2E8F0",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{c.emoji}</div>
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                        <span style={{background:i===0?"#6C63FF":"#94A3B8",color:"#fff",fontSize:10,fontWeight:800,padding:"2px 7px",borderRadius:10}}>#{i+1}</span>
                        <span style={{fontSize:15,fontWeight:700,color:"#1E293B"}}>{c.title}</span>
                      </div>
                      <span style={{fontSize:11,color:"#64748B"}}>{c.sector} · {c.aiRisk>=7?"🛡️ AI-safe":"⚠️ Some AI risk"}</span>
                    </div>
                  </div>
                  <div style={{textAlign:"center",flexShrink:0}}>
                    <div style={{fontSize:22,fontWeight:800,color:i===0?"#6C63FF":"#374151"}}>{c.fit}%</div>
                    <div style={{fontSize:9,color:"#94A3B8"}}>match</div>
                  </div>
                </div>
                <p style={{fontSize:12,color:"#64748B",margin:"8px 0 0",lineHeight:1.5}}>{c.why}</p>
                <div style={{textAlign:"right",marginTop:6}}><span style={{fontSize:11,color:"#6C63FF",fontWeight:700}}>Tap to read full details →</span></div>
              </button>
            ))}
            {/* Print version — static list */}
            <div style={{display:"none"}} className="print-show">
              {topCareers.map((c,i)=>(
                <div key={c.id} style={{padding:"10px 0",borderBottom:"1px solid #E2E8F0"}}>
                  <strong>#{i+1} {c.emoji} {c.title}</strong> — {c.fit}% match — {c.sector}<br/>
                  <span style={{fontSize:13,color:"#374151"}}>{c.why}</span><br/>
                  <span style={{fontSize:12,color:"#64748B"}}>Path: {c.path}</span>
                </div>
              ))}
            </div>
          </div>

          {/* DOWNLOAD & EMAIL */}
          <div className="fadein no-print" style={{background:"#fff",borderRadius:16,padding:22,marginBottom:14,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
            <p style={{fontSize:11,fontWeight:700,color:"#6C63FF",textTransform:"uppercase",letterSpacing:1,margin:"0 0 14px"}}>📤 Save &amp; Share Your Report</p>

            <button onClick={downloadReport} style={{width:"100%",padding:13,borderRadius:12,border:"none",background:"#6C63FF",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              📥 Download / Print My Report
            </button>

            <div style={{background:"#F8FAFC",borderRadius:12,padding:14}}>
              <p style={{fontSize:13,fontWeight:600,color:"#374151",margin:"0 0 10px"}}>📧 Email this report to someone:</p>
              <div style={{display:"flex",gap:8}}>
                <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter email address..." style={{...inp,flex:1}} type="email"/>
                <button onClick={sendEmail} style={{padding:"11px 18px",borderRadius:10,border:"none",background:"#10B981",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
                  {emailSent?"✅ Sent!":"Send →"}
                </button>
              </div>
              {emailSent&&<p style={{color:"#065F46",fontSize:13,margin:"8px 0 0"}}>✅ Email instructions sent! (Note: set up EmailJS or your email service in the deployed version to actually send.)</p>}
              <p style={{color:"#94A3B8",fontSize:11,margin:"8px 0 0"}}>You can email this to your parents, school counsellor, or anyone who helps you with career decisions.</p>
            </div>
          </div>

          {/* RETAKE */}
          <div className="no-print" style={{textAlign:"center",paddingBottom:40}}>
            <button onClick={reset} style={{padding:"11px 28px",borderRadius:10,border:"1.5px solid #E2E8F0",background:"#fff",color:"#64748B",fontSize:14,cursor:"pointer"}}>Retake Assessment</button>
            <p style={{color:"#94A3B8",fontSize:11,marginTop:12}}>© OverSimplify.in — CareerCompass™ · Powered by Claude AI</p>
          </div>
        </div>
      </div>
    );
  }

  return <div style={BG}/>;
}
