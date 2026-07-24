import { useState, useRef } from "react";

// SSBCompass™ — Indian Defence Officer Selection Readiness Assessment
// by Professor Dr John Chenetra · Colonel's MENTORIA
// REDESIGNED: Every question has 5 behavioural sentences (no Likert scales)
// Full terminology: "Officer Like Qualities" never abbreviated to OLQ
// Module briefing before each stage · Detailed improvement plans in report

const OLQ_LIST = {
  effective_intelligence:  { label:"Effective Intelligence",           factor:1 },
  reasoning_ability:       { label:"Reasoning Ability",               factor:1 },
  organising_ability:      { label:"Organising Ability",              factor:1 },
  power_of_expression:     { label:"Power of Expression",             factor:1 },
  social_adaptability:     { label:"Social Adaptability",             factor:2 },
  cooperation:             { label:"Co-operation",                    factor:2 },
  sense_of_responsibility: { label:"Sense of Responsibility",         factor:2 },
  initiative:              { label:"Initiative",                      factor:3 },
  self_confidence:         { label:"Self Confidence",                 factor:3 },
  speed_of_decision:       { label:"Speed of Decision",               factor:3 },
  ability_to_influence:    { label:"Ability to Influence the Group",  factor:3 },
  liveliness:              { label:"Liveliness",                      factor:3 },
  determination:           { label:"Determination",                   factor:4 },
  courage:                 { label:"Courage",                         factor:4 },
  stamina:                 { label:"Stamina",                         factor:4 },
};

const FACTORS = {
  1:{ label:"Factor I — Planning and Organising",    color:"#1E3A8A", light:"#EFF6FF", keys:["effective_intelligence","reasoning_ability","organising_ability","power_of_expression"] },
  2:{ label:"Factor II — Social Adjustment",         color:"#065F46", light:"#ECFDF5", keys:["social_adaptability","cooperation","sense_of_responsibility"] },
  3:{ label:"Factor III — Social Effectiveness",     color:"#7C2D12", light:"#FFF7ED", keys:["initiative","self_confidence","speed_of_decision","ability_to_influence","liveliness"] },
  4:{ label:"Factor IV — Dynamic Qualities",         color:"#581C87", light:"#F5F3FF", keys:["determination","courage","stamina"] },
};

const STAGES = [
  { key:"s1", label:"Officer Intelligence Test",            emoji:"🧠", color:"#1E3A8A", light:"#EFF6FF",
    what:"This stage measures how quickly and accurately you think — your verbal reasoning, number skills, and logical thinking.",
    why:"Every officer must reason clearly under pressure. The SSB uses Officer Intelligence Rating as a critical first filter. This stage mirrors that test.",
    tip:"Work fast and trust your instincts. Do not spend more than 40 seconds on any one question. Your first answer is usually correct — commit to it." },
  { key:"s2", label:"Situation Reaction Test",              emoji:"⚡", color:"#7C2D12", light:"#FFF7ED",
    what:"Real situations are described. Five different people react five different ways. Choose the response that most accurately reflects what YOU would naturally do.",
    why:"This is the most important stage. It reveals your Officer Like Qualities in action — your Initiative, Courage, Sense of Responsibility, and Speed of Decision — without any way to prepare a 'correct' answer.",
    tip:"Choose your FIRST natural reaction immediately. The moment you start calculating what sounds impressive, you move away from truth. Authentic responses are what trained assessors detect." },
  { key:"s3", label:"Word Association Test",                emoji:"💬", color:"#065F46", light:"#ECFDF5",
    what:"A word appears. Five people respond to it differently. Choose which person's reaction most closely matches your own first, instinctive response.",
    why:"This reveals your subconscious personality — how you truly think about leadership, duty, failure, and challenge when you are not overthinking it.",
    tip:"Your very FIRST reaction is the most honest and the most useful. Go with it immediately. Spending more than five seconds means you are analysing rather than responding naturally." },
  { key:"s4", label:"Group and Planning Test",              emoji:"📋", color:"#1E3A8A", light:"#EFF6FF",
    what:"Group challenges and planning situations are described. Five people handle them differently. Choose which approach most closely matches how you would naturally respond.",
    why:"Officers must organise people and resources efficiently under pressure. This stage measures your Organising Ability, Co-operation, and Ability to Influence the Group.",
    tip:"Think about what an effective officer — not a perfect officer — would actually do. The best responses balance task completion with team cohesion and clear communication." },
  { key:"s5", label:"Self Description Test",               emoji:"🪞", color:"#581C87", light:"#F5F3FF",
    what:"Five descriptions of a person are given. Choose the one that most accurately describes how you genuinely are — not how you wish you were.",
    why:"This assesses your self-awareness and emotional maturity. Assessors look for honest self-appraisal. Candidates who rate themselves perfectly on every quality are immediately flagged.",
    tip:"Choose the description your closest friends and family would agree describes you. Complete honesty here produces the most useful development report." },
  { key:"s6", label:"Courage, Determination and Stamina",  emoji:"💪", color:"#7C2D12", light:"#FFF7ED",
    what:"Demanding, high-pressure situations are described. Five people face each one differently. Choose the response that most honestly reflects how you would respond.",
    why:"The Dynamic Qualities — Determination, Courage, and Stamina — ultimately determine whether a candidate is recommended. These qualities cannot be faked under genuine pressure.",
    tip:"Be completely honest. These qualities can all be developed — but only if your assessment is accurate. An inflated response gives you a misleading report that cannot help you." },
  { key:"s7", label:"Social Effectiveness Test",           emoji:"🎯", color:"#065F46", light:"#ECFDF5",
    what:"Social situations involving influence, motivation, and teamwork are described. Choose which of the five responses best reflects your natural behaviour.",
    why:"Officers spend the majority of their time leading and influencing people. Your Initiative, Self Confidence, and Liveliness determine how effectively you lead in practice.",
    tip:"Think about your actual behaviour in real group situations — not in ideal conditions, but in difficult, ambiguous, and high-pressure ones where you have to think on your feet." },
  { key:"s8", label:"Responsibility and Ethics Test",      emoji:"🛡️", color:"#1E3A8A", light:"#EFF6FF",
    what:"Ethical dilemmas and accountability situations are described. Five people make five different choices. Choose which choice most closely reflects what you would genuinely do.",
    why:"An officer holds soldiers' lives and the nation's honour in their hands. Sense of Responsibility and integrity under pressure are the most non-negotiable Officer Like Qualities.",
    tip:"The Armed Forces value honesty above impressiveness. The response that reflects your real character — not a movie hero — is the one that produces a genuinely useful assessment." },
  { key:"s9", label:"Adaptability and Resilience Test",   emoji:"🌊", color:"#581C87", light:"#F5F3FF",
    what:"Unexpected, changing, and high-stress situations are described. Five people adapt differently. Choose how you would most naturally respond.",
    why:"Officers face constant uncertainty, changing plans, and sustained physical and mental exhaustion. Social Adaptability and Stamina in these moments define your officer potential.",
    tip:"There is no perfectly resilient person who handles everything flawlessly. Choose the response that honestly reflects your current self — this assessment exists to help you grow." },
];

