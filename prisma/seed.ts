import { PrismaClient } from "../lib/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  // Create tracks first
  const tracksData = [
    { name: "Frontend Development", description: "Learn modern frontend technologies like React, Vue, and Angular" },
    { name: "Backend Development", description: "Master server-side technologies and databases" },
    { name: "Full Stack Development", description: "Combine frontend and backend skills" },
    { name: "Data Science", description: "Analyze data and build machine learning models" },
    { name: "Mobile Development", description: "Build native and cross-platform mobile applications" },
    { name: "DevOps", description: "Infrastructure, deployment, and system administration" },
  ];

  console.log("Seeding tracks...");
  const createdTracks: { [key: string]: number } = {};
  
  for (const trackData of tracksData) {
    const track = await prisma.track.upsert({
      where: { name: trackData.name },
      update: {},
      create: trackData,
    });
    createdTracks[track.name] = track.id;
  }

  // Define topics with their associated tracks
  const topicsData = [
    // Frontend Development topics
    { name: "HTML & CSS", description: "Markup and styling fundamentals", track: "Frontend Development" },
    { name: "JavaScript", description: "Modern JavaScript and ES6+ features", track: "Frontend Development" },
    { name: "React", description: "Build interactive user interfaces with React", track: "Frontend Development" },
    { name: "Vue.js", description: "Progressive JavaScript framework", track: "Frontend Development" },
    { name: "Angular", description: "TypeScript-based web application framework", track: "Frontend Development" },
    { name: "TypeScript", description: "Typed superset of JavaScript", track: "Frontend Development" },
    { name: "Responsive Design", description: "Mobile-first and adaptive layouts", track: "Frontend Development" },
    { name: "Web Performance", description: "Optimization and performance tuning", track: "Frontend Development" },

    // Backend Development topics
    { name: "Node.js", description: "Server-side JavaScript development", track: "Backend Development" },
    { name: "Python", description: "Backend development with Python", track: "Backend Development" },
    { name: "Java", description: "Enterprise backend development", track: "Backend Development" },
    { name: "SQL", description: "Database query language and design", track: "Backend Development" },
    { name: "NoSQL", description: "MongoDB, Redis, and document databases", track: "Backend Development" },
    { name: "REST APIs", description: "RESTful web service design", track: "Backend Development" },
    { name: "GraphQL", description: "Query language for APIs", track: "Backend Development" },
    { name: "Microservices", description: "Distributed system architecture", track: "Backend Development" },

    // Full Stack Development topics (can reference frontend/backend topics or have specific ones)
    { name: "Full Stack JavaScript", description: "End-to-end JavaScript development", track: "Full Stack Development" },
    { name: "API Integration", description: "Connecting frontend and backend", track: "Full Stack Development" },
    { name: "Database Design", description: "Designing efficient database schemas", track: "Full Stack Development" },

    // Data Science topics
    { name: "Machine Learning", description: "AI and ML algorithms", track: "Data Science" },
    { name: "Python for Data Science", description: "NumPy, Pandas, Scikit-learn", track: "Data Science" },
    { name: "Data Visualization", description: "Matplotlib, Plotly, D3.js", track: "Data Science" },
    { name: "Statistics", description: "Statistical analysis and modeling", track: "Data Science" },
    { name: "Deep Learning", description: "Neural networks and TensorFlow", track: "Data Science" },
    { name: "Data Mining", description: "Extract insights from large datasets", track: "Data Science" },
    { name: "Big Data", description: "Spark, Hadoop, and distributed processing", track: "Data Science" },

    // Mobile Development topics
    { name: "React Native", description: "Cross-platform mobile development", track: "Mobile Development" },
    { name: "Flutter", description: "Google's UI toolkit for mobile", track: "Mobile Development" },
    { name: "iOS Development", description: "Swift and native iOS apps", track: "Mobile Development" },
    { name: "Android Development", description: "Kotlin and native Android apps", track: "Mobile Development" },
    { name: "Mobile UI/UX", description: "Mobile design principles", track: "Mobile Development" },
    { name: "Mobile Testing", description: "Testing strategies for mobile apps", track: "Mobile Development" },

    // DevOps topics
    { name: "Docker", description: "Containerization and deployment", track: "DevOps" },
    { name: "Kubernetes", description: "Container orchestration", track: "DevOps" },
    { name: "CI/CD", description: "Continuous integration and deployment", track: "DevOps" },
    { name: "AWS", description: "Amazon Web Services cloud platform", track: "DevOps" },
    { name: "Linux Administration", description: "Server management and scripting", track: "DevOps" },
    { name: "Monitoring", description: "Application and infrastructure monitoring", track: "DevOps" },

    // General topics (no specific track - available to all)
    { name: "Git & Version Control", description: "Source code management", track: null },
    { name: "Algorithms & Data Structures", description: "Computer science fundamentals", track: null },
    { name: "System Design", description: "Scalable architecture principles", track: null },
    { name: "Security", description: "Application and web security", track: null },
    { name: "Testing", description: "Unit, integration, and end-to-end testing", track: null },
    { name: "Agile Methodology", description: "Scrum and agile development practices", track: null },
    { name: "Code Quality", description: "Clean code and best practices", track: null },
    { name: "Web Development", description: "General web development concepts", track: null },
  ];

  console.log("Seeding topics...");
  for (const topicData of topicsData) {
    const trackId = topicData.track ? createdTracks[topicData.track] : null;
    
    await prisma.topic.upsert({
      where: { name: topicData.name },
      update: {},
      create: {
        name: topicData.name,
        description: topicData.description,
        trackId: trackId,
      },
    });
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
