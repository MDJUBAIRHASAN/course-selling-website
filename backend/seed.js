/**
 * Seed Script — Populates the database with initial data
 * Run: node seed.js
 * 
 * This will create:
 * - 1 admin user (sarah@skillforge.com / admin123)
 * - 12 courses (same as the hardcoded data)
 * - 10 sample users
 * - 10 sample orders
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Order = require('./models/Order');
const connectDB = require('./config/db');

const COURSES_DATA = [
    { title: "The Complete Web Developer Bootcamp 2026", instructor: "Dr. Angela Yu", category: "Development", price: 89.99, students: 285000, rating: 4.8, status: "published", revenue: 25640, image: "linear-gradient(135deg, #667eea, #764ba2)" },
    { title: "Machine Learning A-Z: AI, Python & R", instructor: "Kirill Eremenko", category: "Data Science", price: 94.99, students: 210000, rating: 4.7, status: "published", revenue: 19950, image: "linear-gradient(135deg, #f093fb, #f5576c)" },
    { title: "UI/UX Design Masterclass", instructor: "Daniel Walter Scott", category: "Design", price: 79.99, students: 175000, rating: 4.9, status: "published", revenue: 14000, image: "linear-gradient(135deg, #4facfe, #00f2fe)" },
    { title: "Complete Python Developer: Zero to Mastery", instructor: "Andrei Neagoie", category: "Development", price: 84.99, students: 340000, rating: 4.7, status: "published", revenue: 28900, image: "linear-gradient(135deg, #a18cd1, #fbc2eb)" },
    { title: "Digital Marketing Strategy", instructor: "Rob Percival", category: "Marketing", price: 69.99, students: 125000, rating: 4.6, status: "published", revenue: 8750, image: "linear-gradient(135deg, #ff9a9e, #fecfef)" },
    { title: "AWS Certified Solutions Architect", instructor: "Stephane Maarek", category: "Cloud", price: 99.99, students: 230000, rating: 4.8, status: "published", revenue: 23000, image: "linear-gradient(135deg, #fbc2eb, #a6c1ee)" },
    { title: "Business & Entrepreneurship Course", instructor: "Chris Haroun", category: "Business", price: 74.99, students: 160000, rating: 4.5, status: "draft", revenue: 12000, image: "linear-gradient(135deg, #89f7fe, #66a6ff)" },
    { title: "Deep Learning with TensorFlow", instructor: "Jose Portilla", category: "AI & ML", price: 109.99, students: 190000, rating: 4.9, status: "published", revenue: 20900, image: "linear-gradient(135deg, #a1c4fd, #c2e9fb)" },
    { title: "React Native: Build Mobile Apps", instructor: "Maximilian S.", category: "Development", price: 89.99, students: 155000, rating: 4.7, status: "published", revenue: 13950, image: "linear-gradient(135deg, #ffecd2, #fcb69f)" },
    { title: "Cybersecurity: Ethical Hacking", instructor: "Zaid Sabih", category: "Security", price: 94.99, students: 140000, rating: 4.6, status: "draft", revenue: 13300, image: "linear-gradient(135deg, #d299c2, #fef9d7)" },
    { title: "Advanced Data Visualization with D3.js", instructor: "Shirley Wu", category: "Data Science", price: 104.99, students: 85000, rating: 4.8, status: "published", revenue: 8925, image: "linear-gradient(135deg, #e0c3fc, #8ec5fc)" },
    { title: "Product Management: Idea to Launch", instructor: "Cole Mercer", category: "Business", price: 79.99, students: 110000, rating: 4.5, status: "published", revenue: 8800, image: "linear-gradient(135deg, #f5576c, #ff6f91)" },
];

const USERS_DATA = [
    { name: "Sarah Kim", email: "sarah@skillforge.com", password: "admin123", role: "admin", status: "active", avatar: "#7c3aed" },
    { name: "Alex Morgan", email: "alex@gmail.com", password: "student123", role: "student", status: "active", avatar: "#7c3aed" },
    { name: "Priya Sharma", email: "priya@outlook.com", password: "student123", role: "student", status: "active", avatar: "#ec4899" },
    { name: "James Wilson", email: "james@yahoo.com", password: "instructor123", role: "instructor", status: "active", avatar: "#f59e0b" },
    { name: "Emma Davis", email: "emma@gmail.com", password: "student123", role: "student", status: "active", avatar: "#10b981" },
    { name: "Michael Chen", email: "michael@company.com", password: "instructor123", role: "instructor", status: "active", avatar: "#2563eb" },
    { name: "David Brown", email: "david@gmail.com", password: "student123", role: "student", status: "active", avatar: "#ef4444" },
    { name: "Lisa Wang", email: "lisa@outlook.com", password: "student123", role: "student", status: "inactive", avatar: "#8b5cf6" },
    { name: "Robert Taylor", email: "robert@gmail.com", password: "student123", role: "student", status: "active", avatar: "#f59e0b" },
    { name: "Jennifer Lee", email: "jennifer@company.com", password: "instructor123", role: "instructor", status: "active", avatar: "#ec4899" },
];

async function seed() {
    try {
        await connectDB();
        console.log('\n🌱 Starting database seed...\n');

        // Clear existing data
        await User.deleteMany({});
        await Course.deleteMany({});
        await Order.deleteMany({});
        console.log('🗑  Cleared existing data');

        // Seed users
        const users = await User.insertMany(
            await Promise.all(USERS_DATA.map(async (u) => {
                const bcrypt = require('bcryptjs');
                return { ...u, password: await bcrypt.hash(u.password, 10) };
            }))
        );
        console.log(`👤 Created ${users.length} users`);

        // Seed courses
        const courses = await Course.insertMany(COURSES_DATA);
        console.log(`📚 Created ${courses.length} courses`);

        // Seed sample orders
        const orderData = [
            { customer: "Alex Morgan", customerEmail: "alex@gmail.com", userId: users[1]._id, course: courses[0].title, courseId: courses[0]._id, amount: 89.99, payment: "Stripe", status: "completed", avatar: "#7c3aed", orderId: "ORD-2847" },
            { customer: "Priya Sharma", customerEmail: "priya@outlook.com", userId: users[2]._id, course: courses[1].title, courseId: courses[1]._id, amount: 94.99, payment: "PayPal", status: "completed", avatar: "#ec4899", orderId: "ORD-2846" },
            { customer: "Emma Davis", customerEmail: "emma@gmail.com", userId: users[4]._id, course: courses[2].title, courseId: courses[2]._id, amount: 79.99, payment: "Stripe", status: "completed", avatar: "#10b981", orderId: "ORD-2845" },
            { customer: "David Brown", customerEmail: "david@gmail.com", userId: users[6]._id, course: courses[3].title, courseId: courses[3]._id, amount: 84.99, payment: "Stripe", status: "pending", avatar: "#ef4444", orderId: "ORD-2844" },
            { customer: "Robert Taylor", customerEmail: "robert@gmail.com", userId: users[8]._id, course: courses[5].title, courseId: courses[5]._id, amount: 99.99, payment: "PayPal", status: "completed", avatar: "#f59e0b", orderId: "ORD-2843" },
            { customer: "Lisa Wang", customerEmail: "lisa@outlook.com", userId: users[7]._id, course: courses[7].title, courseId: courses[7]._id, amount: 109.99, payment: "Stripe", status: "refunded", avatar: "#8b5cf6", orderId: "ORD-2842" },
            { customer: "Jennifer Lee", customerEmail: "jennifer@company.com", userId: users[9]._id, course: courses[4].title, courseId: courses[4]._id, amount: 69.99, payment: "Stripe", status: "completed", avatar: "#ec4899", orderId: "ORD-2841" },
            { customer: "Michael Chen", customerEmail: "michael@company.com", userId: users[5]._id, course: courses[8].title, courseId: courses[8]._id, amount: 89.99, payment: "PayPal", status: "completed", avatar: "#2563eb", orderId: "ORD-2840" },
            { customer: "Alex Morgan", customerEmail: "alex@gmail.com", userId: users[1]._id, course: courses[9].title, courseId: courses[9]._id, amount: 94.99, payment: "Stripe", status: "completed", avatar: "#7c3aed", orderId: "ORD-2839" },
            { customer: "Priya Sharma", customerEmail: "priya@outlook.com", userId: users[2]._id, course: courses[10].title, courseId: courses[10]._id, amount: 104.99, payment: "PayPal", status: "pending", avatar: "#ec4899", orderId: "ORD-2838" },
        ];
        const orders = await Order.insertMany(orderData);
        console.log(`📦 Created ${orders.length} orders`);

        console.log('\n✅ Database seeded successfully!\n');
        console.log('📝 Admin login credentials:');
        console.log('   Email:    sarah@skillforge.com');
        console.log('   Password: admin123\n');

        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err.message);
        process.exit(1);
    }
}

seed();