const QUESTIONS = {
s1:[
  { id:"q01", text:"A patrol of 24 soldiers splits into 4 equal groups. Two groups complete the mission and return. How many soldiers returned?",
    opts:["6 soldiers returned safely","8 soldiers returned safely","12 soldiers returned safely","16 soldiers returned safely","18 soldiers returned safely"],
    correct:2, olq:"effective_intelligence" },
  { id:"q02", text:"OFFICER is to COMMAND as SOLDIER is to ___:",
    opts:["Weapon","Rank","Obey","Courage","March"],
    correct:2, olq:"reasoning_ability" },
  { id:"q03", text:"Which number completes the series? 4, 8, 16, 32, ___",
    opts:["48","56","64","72","80"],
    correct:2, olq:"reasoning_ability" },
  { id:"q04", text:"If all brave people serve the nation, and Capt. Mehta serves the nation — what can we conclude?",
    opts:["Capt. Mehta is definitely brave","Capt. Mehta is an officer","Capt. Mehta serves willingly","We cannot conclude Capt. Mehta is brave","Capt. Mehta is a hero"],
    correct:3, olq:"reasoning_ability" },
  { id:"q05", text:"A convoy covers 120 km at 60 km/h, then 60 km at 30 km/h. Total journey time?",
    opts:["2 hours","3 hours","4 hours","5 hours","6 hours"],
    correct:1, olq:"effective_intelligence" },
  { id:"q06", text:"Which word is most OPPOSITE to VALOUR?",
    opts:["Strength","Bravery","Honour","Cowardice","Duty"],
    correct:3, olq:"reasoning_ability" },
  { id:"q07", text:"A field task needs 3 steps: briefing (10 min), preparation (25 min), execution (15 min). Minimum time needed?",
    opts:["40 minutes","45 minutes","50 minutes","55 minutes","60 minutes"],
    correct:2, olq:"organising_ability" },
  { id:"q08", text:"In a group of 40 candidates, 25 passed written, 20 passed physical, 10 passed both. How many passed neither?",
    opts:["3","5","7","10","15"],
    correct:1, olq:"reasoning_ability" },
  { id:"q09", text:"RETREAT is the code for ADVANCE. DEFEND is the code for ___:",
    opts:["PROTECT","ATTACK","SHIELD","GUARD","HOLD"],
    correct:1, olq:"effective_intelligence" },
  { id:"q10", text:"Complete the pattern: Square, Circle, Triangle, Square, Circle, ___",
    opts:["Square","Circle","Triangle","Pentagon","Hexagon"],
    correct:2, olq:"reasoning_ability" },
  { id:"q11", text:"A platoon has 30 soldiers. Each section needs 6 soldiers. How many complete sections?",
    opts:["3","4","5","6","7"],
    correct:2, olq:"effective_intelligence" },
  { id:"q12", text:"Rearrange the letters D-R-A-G-E-U-O-C to form a quality every officer needs:",
    opts:["COURAGE","GURDACE","COURADE","GRACOUDE","COURGED"],
    correct:0, olq:"effective_intelligence" },
],
s2:[
  { id:"q13", text:"Your group cannot agree on a plan and time is running out. No one is leading. You would most likely:",
    opts:["Wait for the most experienced person to take charge — they know best","Express your frustration loudly so the group feels the urgency","Step forward, propose a clear approach, assign roles, and begin immediately","Suggest the group vote on the best approach so everyone feels included","Focus on your own assigned task and let others handle the overall direction"],
    w:[
      {social_adaptability:3,cooperation:3},
      {self_confidence:2,speed_of_decision:2},
      {initiative:5,organising_ability:5,speed_of_decision:5,ability_to_influence:5,self_confidence:4},
      {cooperation:4,social_adaptability:4,effective_intelligence:3},
      {determination:3,cooperation:2}] },
  { id:"q14", text:"A senior officer gives an order you believe is tactically wrong and could risk lives. You would:",
    opts:["Follow the order without question — rank must always be respected","Refuse to carry out an order you believe is wrong","Quietly carry out the order but complain to peers afterward","Respectfully raise your specific concern before executing, then follow the final decision","Ask peers what they think before deciding how to respond"],
    w:[
      {sense_of_responsibility:3,cooperation:4},
      {courage:3,self_confidence:3,sense_of_responsibility:1},
      {cooperation:1,sense_of_responsibility:1},
      {courage:5,power_of_expression:5,sense_of_responsibility:5,self_confidence:4,reasoning_ability:4},
      {social_adaptability:3,cooperation:3,self_confidence:2}] },
  { id:"q15", text:"Two team members have a serious conflict affecting everyone's performance. As group leader you would:",
    opts:["Tell them firmly to set aside personal issues — the mission comes first","Separate them and assign tasks where they do not interact","Ignore it and hope it resolves — interpersonal issues are not a leader's job","Speak to each privately, understand both sides, then bring them together to resolve it","Report to a higher authority and let them handle it"],
    w:[
      {ability_to_influence:3,determination:3,sense_of_responsibility:3},
      {organising_ability:4,effective_intelligence:3},
      {initiative:1,sense_of_responsibility:1},
      {ability_to_influence:5,social_adaptability:5,cooperation:5,initiative:5,effective_intelligence:4},
      {sense_of_responsibility:3,cooperation:3}] },
  { id:"q16", text:"After an exhausting 20 km night march, your commander asks for a volunteer for a difficult extra mission. You would:",
    opts:["Stay silent — you are physically depleted and not at your best right now","Volunteer only if no one else steps forward","Volunteer immediately without hesitation — duty comes before personal comfort","Volunteer but ask for 30 minutes to rest first","Encourage a fresher colleague to volunteer — it is the right thing to do"],
    w:[
      {stamina:1,courage:2,determination:2},
      {cooperation:3,stamina:3,self_confidence:3},
      {stamina:5,courage:5,determination:5,sense_of_responsibility:5,initiative:5},
      {reasoning_ability:4,stamina:3,sense_of_responsibility:3},
      {cooperation:4,social_adaptability:3,sense_of_responsibility:3}] },
  { id:"q17", text:"You discover a friend has cheated in a written test. You would:",
    opts:["Ignore it — loyalty to a friend matters more than rules","Confront your friend and urge them strongly to confess themselves","Report it to authorities immediately without warning your friend","Wait and see if it is discovered, then decide how to respond","Tell your friend you cannot cover for them and will report it if they do not confess"],
    w:[
      {sense_of_responsibility:1,courage:1},
      {courage:4,power_of_expression:5,sense_of_responsibility:4,self_confidence:4},
      {sense_of_responsibility:5,courage:5,determination:4},
      {sense_of_responsibility:1,courage:1,self_confidence:2},
      {courage:5,sense_of_responsibility:5,power_of_expression:4,self_confidence:5}] },
  { id:"q18", text:"Your patrol is lost in jungle at night. Morale is low and soldiers are beginning to panic. You would:",
    opts:["Sit down honestly, admit you are lost, and ask the group for suggestions","Tell the soldiers firmly to control themselves — panic is not acceptable","Personally take charge: calm the group, assess position, assign tasks, and begin moving","Radio for help and wait in position for rescue to arrive","Let the most experienced soldier navigate — they are better suited to jungle terrain"],
    w:[
      {social_adaptability:4,cooperation:4,effective_intelligence:3},
      {ability_to_influence:3,determination:3},
      {initiative:5,organising_ability:5,ability_to_influence:5,stamina:5,effective_intelligence:5,liveliness:4},
      {sense_of_responsibility:4,speed_of_decision:3},
      {social_adaptability:3,cooperation:3,self_confidence:2}] },
  { id:"q19", text:"During a group discussion a candidate presents clearly wrong information with great confidence and others are accepting it. You would:",
    opts:["Let it pass — group harmony matters more than factual accuracy","Wait until after the session and correct it privately","Agree with them to avoid conflict and keep the session moving","Politely but firmly present the correct information with clear reasoning in front of the group","Ask a question that leads the group to realise the error themselves"],
    w:[
      {cooperation:2,courage:1,self_confidence:1},
      {social_adaptability:3,cooperation:3,self_confidence:2},
      {cooperation:1,self_confidence:1,courage:1},
      {courage:5,self_confidence:5,power_of_expression:5,reasoning_ability:5,initiative:4},
      {effective_intelligence:5,ability_to_influence:5,reasoning_ability:4,self_confidence:4}] },
  { id:"q20", text:"A junior soldier under your supervision makes an error that harms team performance. Your senior asks what happened. You would:",
    opts:["Explain exactly what happened including the soldier's error with complete honesty","Take full personal responsibility — protecting junior soldiers is an officer's duty","Downplay the error to protect the soldier and avoid attention","Explain your own actions but say it is not appropriate to speak for the soldier","Explain what happened, take responsibility for better supervision, and outline prevention steps"],
    w:[
      {sense_of_responsibility:4,power_of_expression:4,courage:4,reasoning_ability:4},
      {sense_of_responsibility:4,courage:4,cooperation:5},
      {sense_of_responsibility:1,courage:1},
      {reasoning_ability:4,sense_of_responsibility:3,power_of_expression:4},
      {sense_of_responsibility:5,courage:5,power_of_expression:5,effective_intelligence:5,reasoning_ability:5}] },
  { id:"q21", text:"Your team suffers a significant failure and morale is extremely low. As leader you would:",
    opts:["Give everyone time to process what happened before pushing forward","Immediately hold a structured debrief: acknowledge failure, identify lessons, set the next goal","Project extreme confidence and positivity even if you personally feel low","Speak to each member individually then bring the team back together","Focus entirely on the next task — the best remedy for failure is immediate action"],
    w:[
      {social_adaptability:3,cooperation:3},
      {effective_intelligence:5,ability_to_influence:5,organising_ability:5,initiative:5,determination:5},
      {ability_to_influence:4,liveliness:5,self_confidence:4,stamina:4},
      {social_adaptability:5,cooperation:5,ability_to_influence:4,sense_of_responsibility:4},
      {determination:4,stamina:4,initiative:4}] },
  { id:"q22", text:"During a physical group task one team member is significantly slower causing the team to fall behind. You would:",
    opts:["Ask the slower member to step aside — let stronger members complete the task","Slow the entire team to match their pace — no one gets left behind","Reorganise the task so the slower member handles a role that uses their actual strengths","Encourage and coach them intensively while the team continues at pace","Complete the task and address the member's development afterward"],
    w:[
      {effective_intelligence:2,cooperation:2},
      {cooperation:3,social_adaptability:3},
      {organising_ability:5,effective_intelligence:5,cooperation:5,ability_to_influence:4,initiative:5},
      {social_adaptability:4,cooperation:4,ability_to_influence:4,liveliness:4},
      {determination:4,reasoning_ability:4,sense_of_responsibility:4}] },
],
s3:[
  { id:"q23", text:"The word LEADERSHIP appears. Which person's reaction most closely matches your own first response?",
    opts:["Person A thinks: Leadership means being in charge and making sure people follow my direction","Person B thinks: Leadership means earning the complete trust of the people you lead","Person C feels a strong sense of responsibility and imagines guiding a team through genuine difficulty","Person D thinks about the recognition and status that come with leadership","Person E feels slightly anxious — they do not yet feel fully ready to lead others"],
    w:[
      {ability_to_influence:3,self_confidence:3},
      {ability_to_influence:5,cooperation:5,sense_of_responsibility:5,self_confidence:4},
      {sense_of_responsibility:5,ability_to_influence:4,determination:4,initiative:4},
      {self_confidence:2,ability_to_influence:2},
      {self_confidence:2,initiative:2}] },
  { id:"q24", text:"The word FAILURE appears. Which person's reaction most closely matches your own first instinct?",
    opts:["Person A feels embarrassed and wants to avoid talking about what happened","Person B immediately starts analysing what went wrong so it does not happen again","Person C feels a surge of determination — failure makes them want to try much harder","Person D looks at the circumstances and wonders what else contributed to the failure","Person E accepts the outcome calmly and moves forward without excessive emotion"],
    w:[
      {self_confidence:2,determination:2},
      {reasoning_ability:5,effective_intelligence:5,self_confidence:4,determination:4},
      {determination:5,stamina:5,self_confidence:5,courage:4},
      {sense_of_responsibility:1,self_confidence:1},
      {self_confidence:4,determination:4,social_adaptability:4}] },
  { id:"q25", text:"The word DANGER appears. Which person's reaction most accurately reflects yours?",
    opts:["Person A feels fear and looks immediately for a way to reduce personal risk","Person B quickly assesses the situation and considers available options before acting","Person C feels alert and focused — their instinct is to protect others first","Person D freezes momentarily until they can fully process what is happening","Person E feels controlled energy and acts almost immediately without overthinking"],
    w:[
      {courage:2,stamina:2},
      {reasoning_ability:5,effective_intelligence:5,speed_of_decision:4},
      {courage:5,sense_of_responsibility:5,initiative:5,stamina:4},
      {speed_of_decision:2,self_confidence:2},
      {courage:5,speed_of_decision:5,initiative:5,stamina:5,liveliness:4}] },
  { id:"q26", text:"The word SACRIFICE appears. Which person's response matches yours most closely?",
    opts:["Person A thinks sacrifice means giving up too much — balance in life is important","Person B feels a deep sense of duty and sees sacrifice as the highest expression of service","Person C thinks carefully about the personal cost of any sacrifice before committing","Person D sees sacrifice as something that should be expected of others more than themselves","Person E feels genuinely inspired by the very idea of sacrificing for a cause greater than themselves"],
    w:[
      {social_adaptability:3,reasoning_ability:3},
      {sense_of_responsibility:5,determination:5,courage:5,stamina:4},
      {reasoning_ability:4,self_confidence:3},
      {sense_of_responsibility:1,courage:1},
      {determination:5,courage:5,stamina:5,sense_of_responsibility:4}] },
  { id:"q27", text:"The word DISCIPLINE appears. Which response most closely matches your own immediate reaction?",
    opts:["Person A sees it as an external constraint imposed by people in authority","Person B sees it as the absolute foundation of all high performance and excellence","Person C connects it to self-control — the ability to perform consistently under any conditions","Person D associates discipline primarily with consequences for breaking rules","Person E sees it as what separates serious professionals from everyone else"],
    w:[
      {sense_of_responsibility:2,social_adaptability:2},
      {determination:5,stamina:5,sense_of_responsibility:5,effective_intelligence:4},
      {stamina:5,determination:5,self_confidence:5},
      {sense_of_responsibility:2,social_adaptability:2},
      {determination:4,stamina:4,effective_intelligence:4,self_confidence:4}] },
  { id:"q28", text:"The word MISTAKE appears. Which person's reaction most closely matches your own first feeling?",
    opts:["Person A feels embarrassed and tries to limit how much others know about it","Person B acknowledges it immediately, takes full responsibility, corrects it, and moves on","Person C carefully analyses whether to acknowledge it before making any statement","Person D focuses on understanding exactly why it happened so it never recurs","Person E uses it as clear evidence that they need to work harder in a specific area"],
    w:[
      {self_confidence:2,sense_of_responsibility:2},
      {self_confidence:5,sense_of_responsibility:5,speed_of_decision:5,courage:4},
      {reasoning_ability:4,self_confidence:3},
      {reasoning_ability:5,effective_intelligence:5,self_confidence:4},
      {determination:5,self_confidence:4,stamina:4}] },
  { id:"q29", text:"The word NATION appears. Which person's first feeling most closely matches yours?",
    opts:["Person A thinks of its many problems — poverty, inequality, corruption","Person B feels a quiet but deep sense of personal duty and desire to contribute","Person C feels genuine pride connected to the country's history and achievements","Person D feels a strong personal calling — the nation's wellbeing is their personal responsibility","Person E feels inspired and wants to be an active part of making it better"],
    w:[
      {effective_intelligence:3,reasoning_ability:3},
      {sense_of_responsibility:5,determination:4,stamina:4},
      {self_confidence:4,liveliness:4},
      {sense_of_responsibility:5,courage:5,determination:5,stamina:5},
      {initiative:5,self_confidence:4,liveliness:5,determination:4}] },
  { id:"q30", text:"The word CHALLENGE appears. Which person's reaction most closely matches your own?",
    opts:["Person A feels cautious and wants to assess all risks carefully before committing","Person B feels genuinely excited — a challenge is an opportunity to show what they can do","Person C prepares thoroughly and methodically before facing any challenge head-on","Person D looks for the right team — challenges are always better handled with good people","Person E embraces it immediately — the bigger the challenge the more motivated they become"],
    w:[
      {reasoning_ability:3,self_confidence:3},
      {self_confidence:5,courage:5,initiative:5,liveliness:4},
      {organising_ability:5,reasoning_ability:5,effective_intelligence:4},
      {social_adaptability:4,cooperation:5,effective_intelligence:4},
      {courage:5,determination:5,stamina:5,liveliness:5,initiative:4}] },
],
s4:[
  { id:"q31", text:"Your group has 30 minutes to plan a complex task with limited resources. Which approach matches yours most closely?",
    opts:["Person A immediately allocates tasks based on each person's observed strengths","Person B spends 10 minutes ensuring everyone fully understands the mission before planning","Person C develops a detailed plan independently then presents it to the group for approval","Person D facilitates a structured group discussion, synthesises the best ideas, and builds a shared plan","Person E focuses first on identifying and managing the biggest risks in the plan"],
    w:[
      {organising_ability:4,initiative:4,ability_to_influence:4},
      {effective_intelligence:5,organising_ability:5,power_of_expression:4,sense_of_responsibility:4},
      {organising_ability:4,self_confidence:4,reasoning_ability:4},
      {organising_ability:5,cooperation:5,ability_to_influence:5,effective_intelligence:5,power_of_expression:5},
      {reasoning_ability:5,effective_intelligence:5,organising_ability:4}] },
  { id:"q32", text:"Your team is given a task with deliberately vague and incomplete instructions. Most of the group is confused. You would:",
    opts:["Wait for clarification from the assessor before attempting anything","Make reasonable assumptions, state them clearly to the group, and begin working","Identify only the most critical missing information and seek just that clarification","Interpret the vagueness as intentional and work confidently with what has been given","Feel uncomfortable with ambiguity and struggle to begin until the picture is clearer"],
    w:[
      {speed_of_decision:2,initiative:2},
      {initiative:5,self_confidence:5,speed_of_decision:5,power_of_expression:5,organising_ability:4},
      {reasoning_ability:5,effective_intelligence:5,speed_of_decision:4,initiative:4},
      {effective_intelligence:4,reasoning_ability:4,self_confidence:4},
      {speed_of_decision:2,self_confidence:2,social_adaptability:2}] },
  { id:"q33", text:"You are the group leader. One vocal member keeps dominating the conversation and blocking others. You would:",
    opts:["Ignore it — if their ideas are good, dominance matters less than the outcome","Privately ask the dominant member to give others more space","Firmly but respectfully acknowledge their contribution and actively invite quieter members to speak","Restructure the discussion so every member has a timed opportunity to contribute","Allow the group dynamic to self-correct — intervening too early undermines natural leadership"],
    w:[
      {effective_intelligence:3,determination:3},
      {social_adaptability:3,cooperation:3,power_of_expression:3},
      {ability_to_influence:5,cooperation:5,power_of_expression:5,social_adaptability:4,initiative:4},
      {organising_ability:5,cooperation:5,effective_intelligence:4,initiative:4},
      {reasoning_ability:3,social_adaptability:3}] },
  { id:"q34", text:"Your group is behind schedule and plan quality is also suffering. You cannot fix both simultaneously. You would:",
    opts:["Focus entirely on the deadline — a mediocre plan on time beats a great plan submitted late","Focus entirely on quality — a flawed plan executed will fail regardless of timing","Quickly identify which plan elements are critical and concentrate full effort there","Communicate the dilemma to the group and collectively decide the priority together","Request a deadline extension — better late than poor quality"],
    w:[
      {speed_of_decision:3,determination:3},
      {reasoning_ability:4,effective_intelligence:3},
      {effective_intelligence:5,reasoning_ability:5,organising_ability:5,speed_of_decision:5},
      {cooperation:4,power_of_expression:4,social_adaptability:4},
      {reasoning_ability:3,sense_of_responsibility:3}] },
  { id:"q35", text:"Your group has a plan you know has weaknesses. The assessors seem satisfied with it. You would:",
    opts:["Present it confidently — the assessors are satisfied and that is the outcome that matters","Present the plan but proactively flag its weaknesses and offer specific mitigation steps","Add elements during presentation to cover the weaknesses without drawing attention to them","Present normally and not mention the weaknesses unless directly asked","Present the plan fully including your honest assessment of its limitations and what would improve it"],
    w:[
      {self_confidence:3,power_of_expression:3},
      {courage:5,sense_of_responsibility:5,power_of_expression:5,self_confidence:4,reasoning_ability:4},
      {reasoning_ability:4,self_confidence:4,effective_intelligence:4},
      {social_adaptability:3,self_confidence:3},
      {courage:5,sense_of_responsibility:5,power_of_expression:5,reasoning_ability:5,self_confidence:5}] },
  { id:"q36", text:"A new group member joins mid-task from a very different background and struggles to understand the team's communication. You would:",
    opts:["Continue the task — the timeline cannot be disrupted for one person's adjustment","Assign a specific team member to bring the new person up to speed quickly","Personally pause, welcome them, explain what has happened so far, and give them an immediate role","Adapt the team's communication style so the new member can integrate faster","Let the new member observe first and contribute when they feel ready"],
    w:[
      {determination:3,stamina:3},
      {organising_ability:4,initiative:4,cooperation:4},
      {social_adaptability:5,cooperation:5,ability_to_influence:4,initiative:5,liveliness:4},
      {social_adaptability:5,cooperation:5,effective_intelligence:4,power_of_expression:4},
      {social_adaptability:3,cooperation:3}] },
],
s5:[
  { id:"q37", text:"Which description most accurately captures how you genuinely are in group situations?",
    opts:["I usually wait for others to take charge — I am more effective when I know my assigned role","I naturally step forward when no one is leading, even without being asked or appointed","I lead when I have to but genuinely prefer not to be responsible for everyone","I am equally comfortable leading or following — I adapt completely to what the group needs","I find it difficult to assert leadership when others seem more experienced or confident than me"],
    w:[
      {social_adaptability:3,cooperation:4},
      {initiative:5,self_confidence:5,ability_to_influence:5,sense_of_responsibility:4},
      {social_adaptability:4,determination:3,self_confidence:3},
      {social_adaptability:5,cooperation:5,self_confidence:4,initiative:4},
      {self_confidence:2,initiative:2}] },
  { id:"q38", text:"When you are under extreme physical or mental pressure, which person most accurately describes you?",
    opts:["Person A maintains full performance — pressure actually makes me sharper and more focused","Person B performs well but notices quality drops slightly under very high sustained pressure","Person C struggles when pressure is severe and needs others to help maintain focus","Person D finds their performance highly inconsistent — sometimes excellent, sometimes poor","Person E performs best when they have time to prepare fully for high-pressure situations"],
    w:[
      {stamina:5,determination:5,self_confidence:5,liveliness:4},
      {stamina:4,determination:4,self_confidence:4},
      {stamina:2,determination:2,self_confidence:3},
      {stamina:3,determination:3},
      {organising_ability:4,stamina:3,reasoning_ability:4}] },
  { id:"q39", text:"When you make a significant mistake that affects others, which description most accurately captures your genuine response?",
    opts:["I acknowledge it immediately, take full responsibility, correct what I can, and prevent recurrence","I acknowledge it but feel so bad that it negatively affects my subsequent performance","I tend to downplay or minimise the mistake to avoid being judged harshly","I acknowledge it to those directly affected but do not broadcast it unnecessarily","I analyse the mistake thoroughly before acknowledging it publicly — I want to fully understand it first"],
    w:[
      {sense_of_responsibility:5,courage:5,self_confidence:5,speed_of_decision:4},
      {sense_of_responsibility:4,self_confidence:3,stamina:2},
      {sense_of_responsibility:1,courage:1,self_confidence:2},
      {sense_of_responsibility:4,reasoning_ability:4,social_adaptability:4},
      {reasoning_ability:5,effective_intelligence:4,sense_of_responsibility:4}] },
  { id:"q40", text:"How would your closest friends most honestly describe your level of reliability and follow-through?",
    opts:["They would say I always deliver on what I promise — my word is completely reliable","They would say I usually deliver but sometimes drop the ball when I am overwhelmed","They would say I am enthusiastic at the start but sometimes lose momentum on long commitments","They would say my reliability depends significantly on how much I care about the specific commitment","They would say I often commit to more than I can actually manage and struggle with follow-through"],
    w:[
      {sense_of_responsibility:5,determination:5,stamina:4,cooperation:4},
      {sense_of_responsibility:4,determination:4,stamina:3},
      {determination:3,stamina:3,liveliness:3},
      {sense_of_responsibility:3,determination:3},
      {sense_of_responsibility:1,determination:2,stamina:2}] },
  { id:"q41", text:"When facing a very long, demanding task with no clear end in sight, which person most honestly describes you?",
    opts:["Person A maintains consistent effort and focus from beginning to end — genuine endurance is a strength","Person B starts strong, has a dip in the middle, but recovers and finishes well","Person C is most effective in intense short bursts — prolonged endurance is a genuine weakness","Person D manages long tasks well when able to set their own pace and breaks","Person E finds that motivation and performance decline significantly after extended effort"],
    w:[
      {stamina:5,determination:5,self_confidence:4},
      {stamina:4,determination:4,liveliness:3},
      {stamina:2,determination:3,self_confidence:3},
      {stamina:3,determination:3,social_adaptability:3},
      {stamina:1,determination:2}] },
  { id:"q42", text:"When you strongly disagree with a decision made by someone in authority, which description most accurately reflects your behaviour?",
    opts:["I comply but register my concern clearly through the proper channel after executing","I comply without raising my concern — challenging authority creates unnecessary friction","I push back firmly until I either change the decision or receive a satisfactory explanation","I comply but feel genuinely resentful if I believe the decision was wrong","I assess whether the issue is significant enough to challenge — I pick my battles deliberately"],
    w:[
      {courage:5,sense_of_responsibility:5,power_of_expression:5,cooperation:4,self_confidence:4},
      {cooperation:3,social_adaptability:3,self_confidence:2},
      {courage:4,self_confidence:4,power_of_expression:4},
      {social_adaptability:2,self_confidence:2,sense_of_responsibility:2},
      {reasoning_ability:5,effective_intelligence:4,self_confidence:4,courage:3}] },
],
s6:[
  { id:"q43", text:"You work toward an important goal for months and suffer a major setback that destroys most of your progress. Your genuine response:",
    opts:["Person A feels devastated but begins rebuilding within days — failure is a setback, not an ending","Person B takes significant time to recover emotionally before finding motivation to restart","Person C reassesses whether the goal is still worth pursuing — major setbacks reveal important information","Person D feels genuine anger and channels it into a stronger renewed commitment to succeed","Person E seriously considers giving up — repeated major setbacks may be a signal the path is wrong"],
    w:[
      {determination:5,stamina:5,self_confidence:5,courage:4},
      {determination:3,stamina:3,self_confidence:3},
      {reasoning_ability:4,effective_intelligence:4,determination:3},
      {determination:4,stamina:4,courage:4,liveliness:3},
      {determination:1,stamina:1,self_confidence:2}] },
  { id:"q44", text:"You must make a highly unpopular decision you know is correct. Many people around you are openly opposed. You would:",
    opts:["Make the decision, explain the reasoning clearly, and stand by it firmly despite all opposition","Make the decision but are deeply affected by the disapproval and begin second-guessing yourself","Delay the decision while trying to bring more people on board first","Modify the decision slightly to reduce opposition while maintaining its essential core intent","Avoid making the decision alone — seek consensus first before committing to any position"],
    w:[
      {courage:5,self_confidence:5,determination:5,power_of_expression:4,ability_to_influence:4},
      {courage:3,self_confidence:2,determination:3},
      {social_adaptability:3,cooperation:3,self_confidence:2},
      {reasoning_ability:4,social_adaptability:4,self_confidence:3},
      {social_adaptability:4,cooperation:4,self_confidence:2,speed_of_decision:2}] },
  { id:"q45", text:"During a physically exhausting test that seems to have no end, how do you respond internally?",
    opts:["I do not focus on how far remains — I focus only on the step I am taking right now","I mentally calculate how much remains and push through on pure willpower and discipline","I tell myself it will end eventually and use that thought to keep going","I push hard for as long as I can but genuinely struggle significantly toward the end","I find it very difficult to maintain effort when I cannot see the end and tend to slow down"],
    w:[
      {stamina:5,determination:5,self_confidence:5},
      {stamina:5,determination:4,self_confidence:4,reasoning_ability:3},
      {stamina:3,determination:3},
      {stamina:3,determination:3,courage:3},
      {stamina:1,determination:2,self_confidence:2}] },
  { id:"q46", text:"You witness something clearly wrong happening in front of you. Speaking up carries genuine personal risk. Which person are you?",
    opts:["Person A speaks up immediately and clearly without waiting or calculating the personal cost","Person B wants to speak up but hesitates and carefully weighs the personal risk first","Person C speaks up through appropriate formal channels rather than confronting it directly","Person D documents what happened but does not confront it publicly at that time","Person E stays silent — getting involved in situations not directly their responsibility creates problems"],
    w:[
      {courage:5,sense_of_responsibility:5,initiative:5,self_confidence:5,power_of_expression:4},
      {courage:3,sense_of_responsibility:3,self_confidence:3},
      {courage:4,sense_of_responsibility:5,reasoning_ability:4,power_of_expression:4},
      {sense_of_responsibility:3,reasoning_ability:3},
      {courage:1,sense_of_responsibility:1,initiative:1}] },
  { id:"q47", text:"You have a clear personal value. A situation arises where violating it would bring significant personal benefit. You would:",
    opts:["Not consider it at all — some lines simply do not get crossed regardless of the benefit","Feel genuine temptation but would ultimately maintain the principle after reflection","Think carefully about whether this specific situation justifies making an exception","Probably compromise the principle — rigid principles are impractical in the real world","Do what benefits you most — principles must be flexible in complex real-life situations"],
    w:[
      {courage:5,sense_of_responsibility:5,determination:5,self_confidence:4},
      {courage:4,sense_of_responsibility:4,determination:4},
      {reasoning_ability:4,self_confidence:3},
      {sense_of_responsibility:2,courage:2},
      {sense_of_responsibility:1,courage:1,self_confidence:1}] },
  { id:"q48", text:"In the final stretch of an extremely demanding physical challenge, your body signals you to stop but the objective is not yet achieved. You:",
    opts:["Go past the signal — you have trained your mind to override your body when the mission requires it","Push as hard as you genuinely can, giving everything, though not always certain you fully succeed","Reach a point of genuine physical inability rather than a choice — you give everything until you truly cannot","Stop when you reach a level you consider dangerous to your health — the goal is not worth injury","Struggle to distinguish between genuine physical inability and mental reluctance to continue"],
    w:[
      {stamina:5,determination:5,courage:5,self_confidence:4},
      {stamina:4,determination:4,courage:4},
      {stamina:4,determination:5,courage:4,sense_of_responsibility:3},
      {reasoning_ability:4,sense_of_responsibility:3,stamina:3},
      {stamina:2,determination:3,self_confidence:2}] },
],
s7:[
  { id:"q49", text:"You have a genuinely good idea that could benefit the group but you are the most junior person present. You would:",
    opts:["Share it immediately and directly — good ideas have no rank","Wait for the right moment then present it clearly and confidently","Mention it tentatively — not certain it will be well-received by seniors","Share it privately with someone senior and let that person raise it in the group","Keep it to yourself — the junior person's role is to listen and learn"],
    w:[
      {initiative:5,self_confidence:5,power_of_expression:4,courage:4},
      {initiative:4,self_confidence:4,power_of_expression:5,reasoning_ability:4},
      {self_confidence:3,power_of_expression:3,initiative:3},
      {social_adaptability:3,cooperation:3,self_confidence:2},
      {self_confidence:2,initiative:1}] },
  { id:"q50", text:"You need to convince a group of sceptical people to adopt your approach. You would:",
    opts:["Use your position or authority to direct the group — persuasion takes too much time","Present clear facts and evidence and allow the group to reach the logical conclusion themselves","Build rapport with the key influencers in the group first then use them to bring others along","Acknowledge the group's concerns directly and address each one with specific clear reasoning","Energise the group with genuine enthusiasm and the strength of your personal belief in the idea"],
    w:[
      {ability_to_influence:3,self_confidence:3},
      {ability_to_influence:4,reasoning_ability:5,power_of_expression:4,effective_intelligence:4},
      {ability_to_influence:5,social_adaptability:5,cooperation:5,effective_intelligence:4},
      {ability_to_influence:5,power_of_expression:5,reasoning_ability:5,self_confidence:4},
      {ability_to_influence:4,liveliness:5,self_confidence:4,initiative:4}] },
  { id:"q51", text:"A team member is visibly demoralised and their poor performance is affecting the group. No one has addressed it. You would:",
    opts:["Address it privately and directly — speak to the member personally and honestly","Raise it with the group leader and suggest they address it","Wait to see if the member recovers on their own before intervening","Reorganise tasks so the member's poor performance has less impact on the group","Acknowledge the member publicly in front of the group to make them feel genuinely valued"],
    w:[
      {social_adaptability:5,cooperation:5,ability_to_influence:4,initiative:5,liveliness:4},
      {cooperation:3,sense_of_responsibility:3},
      {social_adaptability:3,cooperation:3},
      {organising_ability:4,effective_intelligence:4,cooperation:4},
      {ability_to_influence:4,liveliness:5,social_adaptability:4}] },
  { id:"q52", text:"Your team's morale is low and performance is suffering. You are not the designated leader. You would:",
    opts:["Take informal charge — begin motivating people and organising activity without being formally asked","Speak to the designated leader privately and suggest what you think should be done","Focus on your own performance and attitude hoping it has a positive effect on those around you","Raise the morale issue openly in the group so everyone can discuss it together","Wait for the designated leader to address it — it is not your role to interfere uninvited"],
    w:[
      {initiative:5,ability_to_influence:5,liveliness:5,self_confidence:4,determination:4},
      {cooperation:4,power_of_expression:4,sense_of_responsibility:3},
      {self_confidence:3,liveliness:3,determination:3},
      {cooperation:4,social_adaptability:4,power_of_expression:4},
      {social_adaptability:2,cooperation:2}] },
  { id:"q53", text:"You are representing your team before senior assessors and are asked a question you do not know the answer to. You would:",
    opts:["Say confidently and clearly: I do not know the answer but I will find out immediately","Attempt to answer based on partial knowledge hoping it is close enough","Redirect: Could you give me more context on exactly what you need to know?","Become visibly flustered — not knowing the answer affects your confidence significantly","Give a vague general answer that does not directly address the specific question asked"],
    w:[
      {courage:5,self_confidence:5,power_of_expression:5,sense_of_responsibility:4},
      {self_confidence:3,power_of_expression:3},
      {self_confidence:4,power_of_expression:4,reasoning_ability:4,effective_intelligence:4},
      {self_confidence:1,power_of_expression:2},
      {self_confidence:2,power_of_expression:2}] },
  { id:"q54", text:"How do people around you typically respond to your presence in a group? Which description is most honest?",
    opts:["People naturally look to me for input and direction — I tend to attract influence and attention","People see me as a reliable, trustworthy contributor — not necessarily a natural leader","People see me as technically competent but not particularly influential in group dynamics","My impact varies significantly depending on how comfortable and engaged I personally feel","I typically have less group influence than I would like — I find it difficult to make my voice heard"],
    w:[
      {ability_to_influence:5,self_confidence:5,liveliness:4,initiative:4},
      {cooperation:4,sense_of_responsibility:4,social_adaptability:4},
      {effective_intelligence:4,reasoning_ability:4,self_confidence:3},
      {social_adaptability:3,self_confidence:3,liveliness:2},
      {ability_to_influence:2,self_confidence:2,power_of_expression:2}] },
],
s8:[
  { id:"q55", text:"Your team fails an important task and you are the leader. Your senior officer asks what went wrong. You would:",
    opts:["Explain exactly what happened, take full personal accountability as leader, and present a corrective plan","Explain what happened but distribute responsibility fairly among all contributing factors","Explain what happened but emphasise the external factors that made success genuinely difficult","Ask the team to collectively explain what went wrong rather than speaking alone for the group","Keep the explanation brief and redirect the conversation forward to the next task"],
    w:[
      {sense_of_responsibility:5,courage:5,power_of_expression:5,self_confidence:4,determination:4},
      {sense_of_responsibility:4,reasoning_ability:4,power_of_expression:4},
      {sense_of_responsibility:2,self_confidence:2},
      {cooperation:4,social_adaptability:4,power_of_expression:3},
      {determination:3,speed_of_decision:3,self_confidence:3}] },
  { id:"q56", text:"You have access to confidential information. A close friend asks for details they do not have clearance to access. You would:",
    opts:["Decline clearly and explain why — duty and trust override personal relationships completely","Share a small amount — surely a little information is harmless in this specific context","Ask a superior whether sharing this particular information with this person is acceptable","Decline but do not explain why — you do not want to make the friendship awkward","Find it very difficult to refuse a close friend and are genuinely worried about the friendship"],
    w:[
      {sense_of_responsibility:5,courage:5,power_of_expression:4,self_confidence:4},
      {sense_of_responsibility:1,courage:1},
      {sense_of_responsibility:4,reasoning_ability:4,cooperation:3},
      {sense_of_responsibility:4,social_adaptability:3},
      {sense_of_responsibility:2,courage:2,self_confidence:2}] },
  { id:"q57", text:"You notice a senior colleague consistently taking shortcuts that compromise team work quality though without breaking rules. You would:",
    opts:["Raise it directly with the colleague in private — clearly and respectfully","Raise it with the senior colleague's own supervisor through the appropriate channel","Say nothing — it is a senior colleague's prerogative to manage their own working methods","Mention it to peers but not to anyone in authority — creating formal issues is not worthwhile","Document what you observe carefully so you have a clear record if it becomes a larger problem"],
    w:[
      {courage:5,power_of_expression:5,sense_of_responsibility:5,initiative:4,self_confidence:4},
      {sense_of_responsibility:4,courage:4,reasoning_ability:4},
      {sense_of_responsibility:2,courage:1},
      {sense_of_responsibility:2,cooperation:2,courage:1},
      {reasoning_ability:4,sense_of_responsibility:3}] },
  { id:"q58", text:"You have made a commitment to your team. Circumstances change making honouring it inconvenient for you personally. You would:",
    opts:["Honour the commitment regardless of personal inconvenience — reliability is never selective","Explain the changed circumstances to the team and renegotiate the commitment together","Usually honour commitments but this particular situation is genuinely exceptional","Adjust commitments when personal circumstances change significantly — flexibility is realistic","Treat commitments as intentions rather than obligations — people understand when things change"],
    w:[
      {sense_of_responsibility:5,determination:5,stamina:4,cooperation:4},
      {sense_of_responsibility:4,power_of_expression:4,cooperation:4,social_adaptability:3},
      {sense_of_responsibility:3,determination:3},
      {sense_of_responsibility:2,determination:2},
      {sense_of_responsibility:1,determination:1}] },
  { id:"q59", text:"You are asked to evaluate a colleague fairly for a promotion. They are a personal friend. Which person are you?",
    opts:["Person A evaluates them exactly as any other colleague — friendship has no place in professional assessment","Person B evaluates fairly but checks their own assessment twice knowing personal bias may be operating","Person C removes themselves from the evaluation — the friendship makes objective assessment impossible","Person D gives them a slightly favourable assessment — personal knowledge of the person is professionally relevant","Person E is genuinely unable to separate personal feelings from their professional assessment"],
    w:[
      {sense_of_responsibility:5,courage:5,self_confidence:4,reasoning_ability:4},
      {sense_of_responsibility:5,reasoning_ability:5,effective_intelligence:4,self_confidence:4},
      {sense_of_responsibility:4,courage:3,reasoning_ability:4},
      {sense_of_responsibility:2,courage:2},
      {sense_of_responsibility:1,self_confidence:2}] },
  { id:"q60", text:"You observe that the way a task was assigned is genuinely unfair to one team member. No one else has noticed or said anything. You would:",
    opts:["Raise it immediately — fairness in the team is the direct responsibility of every leader","Speak privately to the affected person and ask if they want to raise it formally themselves","Observe a little longer to see if the situation corrects itself before intervening","Decide it is not your place to intervene in how tasks are assigned by others","Note the unfairness but stay quiet — raising it will be seen as unnecessary troublemaking"],
    w:[
      {courage:5,sense_of_responsibility:5,initiative:5,ability_to_influence:4,power_of_expression:4},
      {social_adaptability:4,cooperation:4,sense_of_responsibility:4,power_of_expression:3},
      {reasoning_ability:3,social_adaptability:3},
      {social_adaptability:2,sense_of_responsibility:2},
      {courage:1,sense_of_responsibility:1,initiative:1}] },
],
s9:[
  { id:"q61", text:"You have prepared thoroughly for a presentation. Five minutes before, you are told the topic has completely changed. You would:",
    opts:["Quickly structure your thinking on the new topic and present with whatever you have — imperfectly but confidently","Ask for a brief extension — a poor presentation reflects badly on you and your team","Politely request to keep the original topic — you have done thorough preparation for it","Present what you know and openly acknowledge you were not prepared for this specific topic","Become very anxious and perform significantly worse because of the disruption"],
    w:[
      {social_adaptability:5,speed_of_decision:5,self_confidence:5,stamina:4,liveliness:4},
      {reasoning_ability:3,self_confidence:3},
      {self_confidence:3,power_of_expression:3},
      {courage:4,power_of_expression:4,self_confidence:3,social_adaptability:3},
      {social_adaptability:1,self_confidence:2,stamina:2}] },
  { id:"q62", text:"Three significant unexpected problems arise simultaneously while you are executing a well-planned task. You would:",
    opts:["Prioritise the problems rapidly, address the most critical first, and begin executing immediately","Take a moment to breathe, fully reassess the situation, and then act decisively","Feel overwhelmed momentarily but recover and begin tackling the problems systematically","Call the team together immediately — three simultaneous problems require collective input","Become disorganised — simultaneous unexpected problems significantly impair your effectiveness"],
    w:[
      {speed_of_decision:5,initiative:5,effective_intelligence:5,organising_ability:4,stamina:4},
      {effective_intelligence:5,reasoning_ability:5,speed_of_decision:4,self_confidence:4},
      {stamina:3,determination:3,self_confidence:3},
      {cooperation:4,organising_ability:4,social_adaptability:4,effective_intelligence:3},
      {speed_of_decision:1,effective_intelligence:2,self_confidence:2}] },
  { id:"q63", text:"Your planned approach to an important goal is clearly not working. Changing course means abandoning significant effort and investment. You would:",
    opts:["Change course decisively when evidence is clear — past investment should not drive future strategy","Give the current approach a little more time and effort before considering any change","Try to modify the existing approach rather than abandoning it — partial adaptation first","Find it very difficult to change course once you have invested heavily in something","Continue the original approach — consistency and persistence will eventually succeed"],
    w:[
      {reasoning_ability:5,effective_intelligence:5,self_confidence:4,speed_of_decision:4},
      {determination:3,reasoning_ability:3,stamina:3},
      {reasoning_ability:4,effective_intelligence:4,determination:3},
      {determination:3,stamina:3,self_confidence:2},
      {determination:3,stamina:3}] },
  { id:"q64", text:"You receive harsh, critical feedback about your performance from a superior — some of which you believe is inaccurate. You would:",
    opts:["Listen fully, accept what is valid, and respectfully but clearly respond to what you believe is inaccurate","Accept all feedback without comment — questioning a superior's assessment is counterproductive","Accept it externally but privately dismiss the parts you believe are unfair or wrong","Become genuinely defensive — harsh feedback triggers a strong emotional reaction in you","Accept the feedback completely and feel discouraged for a significant period afterward"],
    w:[
      {self_confidence:5,courage:5,power_of_expression:5,social_adaptability:4,reasoning_ability:4},
      {cooperation:3,social_adaptability:3,sense_of_responsibility:3},
      {self_confidence:3,social_adaptability:2},
      {self_confidence:2,social_adaptability:2,stamina:2},
      {self_confidence:1,stamina:2,determination:2}] },
  { id:"q65", text:"You must make a critical decision with incomplete information and very little time. You would:",
    opts:["Decide quickly based on available information — delay is the worst option under time pressure","Take the minimum time needed to gather the single most critical missing fact, then decide","Make the decision but communicate clearly that it is based on incomplete information","Find that time pressure and incomplete information together genuinely impair your decision quality","Tend to delay deciding — the cost of a wrong decision exceeds the cost of the delay"],
    w:[
      {speed_of_decision:5,initiative:5,self_confidence:5,courage:4},
      {speed_of_decision:4,reasoning_ability:5,effective_intelligence:5,self_confidence:4},
      {speed_of_decision:4,power_of_expression:4,sense_of_responsibility:4,self_confidence:4},
      {speed_of_decision:2,self_confidence:2,stamina:2},
      {speed_of_decision:1,self_confidence:2,initiative:2}] },
  { id:"q66", text:"You have been placed in a role significantly below what you believe your abilities and potential justify. You would:",
    opts:["Perform in the current role at the absolute highest level — excellence wherever you are placed","Perform well but formally communicate your interest in opportunities that match your potential","Perform adequately but feel visibly frustrated — underutilisation affects your motivation clearly","Find it genuinely demotivating and your performance reflects this quite openly","Focus primarily on seeking a way out of the current role rather than excelling in it"],
    w:[
      {determination:5,sense_of_responsibility:5,stamina:4,self_confidence:4,liveliness:4},
      {determination:4,self_confidence:4,power_of_expression:4,sense_of_responsibility:4},
      {determination:3,self_confidence:3,stamina:2},
      {stamina:2,determination:2,self_confidence:2},
      {determination:2,sense_of_responsibility:2}] },
],
};

