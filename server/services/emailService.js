const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: `"EduPlanner Pro" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

const sendAssignmentReminder = async (userEmail, userName, assignment, hoursRemaining) => {
  const subject = `Assignment Reminder: ${assignment.title}`;
  const text = `Hi ${userName},\n\nThis is a reminder that your assignment "${assignment.title}" for ${assignment.course_name} is due in ${hoursRemaining} hours.\n\nDue Date: ${new Date(assignment.due_date).toLocaleString()}\n\nDon't forget to submit it on time!\n\nBest regards,\nEduPlanner Pro Team`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563EB;">Assignment Reminder</h2>
      <p>Hi ${userName},</p>
      <p>This is a reminder that your assignment <strong>"${assignment.title}"</strong> for <strong>${assignment.course_name}</strong> is due in <strong>${hoursRemaining} hours</strong>.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Assignment:</strong> ${assignment.title}</p>
        <p><strong>Course:</strong> ${assignment.course_name}</p>
        <p><strong>Due Date:</strong> ${new Date(assignment.due_date).toLocaleString()}</p>
        <p><strong>Priority:</strong> ${assignment.priority.toUpperCase()}</p>
      </div>
      <p>Don't forget to submit it on time!</p>
      <p>Best regards,<br>EduPlanner Pro Team</p>
    </div>
  `;

  return sendEmail(userEmail, subject, text, html);
};

const sendAttendanceAlert = async (userEmail, userName, course, attendancePercentage) => {
  const subject = `Attendance Alert: ${course.name}`;
  const text = `Hi ${userName},\n\nYour attendance for ${course.name} (${course.code}) has dropped to ${attendancePercentage}%.\n\nThis is below the recommended 75% threshold. Please make sure to attend upcoming classes to maintain good attendance.\n\nBest regards,\nEduPlanner Pro Team`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #EF4444;">Attendance Alert</h2>
      <p>Hi ${userName},</p>
      <p>Your attendance for <strong>${course.name} (${course.code})</strong> has dropped to <strong>${attendancePercentage}%</strong>.</p>
      <div style="background-color: #fef2f2; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0;">
        <p><strong>⚠️ Warning:</strong> This is below the recommended 75% threshold.</p>
      </div>
      <p>Please make sure to attend upcoming classes to maintain good attendance.</p>
      <p>Best regards,<br>EduPlanner Pro Team</p>
    </div>
  `;

  return sendEmail(userEmail, subject, text, html);
};

const sendExamReminder = async (userEmail, userName, exam, daysRemaining) => {
  const subject = `Exam Reminder: ${exam.title}`;
  const text = `Hi ${userName},\n\nYour exam "${exam.title}" for ${exam.course_name} is scheduled in ${daysRemaining} days.\n\nExam Date: ${new Date(exam.exam_date).toLocaleString()}\nLocation: ${exam.location || 'TBD'}\n\nMake sure you're prepared!\n\nBest regards,\nEduPlanner Pro Team`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #F59E0B;">Exam Reminder</h2>
      <p>Hi ${userName},</p>
      <p>Your exam <strong>"${exam.title}"</strong> for <strong>${exam.course_name}</strong> is scheduled in <strong>${daysRemaining} days</strong>.</p>
      <div style="background-color: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Exam:</strong> ${exam.title}</p>
        <p><strong>Course:</strong> ${exam.course_name}</p>
        <p><strong>Date:</strong> ${new Date(exam.exam_date).toLocaleString()}</p>
        <p><strong>Location:</strong> ${exam.location || 'TBD'}</p>
        ${exam.duration ? `<p><strong>Duration:</strong> ${exam.duration} minutes</p>` : ''}
      </div>
      <p>Make sure you're prepared!</p>
      <p>Best regards,<br>EduPlanner Pro Team</p>
    </div>
  `;

  return sendEmail(userEmail, subject, text, html);
};

module.exports = {
  sendEmail,
  sendAssignmentReminder,
  sendAttendanceAlert,
  sendExamReminder
};