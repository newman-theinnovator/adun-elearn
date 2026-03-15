import { PrismaClient, Role, ContentType, AssessmentType, QuestionType, SubmissionStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')
    const password = await bcrypt.hash('password123', 12)

    // 1. Create Users
    const admin = await prisma.user.upsert({
        where: { email: 'admin@adun.edu.ng' },
        update: {},
        create: {
            email: 'admin@adun.edu.ng',
            firstName: 'Dr. John',
            lastName: 'Doe',
            password,
            role: Role.ADMIN,
            staffId: 'ADUN/STF/001'
        }
    })

    // Lecturers
    const lecturers = await Promise.all([
        prisma.user.create({ data: { email: 'ngozi.eze@adun.edu.ng', firstName: 'Ngozi', lastName: 'Eze', password, role: Role.LECTURER, staffId: 'ADUN/STF/002' } }),
        prisma.user.create({ data: { email: 'emmanuel.okafor@adun.edu.ng', firstName: 'Emmanuel', lastName: 'Okafor', password, role: Role.LECTURER, staffId: 'ADUN/STF/003' } }),
        prisma.user.create({ data: { email: 'sarah.bello@adun.edu.ng', firstName: 'Sarah', lastName: 'Bello', password, role: Role.LECTURER, staffId: 'ADUN/STF/004' } })
    ])

    // Students (25)
    const students = []
    for (let i = 1; i <= 25; i++) {
        const level = (Math.floor((i - 1) / 6) + 1) * 100 // 100, 200, 300, 400
        students.push(await prisma.user.create({
            data: {
                email: `student${i}@adun.edu.ng`,
                firstName: `Student${i}First`,
                lastName: `Student${i}Last`,
                password,
                role: Role.STUDENT,
                level,
                matricNumber: `ADUN/SWE/2024/${i.toString().padStart(3, '0')}`
            }
        }))
    }

    // Chidera (demo student)
    const chidera = await prisma.user.upsert({
        where: { email: 'chidera.okafor@adun.edu.ng' },
        update: {},
        create: {
            email: 'chidera.okafor@adun.edu.ng',
            firstName: 'Chidera',
            lastName: 'Okafor',
            password,
            role: Role.STUDENT,
            level: 400,
            matricNumber: `ADUN/SWE/20/001`
        }
    })
    students.push(chidera)

    // 2. Create Courses
    const courseData = [
        { code: 'SWE 101', title: 'Intro to Software Engineering', semester: 'First', level: 100, unit: 3 },
        { code: 'SWE 201', title: 'Data Structures', semester: 'First', level: 200, unit: 3 },
        { code: 'SWE 202', title: 'OOP with Java', semester: 'Second', level: 200, unit: 3 },
        { code: 'SWE 301', title: 'Database Systems', semester: 'First', level: 300, unit: 3 },
        { code: 'SWE 302', title: 'Software Design & Architecture', semester: 'Second', level: 300, unit: 3 },
        { code: 'SWE 401', title: 'AI & Machine Learning', semester: 'First', level: 400, unit: 3 },
        { code: 'SWE 402', title: 'Software Project Management', semester: 'Second', level: 400, unit: 3 },
        { code: 'SWE 404', title: 'Final Year Project', semester: 'Second', level: 400, unit: 6 },
    ]

    const courses = await Promise.all(courseData.map((c, idx) =>
        prisma.course.create({
            data: {
                ...c,
                instructorId: lecturers[idx % lecturers.length].id,
                description: `Comprehensive guide to ${c.title} for software engineering students.`,
                isPublished: true,
            }
        })
    ))

    // 3. Enroll students
    for (const student of students) {
        if (!student.level) continue;
        // Enroll in courses matching their level
        const studentCourses = courses.filter(c => c.level === student.level);
        for (const sc of studentCourses) {
            await prisma.enrollment.create({
                data: { userId: student.id, courseId: sc.id }
            })
        }
    }

    // 4. Create Modules and Contents for SWE 401 (AI & ML)
    const swe401 = courses.find(c => c.code === 'SWE 401')!

    const m1 = await prisma.module.create({
        data: { title: 'Introduction to AI', description: 'Basics of AI and Intelligence', order: 1, courseId: swe401.id }
    })

    await prisma.content.createMany({
        data: [
            { title: 'What is AI?', type: ContentType.VIDEO, duration: 15, order: 1, moduleId: m1.id, url: "https://youtube.com/embed/dummy1" },
            { title: 'Turing Test', type: ContentType.PDF, order: 2, moduleId: m1.id, url: "https://example.com/dummy.pdf" }
        ]
    })

    // 5. Create Assessment for SWE 401
    const quiz1 = await prisma.assessment.create({
        data: {
            title: 'AI Fundamentals Quiz',
            type: AssessmentType.QUIZ,
            courseId: swe401.id,
            totalMarks: 10,
            duration: 15, // 15 mins
            isPublished: true,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // next week
        }
    })

    await prisma.question.createMany({
        data: [
            { text: 'Which of these is not an AI technique?', type: QuestionType.MCQ, options: ['Machine Learning', 'Deep Learning', 'Hardcoded If/Else', 'Neural Networks'], correctAnswer: 'Hardcoded If/Else', order: 1, assessmentId: quiz1.id },
            { text: 'AI can only run on quantum computers.', type: QuestionType.TRUE_FALSE, options: ['True', 'False'], correctAnswer: 'False', order: 2, assessmentId: quiz1.id }
        ]
    })

    console.log('Database seeded successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