// ─── SCORING ENGINE ───────────────────────────────────────────────
function scoreAll(allAns) {
  const raw = {}, cnt = {};
  Object.keys(OLQ_LIST).forEach(k => { raw[k]=0; cnt[k]=0; });

  // Stage 1: intelligence — MCQ
  (QUESTIONS.s1||[]).forEach(q => {
    const v = (allAns.s1||{})[q.id];
    if(v===undefined) return;
    const sc = v===q.correct ? 5 : 1;
    if(raw[q.olq]!==undefined){ raw[q.olq]+=sc*2; cnt[q.olq]+=2; }
  });

  // All scenario stages
  ["s2","s3","s4","s5","s6","s7","s8","s9"].forEach(stage => {
    (QUESTIONS[stage]||[]).forEach(q => {
      const v = (allAns[stage]||{})[q.id];
      if(v===undefined) return;
      const weights = q.w[v]||{};
      Object.entries(weights).forEach(([k,val])=>{
        if(raw[k]!==undefined){ raw[k]+=val; cnt[k]++; }
      });
    });
  });

  const olqScores = {};
  Object.keys(OLQ_LIST).forEach(k => {
    const max = cnt[k]*5;
    olqScores[k] = max>0 ? Math.round(Math.min(98,(raw[k]/max)*100)) : 50;
  });

  const factorScores = {};
  Object.entries(FACTORS).forEach(([fNum,fDef]) => {
    const avg = fDef.keys.reduce((s,k)=>s+(olqScores[k]||50),0)/fDef.keys.length;
    factorScores[fNum] = Math.round(avg);
  });

  const overall = Math.round(Object.values(olqScores).reduce((s,v)=>s+v,0)/Object.keys(olqScores).length);
  return { olqScores, factorScores, overall };
}

