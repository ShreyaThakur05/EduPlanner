import streamlit as st
import pandas as pd
import plotly.express as px
from datetime import datetime, timedelta
import json

# Configure page
st.set_page_config(
    page_title="EduPlanner Pro",
    page_icon="📚",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        background: linear-gradient(90deg, #2563EB, #1D4ED8);
        padding: 1rem;
        border-radius: 10px;
        color: white;
        text-align: center;
        margin-bottom: 2rem;
    }
    .metric-card {
        background: white;
        padding: 1rem;
        border-radius: 8px;
        border-left: 4px solid #2563EB;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .attendance-good { color: #059669; }
    .attendance-warning { color: #D97706; }
    .attendance-danger { color: #DC2626; }
    .feature-card {
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        border: 1px solid #e5e7eb;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        margin-bottom: 1rem;
    }
</style>
""", unsafe_allow_html=True)

def main():
    # Header
    st.markdown("""
    <div class="main-header">
        <h1>📚 EduPlanner Pro</h1>
        <p>Your Complete Student Academic Management System</p>
        <p><em>Intelligent tracking, planning, and organization for academic success</em></p>
    </div>
    """, unsafe_allow_html=True)
    
    # Introduction
    st.markdown("""
    ## 🎯 Welcome to EduPlanner Pro Demo
    
    This is a **comprehensive student planner application** designed to help students manage their academic life through intelligent tracking, planning, and organization. 
    
    **Key Features:**
    - 📊 **Attendance Tracker** with percentage calculation and predictions
    - 📅 **Smart Timetable** with current/upcoming class notifications  
    - 📝 **Assignment Manager** with deadline tracking and priorities
    - 🎓 **Grade & GPA Calculator** with performance analytics
    - 📚 **Notes Repository** with file uploads and organization
    - 📈 **Performance Dashboard** with comprehensive analytics
    
    ---
    """)
    
    # Sidebar
    st.sidebar.title("🧭 Navigation")
    st.sidebar.markdown("Explore different features of EduPlanner Pro:")
    
    page = st.sidebar.selectbox("Choose a feature to explore:", [
        "🏠 Dashboard Overview", 
        "📊 Attendance Tracker", 
        "📝 Assignment Manager", 
        "🎓 Grade Calculator",
        "📅 Schedule Planner",
        "📚 Notes Repository",
        "⚙️ System Features"
    ])
    
    # Add demo notice
    st.sidebar.markdown("---")
    st.sidebar.info("🔍 **Demo Mode**: This is a demonstration of EduPlanner Pro features with sample data.")
    
    if page == "🏠 Dashboard Overview":
        show_dashboard()
    elif page == "📊 Attendance Tracker":
        show_attendance()
    elif page == "📝 Assignment Manager":
        show_assignments()
    elif page == "🎓 Grade Calculator":
        show_grades()
    elif page == "📅 Schedule Planner":
        show_schedule()
    elif page == "📚 Notes Repository":
        show_notes()
    elif page == "⚙️ System Features":
        show_features()

def show_dashboard():
    st.header("📊 Dashboard Overview")
    st.markdown("*Your academic life at a glance*")
    
    # Key Metrics
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Overall Attendance", "85.2%", "↗️ 2.1%", help="Average attendance across all courses")
    with col2:
        st.metric("Active Courses", "6", "📚 +1", help="Currently enrolled courses")
    with col3:
        st.metric("Pending Assignments", "4", "📝 -2", help="Assignments due soon")
    with col4:
        st.metric("Current GPA", "3.7/4.0", "📈 +0.1", help="Cumulative Grade Point Average")
    
    st.markdown("---")
    
    # Charts Section
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("📈 Attendance Trends (Last 30 Days)")
        # Sample attendance data
        dates = pd.date_range(start='2024-01-01', end='2024-01-30', freq='D')
        attendance_data = pd.DataFrame({
            'Date': dates,
            'Attendance': [85 + (i % 10) - 5 + (i % 3) for i in range(len(dates))]
        })
        fig = px.line(attendance_data, x='Date', y='Attendance', 
                     title="Daily Attendance Percentage",
                     color_discrete_sequence=['#2563EB'])
        fig.update_layout(yaxis_range=[70, 100])
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        st.subheader("🎯 Grade Distribution")
        grades_data = pd.DataFrame({
            'Grade': ['A (90-100%)', 'B (80-89%)', 'C (70-79%)', 'D (60-69%)', 'F (<60%)'],
            'Count': [12, 8, 5, 2, 1],
            'Percentage': [42.9, 28.6, 17.9, 7.1, 3.6]
        })
        fig = px.pie(grades_data, values='Count', names='Grade',
                    title="Grade Distribution Across All Courses",
                    color_discrete_sequence=px.colors.qualitative.Set3)
        st.plotly_chart(fig, use_container_width=True)
    
    # Today's Schedule
    st.subheader("📅 Today's Schedule")
    today_schedule = pd.DataFrame({
        'Time': ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'],
        'Course': ['Computer Science 101', 'Mathematics 201', 'Physics 301', 'Chemistry Lab'],
        'Location': ['Room A-101', 'Room B-205', 'Physics Lab', 'Chem Lab 2'],
        'Status': ['✅ Attended', '⏰ Current', '⏳ Upcoming', '⏳ Upcoming']
    })
    st.dataframe(today_schedule, use_container_width=True, hide_index=True)
    
    # Quick Actions
    st.subheader("⚡ Quick Actions")
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        if st.button("📊 Mark Attendance", use_container_width=True):
            st.success("Redirecting to Attendance Tracker...")
    with col2:
        if st.button("📝 Add Assignment", use_container_width=True):
            st.success("Redirecting to Assignment Manager...")
    with col3:
        if st.button("🎓 Record Grade", use_container_width=True):
            st.success("Redirecting to Grade Calculator...")
    with col4:
        if st.button("📚 Upload Notes", use_container_width=True):
            st.success("Redirecting to Notes Repository...")

def show_attendance():
    st.header("📊 Attendance Tracker")
    st.markdown("*Track your class attendance and maintain academic requirements*")
    
    # Course selection
    courses = [
        "Computer Science 101 - CS101",
        "Mathematics 201 - MATH201", 
        "Physics 301 - PHYS301",
        "Chemistry 101 - CHEM101",
        "English Literature 201 - ENG201"
    ]
    
    selected_course = st.selectbox("📚 Select Course", courses)
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.subheader("✅ Mark Today's Attendance")
        
        # Create a form for attendance marking
        with st.form("attendance_form"):
            date = st.date_input("📅 Date", datetime.now())
            status = st.radio("📋 Attendance Status", ["Present", "Absent", "Late"], horizontal=True)
            notes = st.text_area("📝 Notes (optional)", placeholder="Any additional notes about the class...")
            
            submitted = st.form_submit_button("Mark Attendance", use_container_width=True)
            
            if submitted:
                st.success(f"✅ Attendance marked as **{status}** for {selected_course.split(' - ')[0]} on {date}")
                st.balloons()
    
    with col2:
        st.subheader("📈 Attendance Statistics")
        
        # Sample statistics
        attendance_stats = {
            "Current Percentage": "87.5%",
            "Classes Attended": "35",
            "Total Classes": "40", 
            "Classes Missed": "5",
            "Classes Needed for 75%": "0",
            "Status": "✅ Good Standing"
        }
        
        for stat, value in attendance_stats.items():
            if stat == "Current Percentage":
                color = "green" if float(value.strip('%')) >= 75 else "red"
                st.metric(stat, value, help=f"Minimum required: 75%")
            else:
                st.metric(stat, value)
    
    st.markdown("---")
    
    # Attendance prediction
    st.subheader("🔮 Attendance Prediction")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.info("""
        **📊 Current Status**: Your attendance is above the 75% requirement.
        
        **🎯 Recommendation**: You can miss up to 2 more classes and still maintain the minimum requirement.
        
        **⚠️ Warning**: Missing more than 2 classes will put you below the 75% threshold.
        """)
    
    with col2:
        # Attendance trend chart
        weeks = list(range(1, 13))
        attendance_trend = [88, 85, 90, 87, 89, 86, 88, 85, 87, 89, 86, 87]
        
        trend_df = pd.DataFrame({
            'Week': weeks,
            'Attendance %': attendance_trend
        })
        
        fig = px.line(trend_df, x='Week', y='Attendance %', 
                     title="Weekly Attendance Trend",
                     color_discrete_sequence=['#10B981'])
        fig.add_hline(y=75, line_dash="dash", line_color="red", 
                     annotation_text="Minimum Required (75%)")
        fig.update_layout(yaxis_range=[70, 95])
        st.plotly_chart(fig, use_container_width=True)
    
    # Detailed attendance record
    st.subheader("📋 Attendance History")
    
    # Sample attendance data
    attendance_history = pd.DataFrame({
        'Date': pd.date_range(start='2024-01-15', periods=10, freq='2D'),
        'Status': ['Present', 'Present', 'Late', 'Present', 'Absent', 'Present', 'Present', 'Present', 'Late', 'Present'],
        'Notes': ['', '', 'Traffic jam', '', 'Sick', '', '', '', 'Bus delay', '']
    })
    
    # Color code the status
    def color_status(val):
        if val == 'Present':
            return 'background-color: #D1FAE5; color: #065F46'
        elif val == 'Late':
            return 'background-color: #FEF3C7; color: #92400E'
        elif val == 'Absent':
            return 'background-color: #FEE2E2; color: #991B1B'
        return ''
    
    styled_df = attendance_history.style.applymap(color_status, subset=['Status'])
    st.dataframe(styled_df, use_container_width=True, hide_index=True)

def show_assignments():
    st.header("📝 Assignment Manager")
    st.markdown("*Track homework, projects, and deadlines efficiently*")
    
    # Add new assignment section
    with st.expander("➕ Add New Assignment", expanded=False):
        with st.form("assignment_form"):
            col1, col2 = st.columns(2)
            
            with col1:
                title = st.text_input("📋 Assignment Title", placeholder="e.g., Math Homework Chapter 5")
                course = st.selectbox("📚 Course", ["CS101", "MATH201", "PHYS301", "CHEM101", "ENG201"])
                due_date = st.date_input("📅 Due Date", min_value=datetime.now().date())
            
            with col2:
                priority = st.selectbox("⚡ Priority", ["Low", "Medium", "High"])
                status = st.selectbox("📊 Status", ["Pending", "In Progress", "Completed"])
                description = st.text_area("📝 Description", placeholder="Assignment details, requirements, etc.")
            
            submitted = st.form_submit_button("Add Assignment", use_container_width=True)
            
            if submitted:
                st.success(f"✅ Assignment '{title}' added successfully!")
                st.balloons()
    
    # Assignment statistics
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("📊 Total Assignments", "15", "📈 +3")
    with col2:
        st.metric("✅ Completed", "8", "📈 +2")
    with col3:
        st.metric("⏳ In Progress", "4", "📊 +1")
    with col4:
        st.metric("⚠️ Overdue", "1", "📉 -1")
    
    st.markdown("---")
    
    # Filter and sort options
    col1, col2, col3 = st.columns(3)
    
    with col1:
        filter_status = st.selectbox("Filter by Status", ["All", "Pending", "In Progress", "Completed", "Overdue"])
    with col2:
        filter_priority = st.selectbox("Filter by Priority", ["All", "High", "Medium", "Low"])
    with col3:
        sort_by = st.selectbox("Sort by", ["Due Date", "Priority", "Course", "Status"])
    
    # Sample assignments data
    assignments_data = pd.DataFrame({
        'Title': [
            'Math Calculus Problem Set 5',
            'Physics Lab Report - Pendulum',
            'CS Programming Project Phase 1',
            'Chemistry Molecular Structure Essay',
            'English Literature Analysis Paper',
            'Math Statistics Homework',
            'Physics Quantum Mechanics Quiz Prep'
        ],
        'Course': ['MATH201', 'PHYS301', 'CS101', 'CHEM101', 'ENG201', 'MATH201', 'PHYS301'],
        'Due Date': [
            '2024-02-15', '2024-02-18', '2024-02-20', '2024-02-22', 
            '2024-02-25', '2024-02-28', '2024-03-01'
        ],
        'Priority': ['High', 'Medium', 'High', 'Low', 'Medium', 'High', 'Low'],
        'Status': ['Pending', 'In Progress', 'Pending', 'Completed', 'In Progress', 'Overdue', 'Pending'],
        'Progress': ['0%', '60%', '25%', '100%', '40%', '0%', '10%']
    })
    
    # Apply filters
    filtered_data = assignments_data.copy()
    
    if filter_status != "All":
        filtered_data = filtered_data[filtered_data['Status'] == filter_status]
    
    if filter_priority != "All":
        filtered_data = filtered_data[filtered_data['Priority'] == filter_priority]
    
    st.subheader(f"📋 Assignment List ({len(filtered_data)} items)")
    
    # Display assignments as cards
    for idx, assignment in filtered_data.iterrows():
        with st.container():
            col1, col2, col3 = st.columns([3, 1, 1])
            
            with col1:
                # Priority indicator
                priority_color = {"High": "🔴", "Medium": "🟡", "Low": "🟢"}
                status_color = {
                    "Pending": "⏳", 
                    "In Progress": "🔄", 
                    "Completed": "✅", 
                    "Overdue": "⚠️"
                }
                
                st.markdown(f"""
                **{priority_color[assignment['Priority']]} {assignment['Title']}**
                
                📚 Course: {assignment['Course']} | 📅 Due: {assignment['Due Date']} | {status_color[assignment['Status']]} {assignment['Status']}
                """)
            
            with col2:
                progress_val = int(assignment['Progress'].strip('%'))
                st.progress(progress_val / 100)
                st.caption(f"Progress: {assignment['Progress']}")
            
            with col3:
                if st.button(f"Edit", key=f"edit_{idx}"):
                    st.info("Edit functionality would open here")
                if st.button(f"Delete", key=f"delete_{idx}"):
                    st.warning("Delete confirmation would appear here")
            
            st.markdown("---")
    
    # Assignment timeline
    st.subheader("📅 Assignment Timeline")
    
    # Create timeline visualization
    timeline_data = assignments_data[assignments_data['Status'] != 'Completed'].copy()
    timeline_data['Due Date'] = pd.to_datetime(timeline_data['Due Date'])
    timeline_data = timeline_data.sort_values('Due Date')
    
    fig = px.timeline(timeline_data, 
                     x_start='Due Date', 
                     x_end='Due Date',
                     y='Course',
                     color='Priority',
                     title="Upcoming Assignment Deadlines",
                     color_discrete_map={'High': '#EF4444', 'Medium': '#F59E0B', 'Low': '#10B981'})
    
    st.plotly_chart(fig, use_container_width=True)

def show_grades():
    st.header("🎓 Grade Calculator & GPA Tracker")
    st.markdown("*Monitor your academic performance and calculate GPA*")
    
    # GPA Overview
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("🎯 Current GPA (4.0)", "3.7", "📈 +0.1")
    with col2:
        st.metric("📊 Current GPA (10.0)", "8.5", "📈 +0.2")
    with col3:
        st.metric("📚 Total Credits", "18", "📈 +3")
    with col4:
        st.metric("🏆 Class Rank", "15/120", "📈 +2")
    
    st.markdown("---")
    
    # Add new grade
    with st.expander("➕ Add New Grade", expanded=False):
        with st.form("grade_form"):
            col1, col2 = st.columns(2)
            
            with col1:
                course = st.selectbox("📚 Course", ["CS101", "MATH201", "PHYS301", "CHEM101", "ENG201"])
                assignment = st.text_input("📋 Assignment Name", placeholder="e.g., Midterm Exam")
                score = st.number_input("📊 Score Received", min_value=0.0, max_value=100.0, value=85.0)
            
            with col2:
                max_score = st.number_input("📈 Maximum Score", min_value=1.0, value=100.0)
                weight = st.slider("⚖️ Assignment Weight", 0.1, 1.0, 1.0, help="Weight of this assignment in final grade")
                grade_date = st.date_input("📅 Grade Date", datetime.now().date())
            
            submitted = st.form_submit_button("Add Grade", use_container_width=True)
            
            if submitted:
                percentage = (score / max_score) * 100
                st.success(f"✅ Grade added: {score}/{max_score} ({percentage:.1f}%) for {assignment}")
                st.balloons()
    
    # Course performance overview
    st.subheader("📊 Course Performance Overview")
    
    course_performance = pd.DataFrame({
        'Course': ['Computer Science 101', 'Mathematics 201', 'Physics 301', 'Chemistry 101', 'English Literature 201'],
        'Code': ['CS101', 'MATH201', 'PHYS301', 'CHEM101', 'ENG201'],
        'Current Grade': [92.5, 88.3, 85.7, 91.2, 87.9],
        'Letter Grade': ['A', 'B+', 'B', 'A-', 'B+'],
        'Credits': [3, 4, 3, 3, 3],
        'Assignments': [8, 6, 7, 5, 9]
    })
    
    # Color code grades
    def color_grade(val):
        if val >= 90:
            return 'background-color: #D1FAE5; color: #065F46'  # Green
        elif val >= 80:
            return 'background-color: #DBEAFE; color: #1E40AF'  # Blue
        elif val >= 70:
            return 'background-color: #FEF3C7; color: #92400E'  # Yellow
        else:
            return 'background-color: #FEE2E2; color: #991B1B'  # Red
    
    styled_performance = course_performance.style.applymap(color_grade, subset=['Current Grade'])
    st.dataframe(styled_performance, use_container_width=True, hide_index=True)
    
    # Grade trends
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("📈 Grade Trends Over Time")
        
        # Sample grade trend data
        months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb']
        cs_grades = [88, 90, 89, 92, 91, 93]
        math_grades = [85, 87, 86, 89, 88, 90]
        physics_grades = [82, 84, 83, 86, 85, 87]
        
        trend_df = pd.DataFrame({
            'Month': months,
            'Computer Science': cs_grades,
            'Mathematics': math_grades,
            'Physics': physics_grades
        })
        
        fig = px.line(trend_df, x='Month', y=['Computer Science', 'Mathematics', 'Physics'],
                     title="Grade Trends by Course")
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        st.subheader("🎯 GPA Distribution")
        
        gpa_data = pd.DataFrame({
            'GPA Range': ['3.5-4.0', '3.0-3.4', '2.5-2.9', '2.0-2.4', 'Below 2.0'],
            'Students': [45, 35, 25, 15, 5],
            'Your Position': ['You are here', '', '', '', '']
        })
        
        fig = px.bar(gpa_data, x='GPA Range', y='Students',
                    title="Class GPA Distribution",
                    color_discrete_sequence=['#2563EB'])
        
        # Highlight user's position
        fig.add_annotation(x='3.5-4.0', y=45, text="You are here! 🎯",
                          showarrow=True, arrowhead=2, arrowcolor="red")
        
        st.plotly_chart(fig, use_container_width=True)
    
    # Detailed grades table
    st.subheader("📋 Detailed Grade Records")
    
    detailed_grades = pd.DataFrame({
        'Date': ['2024-02-10', '2024-02-08', '2024-02-05', '2024-02-01', '2024-01-28'],
        'Course': ['CS101', 'MATH201', 'PHYS301', 'CHEM101', 'ENG201'],
        'Assignment': ['Programming Project 2', 'Calculus Quiz 3', 'Lab Report 4', 'Molecular Structure Test', 'Essay Analysis'],
        'Score': ['95/100', '42/50', '38/40', '87/100', '23/25'],
        'Percentage': [95.0, 84.0, 95.0, 87.0, 92.0],
        'Letter Grade': ['A', 'B', 'A', 'B+', 'A-'],
        'Weight': ['20%', '15%', '10%', '25%', '15%']
    })
    
    st.dataframe(detailed_grades, use_container_width=True, hide_index=True)
    
    # GPA Calculator
    st.subheader("🧮 Quick GPA Calculator")
    
    st.info("""
    **Current Semester GPA**: 3.7/4.0 (8.5/10.0)
    
    **Cumulative GPA**: 3.6/4.0 (8.3/10.0)
    
    **Credits Completed**: 45 credits
    
    **Academic Standing**: Good Standing ✅
    """)

def show_schedule():
    st.header("📅 Schedule Planner & Timetable")
    st.markdown("*Organize your weekly class schedule and manage time effectively*")
    
    # Current time and day
    current_time = datetime.now()
    st.info(f"🕐 Current Time: {current_time.strftime('%A, %B %d, %Y - %I:%M %p')}")
    
    # Today's classes highlight
    st.subheader("📚 Today's Classes")
    
    today_classes = [
        {"Course": "Computer Science 101", "Time": "9:00 AM - 10:30 AM", "Location": "Room A-101", "Status": "✅ Completed"},
        {"Course": "Mathematics 201", "Time": "11:00 AM - 12:30 PM", "Location": "Room B-205", "Status": "⏰ Current"},
        {"Course": "Physics 301", "Time": "2:00 PM - 3:30 PM", "Location": "Physics Lab", "Status": "⏳ Upcoming"},
        {"Course": "Chemistry Lab", "Time": "4:00 PM - 6:00 PM", "Location": "Chem Lab 2", "Status": "⏳ Upcoming"}
    ]
    
    for class_info in today_classes:
        status_color = {
            "✅ Completed": "success",
            "⏰ Current": "info", 
            "⏳ Upcoming": "warning"
        }
        
        with st.container():
            col1, col2, col3 = st.columns([2, 1, 1])
            
            with col1:
                st.markdown(f"**{class_info['Course']}**")
            with col2:
                st.markdown(f"🕐 {class_info['Time']}")
            with col3:
                st.markdown(f"📍 {class_info['Location']}")
            
            st.markdown(f"Status: {class_info['Status']}")
            st.markdown("---")
    
    # Weekly schedule grid
    st.subheader("📊 Weekly Schedule Grid")
    
    # Create schedule data
    time_slots = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    
    schedule_data = {
        'Time': time_slots,
        'Monday': ['', 'CS101', '', 'MATH201', 'Lunch', '', 'PHYS301', '', 'CHEM101', ''],
        'Tuesday': ['', '', 'MATH201', '', 'Lunch', 'ENG201', '', 'CS101 Lab', '', ''],
        'Wednesday': ['', 'CS101', '', 'MATH201', 'Lunch', '', 'PHYS301', '', 'CHEM101', ''],
        'Thursday': ['', '', 'MATH201', '', 'Lunch', 'ENG201', '', 'CS101 Lab', '', ''],
        'Friday': ['', 'CS101', '', '', 'Lunch', '', 'PHYS301', '', '', 'Study Time']
    }
    
    schedule_df = pd.DataFrame(schedule_data)
    
    # Style the schedule
    def highlight_classes(val):
        if val and val != 'Lunch' and val != 'Study Time' and val != '':
            return 'background-color: #DBEAFE; color: #1E40AF; font-weight: bold'
        elif val == 'Lunch':
            return 'background-color: #FEF3C7; color: #92400E'
        elif val == 'Study Time':
            return 'background-color: #D1FAE5; color: #065F46'
        return ''
    
    styled_schedule = schedule_df.style.applymap(highlight_classes)
    st.dataframe(styled_schedule, use_container_width=True, hide_index=True)
    
    # Schedule statistics
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("📚 Classes per Week", "18", "📊 Total")
    with col2:
        st.metric("⏰ Hours per Week", "27", "🕐 Contact Hours")
    with col3:
        st.metric("📅 Days Active", "5", "📆 Mon-Fri")
    with col4:
        st.metric("🏫 Different Locations", "8", "📍 Rooms/Labs")
    
    # Time management insights
    st.subheader("⏰ Time Management Insights")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("""
        **📊 Weekly Schedule Analysis:**
        
        - **Busiest Day**: Wednesday (6 hours of classes)
        - **Lightest Day**: Friday (4 hours of classes)  
        - **Peak Hours**: 11 AM - 3 PM (most classes)
        - **Free Time**: Mornings before 9 AM, evenings after 5 PM
        
        **💡 Recommendations:**
        - Use Tuesday/Thursday afternoons for assignments
        - Schedule study sessions during free periods
        - Plan group work during common free times
        """)
    
    with col2:
        # Weekly hour distribution
        hours_data = pd.DataFrame({
            'Day': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            'Class Hours': [5, 4, 6, 4, 3],
            'Study Hours': [3, 4, 2, 4, 5]
        })
        
        fig = px.bar(hours_data, x='Day', y=['Class Hours', 'Study Hours'],
                    title="Weekly Time Distribution",
                    color_discrete_sequence=['#2563EB', '#10B981'])
        st.plotly_chart(fig, use_container_width=True)
    
    # Add/Edit schedule
    with st.expander("➕ Add New Class to Schedule"):
        with st.form("schedule_form"):
            col1, col2 = st.columns(2)
            
            with col1:
                course_name = st.text_input("📚 Course Name")
                course_code = st.text_input("🔤 Course Code")
                day = st.selectbox("📅 Day", days)
            
            with col2:
                start_time = st.time_input("🕐 Start Time")
                end_time = st.time_input("🕕 End Time")
                location = st.text_input("📍 Location")
            
            submitted = st.form_submit_button("Add to Schedule")
            
            if submitted:
                st.success(f"✅ Added {course_name} to {day} schedule!")

def show_notes():
    st.header("📚 Notes Repository & File Manager")
    st.markdown("*Organize and manage your study materials efficiently*")
    
    # Upload new note
    with st.expander("📤 Upload New Note", expanded=False):
        with st.form("notes_form"):
            col1, col2 = st.columns(2)
            
            with col1:
                title = st.text_input("📝 Note Title", placeholder="e.g., Calculus Chapter 5 Notes")
                course = st.selectbox("📚 Course", ["CS101", "MATH201", "PHYS301", "CHEM101", "ENG201"])
                tags = st.text_input("🏷️ Tags", placeholder="calculus, derivatives, limits (comma-separated)")
            
            with col2:
                uploaded_file = st.file_uploader("📎 Choose a file", 
                                               type=['pdf', 'docx', 'pptx', 'txt', 'jpg', 'png'],
                                               help="Supported formats: PDF, DOCX, PPTX, TXT, JPG, PNG (Max 50MB)")
                description = st.text_area("📄 Description", placeholder="Brief description of the notes content...")
            
            submitted = st.form_submit_button("Upload Note", use_container_width=True)
            
            if submitted:
                st.success(f"✅ Note '{title}' uploaded successfully!")
                st.balloons()
    
    # Search and filter
    col1, col2, col3 = st.columns(3)
    
    with col1:
        search_term = st.text_input("🔍 Search Notes", placeholder="Search by title or content...")
    with col2:
        filter_course = st.selectbox("📚 Filter by Course", ["All Courses", "CS101", "MATH201", "PHYS301", "CHEM101", "ENG201"])
    with col3:
        filter_type = st.selectbox("📄 Filter by Type", ["All Types", "PDF", "DOCX", "PPTX", "Images", "Text"])
    
    # Notes statistics
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("📚 Total Notes", "47", "📈 +5")
    with col2:
        st.metric("📄 PDF Files", "23", "📊 49%")
    with col3:
        st.metric("🏷️ Unique Tags", "28", "📈 +3")
    with col4:
        st.metric("💾 Storage Used", "245 MB", "📊 of 1GB")
    
    st.markdown("---")
    
    # Sample notes data
    notes_data = [
        {
            "title": "Calculus Derivatives - Chapter 5",
            "course": "MATH201",
            "type": "PDF",
            "size": "2.3 MB",
            "tags": ["calculus", "derivatives", "chain-rule"],
            "date": "2024-02-10",
            "description": "Comprehensive notes on derivatives including chain rule, product rule, and quotient rule with examples."
        },
        {
            "title": "Physics Lab - Pendulum Experiment",
            "course": "PHYS301", 
            "type": "DOCX",
            "size": "1.8 MB",
            "tags": ["physics", "lab", "pendulum", "oscillation"],
            "date": "2024-02-08",
            "description": "Lab report template and observations for pendulum oscillation experiment."
        },
        {
            "title": "CS Algorithms - Sorting Methods",
            "course": "CS101",
            "type": "PDF", 
            "size": "3.1 MB",
            "tags": ["algorithms", "sorting", "quicksort", "mergesort"],
            "date": "2024-02-05",
            "description": "Detailed explanation of various sorting algorithms with time complexity analysis."
        },
        {
            "title": "Chemistry Molecular Structures",
            "course": "CHEM101",
            "type": "PPTX",
            "size": "5.2 MB", 
            "tags": ["chemistry", "molecules", "structures", "bonds"],
            "date": "2024-02-03",
            "description": "PowerPoint presentation on molecular structures and chemical bonding."
        },
        {
            "title": "English Literature - Shakespeare Analysis",
            "course": "ENG201",
            "type": "DOCX",
            "size": "1.5 MB",
            "tags": ["literature", "shakespeare", "analysis", "hamlet"],
            "date": "2024-02-01",
            "description": "Character analysis and themes in Shakespeare's Hamlet with critical interpretations."
        }
    ]
    
    # Display notes as cards
    st.subheader(f"📋 My Notes ({len(notes_data)} items)")
    
    for i, note in enumerate(notes_data):
        with st.container():
            col1, col2, col3 = st.columns([3, 1, 1])
            
            with col1:
                # File type icon
                type_icons = {"PDF": "📄", "DOCX": "📝", "PPTX": "📊", "Images": "🖼️", "Text": "📃"}
                icon = type_icons.get(note["type"], "📄")
                
                st.markdown(f"""
                **{icon} {note['title']}**
                
                📚 Course: {note['course']} | 📅 {note['date']} | 💾 {note['size']}
                
                📝 {note['description']}
                """)
                
                # Tags
                tag_html = " ".join([f"<span style='background-color: #E5E7EB; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-right: 4px;'>{tag}</span>" for tag in note['tags']])
                st.markdown(f"🏷️ {tag_html}", unsafe_allow_html=True)
            
            with col2:
                if st.button("📥 Download", key=f"download_{i}"):
                    st.success("Download started!")
                if st.button("👁️ Preview", key=f"preview_{i}"):
                    st.info("Preview would open here")
            
            with col3:
                if st.button("✏️ Edit", key=f"edit_{i}"):
                    st.info("Edit mode would activate")
                if st.button("🗑️ Delete", key=f"delete_{i}"):
                    st.warning("Delete confirmation needed")
            
            st.markdown("---")
    
    # Notes organization
    st.subheader("📊 Notes Organization")
    
    col1, col2 = st.columns(2)
    
    with col1:
        # Notes by course
        course_counts = {"MATH201": 12, "CS101": 10, "PHYS301": 9, "CHEM101": 8, "ENG201": 8}
        course_df = pd.DataFrame(list(course_counts.items()), columns=['Course', 'Notes Count'])
        
        fig = px.pie(course_df, values='Notes Count', names='Course',
                    title="Notes Distribution by Course")
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        # File types
        type_counts = {"PDF": 23, "DOCX": 12, "PPTX": 8, "Images": 3, "Text": 1}
        type_df = pd.DataFrame(list(type_counts.items()), columns=['File Type', 'Count'])
        
        fig = px.bar(type_df, x='File Type', y='Count',
                    title="Notes by File Type",
                    color_discrete_sequence=['#2563EB'])
        st.plotly_chart(fig, use_container_width=True)

def show_features():
    st.header("⚙️ System Features & Technical Specifications")
    st.markdown("*Comprehensive overview of EduPlanner Pro capabilities*")
    
    # Core features
    st.subheader("🎯 Core Features")
    
    features = [
        {
            "icon": "📊",
            "title": "Attendance Tracker",
            "description": "Mark attendance, calculate percentages, predict future attendance needs with intelligent recommendations",
            "details": ["Real-time percentage calculation", "75% threshold monitoring", "Attendance prediction algorithm", "Visual trend analysis"]
        },
        {
            "icon": "📅", 
            "title": "Smart Timetable",
            "description": "Visual schedule grid with current/upcoming class notifications and conflict detection",
            "details": ["Weekly schedule grid", "Current class highlighting", "Next class notifications", "Time conflict detection"]
        },
        {
            "icon": "📝",
            "title": "Assignment Manager", 
            "description": "Track homework, deadlines, and priorities with automated reminders and progress tracking",
            "details": ["Priority-based sorting", "Deadline notifications", "Progress tracking", "Status management"]
        },
        {
            "icon": "🎓",
            "title": "Grade & GPA Calculator",
            "description": "Record grades, calculate GPA/CGPA, visualize performance trends with multiple grading scales",
            "details": ["4.0 and 10.0 GPA scales", "Weighted grade calculation", "Performance analytics", "Grade trend visualization"]
        },
        {
            "icon": "📚",
            "title": "Notes Repository",
            "description": "Upload, organize, and categorize study materials with advanced search and tagging",
            "details": ["File upload (PDF, DOC, PPT, images)", "Tag-based organization", "Advanced search", "50MB file limit"]
        },
        {
            "icon": "📈",
            "title": "Analytics Dashboard",
            "description": "Comprehensive overview of academic performance with interactive charts and insights",
            "details": ["Performance metrics", "Interactive charts", "Trend analysis", "Academic insights"]
        }
    ]
    
    for feature in features:
        with st.container():
            col1, col2 = st.columns([1, 3])
            
            with col1:
                st.markdown(f"""
                <div style="text-align: center; font-size: 48px; margin-bottom: 10px;">
                    {feature['icon']}
                </div>
                """, unsafe_allow_html=True)
            
            with col2:
                st.markdown(f"**{feature['title']}**")
                st.markdown(feature['description'])
                
                with st.expander("View Details"):
                    for detail in feature['details']:
                        st.markdown(f"• {detail}")
            
            st.markdown("---")
    
    # Technical specifications
    st.subheader("🛠️ Technical Specifications")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("""
        **Backend Technology:**
        - **Framework**: Node.js with Express.js
        - **Database**: PostgreSQL with Redis caching
        - **Authentication**: JWT with refresh tokens
        - **File Storage**: Multer with 50MB limit
        - **Email Service**: Nodemailer integration
        - **Validation**: Joi schema validation
        - **Security**: Helmet, CORS, Rate limiting
        """)
    
    with col2:
        st.markdown("""
        **Frontend Technology:**
        - **Framework**: React 18 with TypeScript
        - **Styling**: Tailwind CSS
        - **Routing**: React Router v6
        - **State Management**: Context API
        - **HTTP Client**: Axios with interceptors
        - **Charts**: Chart.js and Plotly
        - **Forms**: React Hook Form
        """)
    
    # Security features
    st.subheader("🔐 Security & Privacy Features")
    
    security_features = [
        "🔒 JWT-based authentication with refresh token rotation",
        "🛡️ Input validation and sanitization",
        "🚫 Rate limiting to prevent abuse",
        "📧 Email verification for account security", 
        "🔐 Password hashing with bcrypt",
        "🌐 HTTPS enforcement in production",
        "📊 Audit logging for security events",
        "🔄 Automatic session management"
    ]
    
    for feature in security_features:
        st.markdown(f"• {feature}")
    
    # Performance metrics
    st.subheader("⚡ Performance Metrics")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("🚀 Load Time", "< 2s", "Initial page load")
    with col2:
        st.metric("💾 Database", "< 100ms", "Query response time")
    with col3:
        st.metric("📱 Mobile", "100%", "Responsive design")
    with col4:
        st.metric("🔄 Uptime", "99.9%", "Service availability")
    
    # Deployment options
    st.subheader("🌐 Deployment Options")
    
    deployment_options = [
        {"platform": "Hugging Face Spaces", "type": "Demo/Prototype", "cost": "Free", "features": "Streamlit interface, limited functionality"},
        {"platform": "Vercel + Railway", "type": "Production", "cost": "Free tier available", "features": "Full-stack deployment, auto-scaling"},
        {"platform": "Heroku", "type": "Production", "cost": "$7/month", "features": "Managed PostgreSQL, Redis addon"},
        {"platform": "DigitalOcean", "type": "Production", "cost": "$12/month", "features": "App Platform, managed databases"},
        {"platform": "AWS/Azure/GCP", "type": "Enterprise", "cost": "Variable", "features": "Full cloud infrastructure, high availability"}
    ]
    
    deployment_df = pd.DataFrame(deployment_options)
    st.dataframe(deployment_df, use_container_width=True, hide_index=True)
    
    # API endpoints
    st.subheader("🔌 API Endpoints Overview")
    
    api_categories = {
        "Authentication": ["/api/auth/register", "/api/auth/login", "/api/auth/refresh", "/api/auth/logout"],
        "Dashboard": ["/api/dashboard/overview", "/api/dashboard/current-class", "/api/dashboard/next-class"],
        "Courses": ["/api/courses", "/api/courses/:id", "/api/courses/:id/classes"],
        "Attendance": ["/api/attendance/stats", "/api/attendance/mark", "/api/attendance/history"],
        "Assignments": ["/api/assignments", "/api/assignments/upcoming", "/api/assignments/stats"],
        "Grades": ["/api/grades", "/api/grades/stats", "/api/grades/trends"],
        "Notes": ["/api/notes", "/api/notes/tags", "/api/notes/:id/download"]
    }
    
    for category, endpoints in api_categories.items():
        with st.expander(f"📡 {category} APIs"):
            for endpoint in endpoints:
                st.code(endpoint)
    
    # Future roadmap
    st.subheader("🗺️ Future Roadmap")
    
    roadmap_items = [
        {"version": "v1.1", "features": ["Exam scheduler", "Faculty directory", "Bulk import/export", "Custom themes"], "timeline": "Q2 2024"},
        {"version": "v2.0", "features": ["Mobile app", "Google Calendar sync", "Study groups", "AI recommendations"], "timeline": "Q4 2024"},
        {"version": "v2.1", "features": ["Offline mode", "Advanced analytics", "Integration APIs", "Multi-language"], "timeline": "Q1 2025"}
    ]
    
    for item in roadmap_items:
        with st.expander(f"🚀 {item['version']} - {item['timeline']}"):
            for feature in item['features']:
                st.markdown(f"• {feature}")

if __name__ == "__main__":
    main()