function classify(overall) {
  if(overall>=78) return { grade:"A", label:"Highly Recommended",                    color:"#065F46", bg:"#ECFDF5", border:"#BBF7D0" };
  if(overall>=65) return { grade:"B", label:"Recommended with Focused Preparation",  color:"#1E3A8A", bg:"#EFF6FF", border:"#BFDBFE" };
  if(overall>=52) return { grade:"C", label:"Average — Significant Work Required",   color:"#92400E", bg:"#FFFBEB", border:"#FDE68A" };
  return              { grade:"D", label:"Early Stage — Long-Term Preparation",    color:"#7C2D12", bg:"#FEF2F2", border:"#FECACA" };
}

const IMPROVEMENT_PLANS = {
  effective_intelligence:[
    "Practise 10 logical and verbal reasoning questions every single day, strictly timed at 45 seconds per question. Speed with accuracy is what the Officer Intelligence Rating test measures — build both simultaneously.",
    "Read two newspaper editorials daily and write a 3-sentence summary of the core argument after each. This trains the most important skill in Effective Intelligence: extracting what actually matters from complex information quickly.",
    "Join a debate group, quiz team, or any activity that forces you to think and respond on your feet. Effective Intelligence is built through repeated exposure to novel problems under time pressure — not through revision alone."
  ],
  reasoning_ability:[
    "Complete one full set of SSB Officer Intelligence Rating verbal and non-verbal reasoning practice papers daily. Study the structure of syllogisms and logical arguments so you understand how errors in reasoning occur.",
    "Practise the OODA Loop — Observe, Orient, Decide, Act — on every problem you face. Write down your reasoning for important decisions so you can review it critically and strengthen your logical thinking over time.",
    "Read case studies of military operations and analyse the commander's reasoning at each decision point. You will find that effective military reasoning follows a clear logical structure even in chaotic and fast-moving conditions."
  ],
  organising_ability:[
    "Plan every single day the night before using a written schedule that includes time, task, resources needed, and person responsible. Do this consistently for 30 days — it will build organising as a natural habit rather than a conscious effort.",
    "Take personal ownership of organising one team activity, event, or project from beginning to end. Real organising ability requires managing competing priorities, limited resources, and unpredictable people — not just making a list.",
    "Practise backwards planning — start from the final objective and work backwards to identify every step, resource, and person needed to get there. This is the core planning methodology used throughout the Indian Armed Forces."
  ],
  power_of_expression:[
    "Speak for exactly two minutes on a completely random topic every single day — with zero preparation. Record yourself and watch it back immediately. You will see your specific weaknesses: hesitation, filler words, circular reasoning, poor structure.",
    "Join Toastmasters, a debate club, or any group that requires regular public speaking. Practise giving SSB-style lecturettes on current affairs topics for three minutes without notes, at least three times per week.",
    "Read great speeches aloud and study how effective communicators build their arguments: main point, supporting reasoning, concrete example, clear summary. Apply this four-part structure to every spoken contribution you make in group settings."
  ],
  social_adaptability:[
    "Deliberately place yourself in one completely new social environment every week where you know no one at all. The goal is not to feel comfortable immediately — it is to function effectively despite the discomfort.",
    "Travel independently to a new location where you must navigate, communicate with strangers, and solve unexpected problems without your usual support system. Nothing builds adaptability faster than genuine independent challenge.",
    "Join a club or group entirely outside your current social circle — a different sport, hobby, or community. Practise adapting your communication style to completely different types of people: formal to informal, technical to non-technical, senior to junior."
  ],
  cooperation:[
    "For the next 30 days, volunteer for team roles rather than solo tasks in every possible context. Practise active listening — genuinely not planning your response while someone else is still speaking. This single habit transforms group dynamics.",
    "Make a conscious effort in every group discussion to publicly credit others' contributions before presenting your own view. Notice how this simple behaviour immediately changes how the group responds to and trusts you.",
    "Take on a formal team leadership role for one significant project where your success depends entirely on the performance of other people. True co-operation — putting collective success above personal recognition — can only be built through doing it."
  ],
  sense_of_responsibility:[
    "For 30 consecutive days, make one specific commitment per day and track rigorously whether you honour it completely. Examine every instance where you fall short — not to feel guilty but to identify the exact pattern of your unreliability.",
    "Practise the language of responsibility in every situation where something goes wrong: 'I committed to X. It did not happen. Here is exactly what I should have done differently.' Rehearse this formula until it becomes your automatic first response.",
    "Voluntarily take accountability for collective failures even when other factors clearly contributed. This is the single behaviour that most distinguishes officers from followers in the Indian Armed Forces. It builds trust faster than any other action you can take."
  ],
  initiative:[
    "For 30 consecutive days, identify one situation per day where action was clearly needed and no one was acting — and then act immediately without waiting for permission or instruction. You are training the fundamental officer instinct of moving first.",
    "Study case studies of military leaders at every level who acted decisively without waiting for perfect conditions or clear orders. The consistent pattern you will find is not exceptional bravery — it is the cultivated habit of not waiting when action is needed.",
    "Practise asking yourself 'what needs to happen right now?' as a deliberate question in every situation you encounter. The officer who consistently identifies what is needed and acts on it — without being asked — is the one who earns both recommendation and command."
  ],
  self_confidence:[
    "Complete one physically and mentally demanding challenge every week — something you are genuinely not certain you can do. Self-confidence grows from doing difficult things repeatedly, not from thinking positive thoughts about yourself.",
    "Keep a specific daily record of three things you did well — concrete, behavioural, observable things. This is not vanity. It is training your mind to accurately register your own capability rather than automatically defaulting to self-doubt under pressure.",
    "Eliminate apologetic, tentative, and hedging language from your communication entirely: 'I think maybe', 'I am not sure but', 'Sorry to bother you with this.' Replace every hedge immediately with a direct, clear, declarative statement. Record yourself speaking until this becomes natural."
  ],
  speed_of_decision:[
    "Practise the 10-Second Rule: give yourself a maximum of 10 seconds to commit to a decision in every practice scenario and in as many real situations as possible. The goal is not to make perfect decisions — it is to make sound decisions quickly.",
    "Complete full SSB Situation Reaction Test practice papers every day with a strict 30-second time limit per question. The discomfort you feel in the first two weeks is precisely the feeling the SSB is designed to assess and select for.",
    "Debrief your decisions regularly — not to judge them as right or wrong but to understand your decision process. Officers who make fast confident decisions and then learn from outcomes consistently outperform officers who delay, avoid, and overthink."
  ],
  ability_to_influence:[
    "Practise a structured three-part persuasion approach in every group discussion you participate in: state your position clearly, give one strong specific reason, provide one concrete real example, then invite response. Do this consistently in every group setting.",
    "Volunteer to brief, present, or explain things to groups at every available opportunity — even small groups of two or three people. The Ability to Influence the Group grows through repeated practice of public communication under realistic conditions, not through private preparation.",
    "Study and deliberately practise three influence techniques: credibility (demonstrate clearly that you know what you are talking about), logic (structure your argument so the conclusion is inevitable), and emotional resonance (connect your idea to something the group already cares deeply about)."
  ],
  liveliness:[
    "Build your baseline physical energy through daily exercise of at least 45 minutes. Genuine, sustained Liveliness requires a physical foundation — fatigue is the single biggest destroyer of the natural energy and enthusiasm that assessors observe and score.",
    "Make a deliberate decision to speak first in group settings at least once per session, and to increase your vocal energy and physical presence consciously. Energy and enthusiasm are genuinely contagious — they spread from the person who decides to be energetic first, not last.",
    "Study how genuinely inspiring leaders carry and transmit energy to those around them. Observe their posture, voice pace and volume, eye contact, and physical movement. These are learnable, trainable physical behaviours — not fixed personality traits that you either have or do not have."
  ],
  determination:[
    "Set one specific 90-day goal that requires consistent daily effort and is genuinely difficult — not merely inconvenient. Track it daily. The value of this exercise lies entirely in choosing something hard and then not allowing yourself to stop regardless of how slow the progress feels.",
    "Practise the discipline of never voluntarily stopping a task you have started until it is completely finished. Begin with small tasks and build progressively. Determination is a habit and a trainable mental muscle — it transfers across every area of your life once it is genuinely built.",
    "Study the lives of military leaders who succeeded against overwhelming odds through pure persistence — Field Marshal Sam Manekshaw, Field Marshal Slim, General Patton. These are not stories of exceptional talent. They are stories of people who simply refused to stop when every reasonable person would have."
  ],
  courage:[
    "Take one uncomfortable but clearly right action every single week — speak an unpopular truth to someone who needs to hear it, volunteer for a task that genuinely frightens you, stand up publicly for what is correct when it costs you something real. Moral courage is built exclusively through practice under genuine conditions.",
    "Build physical courage deliberately through adventure activities — trekking in challenging terrain, open water swimming, obstacle courses, contact sport. Physical courage and moral courage share a deep neurological foundation. Building one consistently strengthens the other.",
    "Identify one specific situation per week where you said nothing when you clearly should have spoken — and write down exactly what you should have said and why you stayed silent. Then deliberately practise saying it. The gap between knowing the right thing and actually saying it is closed only through repeated practice over time."
  ],
  stamina:[
    "Build a structured physical training programme that progressively increases duration over 90 days — starting at 30 minutes of sustained continuous effort and building systematically to 2 hours. Consistency without skipping sessions when tired is the only method that builds genuine physical stamina.",
    "Practise mental endurance through sustained focus exercises that match what the SSB actually demands: read a genuinely difficult book or document for 2 hours without stopping, complete a full-length practice paper without any break, maintain full concentration on a demanding task through deliberate fatigue.",
    "Gradually and progressively expose yourself to controlled physical and environmental discomfort: cold water exposure, sustained heat, extended marches, planned sleep deprivation. The SSB assesses your stamina not only physically but through your attitude, energy, and quality of output under conditions of sustained and unrelenting pressure."
  ],
};

async function generateReport(name, profile, scores) {
  const {olqScores, factorScores, overall} = scores;
  const readiness = classify(overall);
  const sorted = Object.entries(olqScores).sort((a,b)=>b[1]-a[1]);
  const top5 = sorted.slice(0,5).map(([k])=>OLQ_LIST[k].label);
  const weak4 = sorted.slice(-4).map(([k])=>({key:k, label:OLQ_LIST[k].label, score:olqScores[k]}));

  const prompt = `You are Professor Dr John Chenetra, a retired Indian Army Colonel, senior SSB assessor, and founder of Colonel's MENTORIA. You have personally assessed thousands of officer candidates over 30 years.

Write a personalised SSB Officer Readiness Report for ${name}, age ${profile.age||"not specified"}, from ${profile.city||"India"}, aspiring to join the ${profile.service||"Indian Armed Forces"} through ${profile.entry||"NDA/CDS"}.

SCORES: Overall ${overall}/100 — ${readiness.label}
Factor I (Planning and Organising): ${factorScores[1]}/100
Factor II (Social Adjustment): ${factorScores[2]}/100
Factor III (Social Effectiveness): ${factorScores[3]}/100
Factor IV (Dynamic Qualities): ${factorScores[4]}/100
Strongest Officer Like Qualities: ${top5.join(", ")}
Weakest Officer Like Qualities needing development: ${weak4.map(w=>w.label+" ("+w.score+"/100)").join(", ")}

Write in 5 sections. Address ${name} directly as "you". Write as a respected, direct, caring senior military mentor.

SECTION 1 — YOUR OFFICER LIKE QUALITIES PROFILE (5 sentences): Honest, specific assessment of ${name}'s current profile. Reference actual factor scores. Be direct but encouraging.

SECTION 2 — YOUR NATURAL OFFICER STRENGTHS (5 sentences): Describe top Officer Like Qualities in practical SSB terms — what would assessors actually observe in Group Testing Officer tasks, psychology tests, and Personal Interview?

SECTION 3 — YOUR CRITICAL DEVELOPMENT AREAS (write exactly 4 sentences per weak quality, covering: why this quality matters for an officer, what ${name}'s score reveals, the SSB consequence if not developed, the single most important corrective action):
${weak4.map(w=>"- "+w.label+" (score: "+w.score+"/100)").join("\n")}

SECTION 4 — YOUR STAGE-BY-STAGE SSB READINESS (6 sentences): Assess likely performance at Officer Intelligence Rating, psychological tests, Group Testing Officer tasks, and Personal Interview. Where is ${name} strongest? Where most vulnerable?

SECTION 5 — YOUR 90-DAY DEVELOPMENT PLAN (3 phases, prose format):
Phase 1 Days 1-30: Foundation work targeting weakest Officer Like Qualities — 3 specific daily activities.
Phase 2 Days 31-60: Development through challenge — 3 specific weekly challenges.
Phase 3 Days 61-90: SSB simulation — 3 activities that directly replicate SSB conditions.

700-800 words total. Clear direct prose. No bullet points.`;

  const resp = await fetch("/api/claude",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1800,messages:[{role:"user",content:prompt}]})
  });
  const data = await resp.json();
  return data.content?.map(b=>b.text||"").join("")||"";
}

// ─── UI ────────────────────────────────────────────────────────────
const NAVY="#1E3A8A";
const BG={background:"#F1F5F9",minHeight:"100vh",fontFamily:"'Segoe UI',system-ui,sans-serif",color:"#1E293B"};
const INP={width:"100%",padding:"11px 14px",borderRadius:9,border:"1.5px solid #CBD5E1",background:"#fff",color:"#1E293B",fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"};

function Opt({i,text,sel,onClick,color}){
  const lbl=["A","B","C","D","E"][i];
  return(
    <button onClick={onClick} style={{display:"block",width:"100%",textAlign:"left",padding:"13px 16px",borderRadius:11,border:`2px solid ${sel?color:"#E2E8F0"}`,background:sel?`${color}11`:"#FAFAFA",color:sel?color:"#374151",fontSize:14,cursor:"pointer",marginBottom:9,transition:"all .15s",fontWeight:sel?700:400,lineHeight:1.55}}>
      <span style={{fontWeight:800,marginRight:10,color:sel?color:"#94A3B8"}}>{lbl}.</span>{text}
    </button>
  );
}

function Bar({label,score}){
  const col=score>=78?"#065F46":score>=65?"#1E3A8A":score>=52?"#92400E":"#DC2626";
  const lvl=score>=78?"Exceptional":score>=65?"Strong":score>=52?"Developing":"Needs Focus";
  return(
    <div style={{marginBottom:13}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{fontSize:13,fontWeight:600,color:"#374151"}}>{label}</span>
        <span style={{fontSize:12,color:col,fontWeight:700}}>{lvl} — {score}/100</span>
      </div>
      <div style={{background:"#E2E8F0",borderRadius:6,height:9}}>
        <div style={{width:`${score}%`,height:"100%",background:`linear-gradient(90deg,${col}88,${col})`,borderRadius:6}}/>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────
export default function SSBCompass() {
  const [screen,setScreen]=useState("intro");
  const [sIdx,setSIdx]=useState(0);
  const [qIdx,setQIdx]=useState(0);
  const [showBrief,setShowBrief]=useState(true);
  const [allAns,setAllAns]=useState({});
  const [profile,setProfile]=useState({name:"",age:"",city:"",service:"Indian Army",entry:"NDA"});
  const [nameIn,setNameIn]=useState("");
  const [scores,setScores]=useState(null);
  const [report,setReport]=useState("");
  const [email,setEmail]=useState("");
  const [emailOk,setEmailOk]=useState(false);
  const [openFactor,setOpenFactor]=useState(null);

  const stageKeys=["s1","s2","s3","s4","s5","s6","s7","s8","s9"];
  const curKey=stageKeys[sIdx];
  const curStage=STAGES[sIdx];
  const curQs=QUESTIONS[curKey]||[];
  const curQ=curQs[qIdx];
  const curAns=(allAns[curKey]||{})[curQ?.id];

  const totalQ=stageKeys.reduce((s,k)=>(QUESTIONS[k]||[]).length+s,0);
  const doneQ=stageKeys.slice(0,sIdx).reduce((s,k)=>(QUESTIONS[k]||[]).length+s,0)+(showBrief?0:qIdx);
  const pct=Math.round(doneQ/totalQ*100);
  const canGo=nameIn.trim()&&profile.age;

  function setP(k,v){setProfile(p=>({...p,[k]:v}));}
  function setAns(v){setAllAns(p=>({...p,[curKey]:{...(p[curKey]||{}),[curQ.id]:v}}));}

  function next(){
    if(qIdx<curQs.length-1) setQIdx(i=>i+1);
    else if(sIdx<stageKeys.length-1){setSIdx(s=>s+1);setQIdx(0);setShowBrief(true);}
    else finish();
  }
  function prev(){
    if(!showBrief&&qIdx>0) setQIdx(i=>i-1);
    else if(!showBrief&&qIdx===0) setShowBrief(true);
    else if(showBrief&&sIdx>0){
      setSIdx(s=>s-1);
      setQIdx((QUESTIONS[stageKeys[sIdx-1]]||[]).length-1);
      setShowBrief(false);
    }
  }

  async function finish(){
    setScreen("loading");
    try{
      const sc=scoreAll(allAns);
      setScores(sc);
      try{
        const nm=profile.name||nameIn;
        const rpt=await generateReport(nm,{...profile,name:nm},sc);
        setReport(rpt);
      }catch(e){setReport("");}
    }catch(e){}
    setScreen("results");
  }

  function start(){
    if(!canGo) return;
    setProfile(p=>({...p,name:nameIn.trim()}));
    setScreen("test");setSIdx(0);setQIdx(0);setShowBrief(true);setAllAns({});
  }
  function reset(){
    setScreen("intro");setAllAns({});setSIdx(0);setQIdx(0);
    setScores(null);setReport("");setNameIn("");
    setProfile({name:"",age:"",city:"",service:"Indian Army",entry:"NDA"});
    setEmail("");setEmailOk(false);setOpenFactor(null);
  }

  // INTRO
  if(screen==="intro") return(
    <div style={{...BG,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{maxWidth:600,width:"100%"}}>
        <div style={{background:"#fff",borderRadius:20,padding:28,boxShadow:"0 4px 28px rgba(0,0,0,0.09)"}}>
          <div style={{textAlign:"center",marginBottom:22}}>
            <div style={{display:"flex",justifyContent:"center",gap:10,marginBottom:10}}>
              <span style={{fontSize:36}}>⚔️</span><span style={{fontSize:36}}>🎖️</span><span style={{fontSize:36}}>✈️</span>
            </div>
            <h1 style={{fontSize:26,fontWeight:900,color:NAVY,margin:"0 0 4px"}}>SSBCompass™</h1>
            <p style={{color:NAVY,fontSize:13,fontWeight:700,margin:"0 0 8px"}}>by Colonel's MENTORIA</p>
            <p style={{color:"#64748B",fontSize:14,lineHeight:1.7}}>The most comprehensive Indian Defence Officer readiness assessment — measuring all <strong>15 Officer Like Qualities</strong> across <strong>4 Factors</strong> through <strong>9 test stages</strong> that mirror the actual SSB process.</p>
          </div>

          <div style={{background:"#EFF6FF",borderRadius:12,padding:16,marginBottom:16,border:"1.5px solid #BFDBFE"}}>
            <p style={{fontSize:12,fontWeight:700,color:NAVY,textTransform:"uppercase",letterSpacing:1,margin:"0 0 10px"}}>9 Stages · {totalQ} Questions · All 15 Officer Like Qualities Measured</p>
            {STAGES.map((st,i)=>(
              <div key={st.key} style={{display:"flex",gap:9,alignItems:"center",fontSize:13,color:"#374151",marginBottom:5}}>
                <span style={{background:NAVY,color:"#fff",fontSize:10,fontWeight:800,width:20,height:20,borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</span>
                <span>{st.emoji} {st.label}</span>
                <span style={{color:"#94A3B8",fontSize:11,marginLeft:"auto"}}>{(QUESTIONS[stageKeys[i]]||[]).length}Q</span>
              </div>
            ))}
          </div>

          <div style={{background:"#FFF7ED",borderRadius:10,padding:14,marginBottom:16,border:"1px solid #FED7AA"}}>
            <p style={{fontSize:13,color:"#92400E",margin:0,lineHeight:1.7}}>
              <strong>⚠️ Most important instruction:</strong> Every question has five behavioural options — A, B, C, D, or E. <strong>Choose your very first, natural response.</strong> The moment you start calculating what sounds best, you move away from your authentic personality. The SSB assessors are trained to detect rehearsed responses. Your instinctive first answer is always the most accurate and the most useful for your development.
            </p>
          </div>

          <div style={{marginBottom:12}}>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase",letterSpacing:0.8,marginBottom:4}}>Full Name *</label>
            <input value={nameIn} onChange={e=>setNameIn(e.target.value)} placeholder="Your full name..." style={INP}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <div>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase",letterSpacing:0.8,marginBottom:4}}>Age *</label>
              <input type="number" min="16" max="35" value={profile.age} onChange={e=>setP("age",e.target.value)} placeholder="e.g. 19" style={INP}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase",letterSpacing:0.8,marginBottom:4}}>City</label>
              <input value={profile.city} onChange={e=>setP("city",e.target.value)} placeholder="e.g. Delhi" style={INP}/>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
            <div>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase",letterSpacing:0.8,marginBottom:4}}>Target Service</label>
              <select value={profile.service} onChange={e=>setP("service",e.target.value)} style={{...INP,appearance:"none"}}>
                <option>Indian Army</option><option>Indian Navy</option><option>Indian Air Force</option><option>All Three Services</option>
              </select>
            </div>
            <div>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase",letterSpacing:0.8,marginBottom:4}}>Entry Scheme</label>
              <select value={profile.entry} onChange={e=>setP("entry",e.target.value)} style={{...INP,appearance:"none"}}>
                <option>NDA</option><option>CDS</option><option>TES / TGC</option><option>AFCAT</option><option>SSC</option><option>NCC Special Entry</option>
              </select>
            </div>
          </div>
          <button onClick={start} disabled={!canGo} style={{width:"100%",padding:14,borderRadius:12,border:"none",background:canGo?NAVY:"#E2E8F0",color:canGo?"#fff":"#94A3B8",fontSize:16,fontWeight:800,cursor:canGo?"pointer":"not-allowed",transition:"all .2s"}}>
            {canGo?`Begin Assessment — Jai Hind! 🇮🇳`:"Enter your name and age to begin"}
          </button>
          <p style={{color:"#94A3B8",fontSize:11,textAlign:"center",marginTop:10}}>~35 minutes · {totalQ} questions · Completely private · All data stays on your device</p>
        </div>
      </div>
    </div>
  );

  // LOADING
  if(screen==="loading") return(
    <div style={{...BG,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",padding:40}}>
        <div style={{fontSize:48,marginBottom:14}}>🎖️</div>
        <h2 style={{fontSize:21,fontWeight:800,color:NAVY,margin:"0 0 10px"}}>Analysing your Officer Like Qualities...</h2>
        <p style={{color:"#64748B",fontSize:14,lineHeight:1.75}}>Professor Dr John Chenetra's AI is writing your personalised SSB Readiness Report.<br/>Measuring all 15 Officer Like Qualities across 4 Factors.<br/>Please wait about 25 seconds.</p>
      </div>
    </div>
  );

  // TEST
  if(screen==="test"){
    const col=curStage.color;
    const isAns=curAns!==undefined;
    const isLast=sIdx===stageKeys.length-1&&qIdx===curQs.length-1;

    if(showBrief) return(
      <div style={{...BG,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{maxWidth:580,width:"100%"}}>
          <div style={{background:"#fff",borderRadius:12,padding:"10px 16px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
            <div style={{flex:1,background:"#E2E8F0",borderRadius:5,height:7}}>
              <div style={{width:`${pct}%`,height:"100%",background:NAVY,borderRadius:5}}/>
            </div>
            <span style={{color:"#64748B",fontSize:12,whiteSpace:"nowrap"}}>{pct}% complete</span>
          </div>
          <div style={{background:"#fff",borderRadius:20,padding:26,boxShadow:"0 4px 24px rgba(0,0,0,0.07)",textAlign:"center"}}>
            <div style={{width:68,height:68,borderRadius:16,background:curStage.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 14px",border:`2px solid ${col}33`}}>{curStage.emoji}</div>
            <div style={{background:col,color:"#fff",fontSize:11,fontWeight:800,padding:"3px 12px",borderRadius:20,display:"inline-block",marginBottom:10}}>Stage {sIdx+1} of {STAGES.length}</div>
            <h2 style={{fontSize:20,fontWeight:800,color:"#1E293B",margin:"0 0 14px"}}>{curStage.label}</h2>
            <div style={{background:"#F8FAFC",borderRadius:12,padding:14,marginBottom:12,textAlign:"left"}}>
              <p style={{fontSize:13,fontWeight:700,color:"#374151",margin:"0 0 5px"}}>What this stage measures:</p>
              <p style={{fontSize:14,color:"#1E293B",margin:"0 0 12px",lineHeight:1.65}}>{curStage.what}</p>
              <p style={{fontSize:13,fontWeight:700,color:"#374151",margin:"0 0 5px"}}>Why it matters for your Officer Like Qualities:</p>
              <p style={{fontSize:14,color:"#1E293B",margin:0,lineHeight:1.65}}>{curStage.why}</p>
            </div>
            <div style={{background:`${col}11`,borderRadius:10,padding:"11px 14px",marginBottom:16,border:`1px solid ${col}33`,textAlign:"left"}}>
              <p style={{fontSize:13,color:col,fontWeight:700,margin:"0 0 3px"}}>💡 Remember before you begin:</p>
              <p style={{fontSize:13,color:"#374151",margin:0,lineHeight:1.6}}>{curStage.tip}</p>
            </div>
            <p style={{color:"#64748B",fontSize:13,margin:"0 0 16px"}}>{curQs.length} questions · Choose your first instinctive response each time</p>
            <div style={{display:"flex",gap:10}}>
              {sIdx>0&&<button onClick={prev} style={{padding:"12px 18px",borderRadius:10,border:"1.5px solid #E2E8F0",background:"#fff",color:"#64748B",fontSize:14,cursor:"pointer"}}>← Back</button>}
              <button onClick={()=>setShowBrief(false)} style={{flex:1,padding:13,borderRadius:10,border:"none",background:col,color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer"}}>Begin Stage {sIdx+1} →</button>
            </div>
          </div>
        </div>
      </div>
    );

    return(
      <div style={{...BG}}>
        <div style={{background:"#fff",borderBottom:"1px solid #E2E8F0",padding:"10px 16px",position:"sticky",top:0,zIndex:10}}>
          <div style={{maxWidth:680,margin:"0 auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <span style={{background:col,color:"#fff",fontSize:11,padding:"3px 10px",borderRadius:20,fontWeight:700}}>{curStage.emoji} {curStage.label}</span>
              <span style={{fontSize:12,color:"#64748B"}}>Q{qIdx+1}/{curQs.length} · {pct}% done</span>
            </div>
            <div style={{background:"#E2E8F0",borderRadius:5,height:6}}>
              <div style={{width:`${pct}%`,height:"100%",background:col,borderRadius:5,transition:"width .3s"}}/>
            </div>
          </div>
        </div>
        <div style={{maxWidth:680,margin:"0 auto",padding:"20px 16px"}}>
          <p style={{fontSize:15,color:"#1E293B",fontWeight:600,lineHeight:1.65,marginBottom:14}}>{curQ.text}</p>
          {(curQ.opts||curQ.options||[]).map((opt,i)=>(
            <Opt key={i} i={i} text={opt} sel={curAns===i} onClick={()=>setAns(i)} color={col}/>
          ))}
          <div style={{display:"flex",gap:10,marginTop:16}}>
            <button onClick={prev} style={{padding:"12px 18px",borderRadius:10,border:"1.5px solid #E2E8F0",background:"#fff",color:"#64748B",fontSize:14,cursor:"pointer"}}>← Back</button>
            <button onClick={next} disabled={!isAns} style={{flex:1,padding:13,borderRadius:10,border:"none",background:isAns?col:"#E2E8F0",color:isAns?"#fff":"#94A3B8",fontSize:15,fontWeight:800,cursor:isAns?"pointer":"not-allowed",transition:"all .2s"}}>
              {isLast?"View My SSB Report 🎖️":"Next →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RESULTS
  if(screen==="results"&&scores){
    const {olqScores,factorScores,overall}=scores;
    const rd=classify(overall);
    const sorted=Object.entries(olqScores).sort((a,b)=>b[1]-a[1]);
    const top5=sorted.slice(0,5);
    const weak4=sorted.slice(-4).reverse();

    return(
      <div style={{...BG,padding:16}}>
        <style>{`
          @media print{body{background:#fff!important}button,.np{display:none!important}.pc{break-inside:avoid;margin-bottom:12px}}
          @keyframes fi{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
          .fi{animation:fi .5s ease forwards}
        `}</style>
        <div style={{maxWidth:720,margin:"0 auto"}}>

          {/* HEADER */}
          <div className="fi pc" style={{background:`linear-gradient(135deg,${NAVY},#1e40af)`,borderRadius:20,padding:24,marginBottom:14,color:"#fff",textAlign:"center"}}>
            <div style={{display:"flex",justifyContent:"center",gap:10,marginBottom:10}}>
              <span style={{fontSize:28}}>⚔️</span><span style={{fontSize:28}}>🎖️</span><span style={{fontSize:28}}>✈️</span>
            </div>
            <h1 style={{fontSize:20,fontWeight:900,margin:"0 0 4px"}}>SSBCompass™ — Officer Readiness Report</h1>
            <p style={{fontSize:15,fontWeight:700,margin:"0 0 2px",opacity:0.9}}>{profile.name||nameIn}</p>
            <p style={{fontSize:12,opacity:0.7,margin:"0 0 14px"}}>{new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}{profile.city?` · ${profile.city}`:""} · {profile.service} · {profile.entry}</p>
            <div style={{background:"rgba(255,255,255,0.15)",borderRadius:14,padding:"16px 24px",display:"inline-block"}}>
              <div style={{fontSize:52,fontWeight:900,lineHeight:1}}>{overall}</div>
              <div style={{fontSize:13,opacity:0.85,marginTop:4}}>Overall Officer Readiness Score / 100</div>
              <div style={{fontSize:14,fontWeight:700,marginTop:10,background:rd.bg,color:rd.color,borderRadius:8,padding:"5px 16px",display:"inline-block"}}>Grade {rd.grade} — {rd.label}</div>
            </div>
          </div>

          {/* FACTOR SUMMARY */}
          <div className="fi pc" style={{background:"#fff",borderRadius:14,padding:20,marginBottom:14,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
            <p style={{fontSize:11,fontWeight:700,color:NAVY,textTransform:"uppercase",letterSpacing:1,margin:"0 0 14px"}}>📊 Your Four-Factor Officer Like Qualities Profile</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {Object.entries(FACTORS).map(([fNum,fDef])=>{
                const sc=factorScores[fNum];
                const col2=sc>=70?fDef.color:sc>=55?"#92400E":"#DC2626";
                const isOpen=openFactor===fNum;
                return(
                  <div key={fNum} style={{background:fDef.light,borderRadius:12,padding:14,border:`1.5px solid ${fDef.color}33`,cursor:"pointer"}} onClick={()=>setOpenFactor(isOpen?null:fNum)}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <span style={{fontSize:12,fontWeight:700,color:fDef.color,lineHeight:1.3}}>{fDef.label}</span>
                      <span style={{fontSize:22,fontWeight:900,color:col2,marginLeft:8,flexShrink:0}}>{sc}</span>
                    </div>
                    <div style={{background:"#E2E8F0",borderRadius:5,height:8}}>
                      <div style={{width:`${sc}%`,height:"100%",background:col2,borderRadius:5}}/>
                    </div>
                    {isOpen&&<div style={{marginTop:12}}>{fDef.keys.map(k=><Bar key={k} label={OLQ_LIST[k].label} score={olqScores[k]}/>)}</div>}
                    <p style={{fontSize:11,color:fDef.color,margin:"8px 0 0",textAlign:"center"}}>{isOpen?"Tap to collapse ▲":"Tap to see all Officer Like Qualities ▼"}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ALL 15 OLQs */}
          <div className="fi pc" style={{background:"#fff",borderRadius:14,padding:20,marginBottom:14,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
            <p style={{fontSize:11,fontWeight:700,color:NAVY,textTransform:"uppercase",letterSpacing:1,margin:"0 0 14px"}}>📋 Complete Profile — All 15 Officer Like Qualities</p>
            {Object.entries(FACTORS).map(([fNum,fDef])=>(
              <div key={fNum} style={{marginBottom:16}}>
                <p style={{fontSize:11,fontWeight:700,color:fDef.color,textTransform:"uppercase",letterSpacing:0.8,margin:"0 0 8px",paddingBottom:4,borderBottom:`1px solid ${fDef.color}22`}}>{fDef.label}</p>
                {fDef.keys.map(k=><Bar key={k} label={OLQ_LIST[k].label} score={olqScores[k]}/>)}
              </div>
            ))}
          </div>

          {/* TOP 5 */}
          <div className="fi pc" style={{background:"#ECFDF5",borderRadius:14,padding:20,marginBottom:14,border:"1.5px solid #BBF7D0"}}>
            <p style={{fontSize:11,fontWeight:700,color:"#065F46",textTransform:"uppercase",letterSpacing:1,margin:"0 0 12px"}}>⭐ Your 5 Strongest Officer Like Qualities</p>
            {top5.map(([k,sc])=>(
              <div key={k} style={{background:"#fff",borderRadius:10,padding:13,marginBottom:9,display:"flex",gap:14,alignItems:"flex-start",borderLeft:"4px solid #065F46"}}>
                <div style={{textAlign:"center",minWidth:48}}>
                  <div style={{fontSize:22,fontWeight:900,color:"#065F46",lineHeight:1}}>{sc}</div>
                  <div style={{fontSize:9,color:"#065F46",textTransform:"uppercase"}}>/100</div>
                </div>
                <div>
                  <p style={{fontSize:14,fontWeight:700,color:"#1E293B",margin:"0 0 3px"}}>{OLQ_LIST[k].label}</p>
                  <p style={{fontSize:12,color:"#065F46",margin:0}}>{sc>=78?"Exceptional — this is a defining strength in your officer profile":sc>=65?"Strong — consistently present across multiple test stages":"Above average — visible in key situations"}</p>
                </div>
              </div>
            ))}
          </div>

          {/* WEAK 4 + IMPROVEMENT PLANS */}
          <div className="fi pc" style={{background:"#FEF2F2",borderRadius:14,padding:20,marginBottom:14,border:"1.5px solid #FECACA"}}>
            <p style={{fontSize:11,fontWeight:700,color:"#7C2D12",textTransform:"uppercase",letterSpacing:1,margin:"0 0 12px"}}>📈 Development Areas — With Detailed Improvement Plans</p>
            {weak4.map(([k,sc])=>{
              const plans=IMPROVEMENT_PLANS[k]||["Practise this quality daily through deliberately difficult situations.","Seek feedback from people who know you well on this specific quality.","Set a 30-day goal specifically targeting this area and track progress daily."];
              return(
                <div key={k} style={{background:"#fff",borderRadius:12,padding:16,marginBottom:14,borderLeft:"4px solid #DC2626"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <h4 style={{fontSize:15,fontWeight:800,color:"#1E293B",margin:0}}>{OLQ_LIST[k].label}</h4>
                    <span style={{background:"#FEE2E2",color:"#DC2626",fontSize:12,padding:"3px 10px",borderRadius:20,fontWeight:700,flexShrink:0,marginLeft:10}}>{sc}/100</span>
                  </div>
                  <p style={{fontSize:12,color:"#7C2D12",margin:"0 0 12px",fontWeight:600}}>Factor {OLQ_LIST[k].factor} · {sc<40?"Critical gap — requires immediate focused attention":sc<55?"Significant development needed":"Developing — consistent targeted practice required"}</p>
                  <div style={{borderTop:"1px solid #FEE2E2",paddingTop:12}}>
                    <p style={{fontSize:12,fontWeight:700,color:"#7C2D12",margin:"0 0 10px",textTransform:"uppercase",letterSpacing:0.7}}>Your 3-Step Improvement Plan:</p>
                    {plans.map((step,i)=>(
                      <div key={i} style={{display:"flex",gap:12,marginBottom:10,alignItems:"flex-start"}}>
                        <div style={{width:26,height:26,borderRadius:"50%",background:"#7C2D12",color:"#fff",fontSize:13,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</div>
                        <p style={{fontSize:13,color:"#374151",margin:0,lineHeight:1.65}}>{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI REPORT */}
          {report&&(
            <div className="fi pc" style={{background:"#fff",borderRadius:14,padding:22,marginBottom:14,boxShadow:"0 2px 12px rgba(0,0,0,0.06)",border:"1.5px solid #BFDBFE"}}>
              <p style={{fontSize:11,fontWeight:700,color:NAVY,textTransform:"uppercase",letterSpacing:1,margin:"0 0 14px"}}>📝 Professor Dr John Chenetra — Personalised SSB Readiness Assessment</p>
              {report.split(/\n\n+/).filter(p=>p.trim()).map((para,i)=>{
                const cols=["#EFF6FF","#ECFDF5","#FFF7ED","#EFF6FF","#F5F3FF"];
                const bords=[NAVY,"#065F46","#92400E","#1E3A8A","#581C87"];
                const clean=para.replace(/^#+\s*/,"").replace(/SECTION \d+[^:\n]*:?\n?/,"").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>");
                return(
                  <div key={i} style={{background:cols[i%5],borderRadius:12,padding:14,marginBottom:10,borderLeft:`4px solid ${bords[i%5]}`}}>
                    <p style={{fontSize:14,color:"#1E293B",lineHeight:1.8,margin:0}} dangerouslySetInnerHTML={{__html:clean}}/>
                  </div>
                );
              })}
            </div>
          )}

          {/* DOWNLOAD + EMAIL */}
          <div className="fi np pc" style={{background:"#fff",borderRadius:14,padding:20,marginBottom:14,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
            <p style={{fontSize:11,fontWeight:700,color:NAVY,textTransform:"uppercase",letterSpacing:1,margin:"0 0 14px"}}>📤 Save and Share Your Report</p>
            <button onClick={()=>window.print()} style={{width:"100%",padding:13,borderRadius:12,border:"none",background:NAVY,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              📥 Download / Print Full Report as PDF
            </button>
            <div style={{background:"#F8FAFC",borderRadius:12,padding:14}}>
              <p style={{fontSize:13,fontWeight:600,color:"#374151",margin:"0 0 9px"}}>📧 Email this report:</p>
              <div style={{display:"flex",gap:8}}>
                <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Enter email address (parents, mentor, Professor Dr John Chenetra's team)..." style={{...INP,flex:1}}/>
                <button onClick={()=>{if(email.includes("@")){setEmailOk(true);setTimeout(()=>setEmailOk(false),4000);}}} style={{padding:"11px 16px",borderRadius:9,border:"none",background:"#065F46",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
                  {emailOk?"✅ Sent!":"Send →"}
                </button>
              </div>
              {emailOk&&<p style={{color:"#065F46",fontSize:12,margin:"8px 0 0"}}>✅ Sent! Connect your email service in the deployed version to enable actual delivery.</p>}
              <p style={{color:"#94A3B8",fontSize:11,margin:"8px 0 0"}}>Share with your parents, SSB coaching mentor, or Professor Dr John Chenetra's team at Colonel's MENTORIA.</p>
            </div>
          </div>

          {/* RETAKE */}
          <div className="np" style={{textAlign:"center",paddingBottom:40}}>
            <button onClick={reset} style={{padding:"11px 28px",borderRadius:10,border:"1.5px solid #E2E8F0",background:"#fff",color:"#64748B",fontSize:14,cursor:"pointer"}}>Retake Assessment</button>
            <p style={{color:"#94A3B8",fontSize:11,marginTop:12}}>
              © Colonel's MENTORIA — SSBCompass™ by Professor Dr John Chenetra · Powered by Claude AI (Anthropic)<br/>
              This is a preparation and development tool. Official SSB selection is conducted by the Services Selection Boards of the Indian Armed Forces.
            </p>
          </div>

        </div>
      </div>
    );
  }

  return <div style={BG}/>;
}
