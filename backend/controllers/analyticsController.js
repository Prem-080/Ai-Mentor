
import User from "../models/User.js";

// @desc    Get user analytics
// @route   GET /api/analytics
// @access  Private
const getUserAnalytics = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Ensure analytics exists
    if (!user.analytics) {
      user.analytics = {};
    }

    const calculateAttendance = () => {
      const studyDates = validateUniqueStudiedDates();
      const daysStudied = studyDates.length;
      if (!daysStudied || daysStudied == 0) {
        return { attendance: 0, daysStudied: 0 };
      }
      const firstDate = studyDates.length != 0 ? new Date(studyDates[0]) : null;
      const totalDaysValue = calculateTotalDays(firstDate);

      if (totalDaysValue <= 0) {
        return { attendance: 0, daysStudied: 0 };
      }
      // console.log(`Days Studied: ${daysStudied} and totalDays: ${totalDaysValue}`)
      const attendance = ((daysStudied / totalDaysValue) * 100).toFixed(2);
      // console.log(attendance);
      return { attendance, daysStudied };
    };

    const validateUniqueStudiedDates = () => {
      const studySessions = user.analytics?.studySessions;
      //Unique Days of Study Sessions
      const datesSet = new Set(
        studySessions
          .map((session) => new Date(session.date).toDateString())
      );
      const studyDates = [...datesSet].sort((a, b) => a - b);
      return studyDates;
    }

    const calculateTotalDays = (firstDate, current = new Date()) => {
      // Calculating Total Days from firstDate
      const first = new Date(firstDate);
      current = new Date(current);
      first.setHours(0, 0, 0, 0);
      current.setHours(0, 0, 0, 0);
      const DiffInMs = current - first;
      const totalDays = Math.floor(DiffInMs / (1000 * 60 * 60 * 24)) + 1; // Denominator for attendance.

      return totalDays;
    }

    const { attendance, daysStudied } = calculateAttendance();
    // console.log(attendance, daysStudied);

    res.json({
      attendance: attendance || 0,
      avgMarks: user.analytics.avgMarks || 0,
      dailyHours: user.analytics.dailyHours || [],
      totalCourses: user.analytics.totalCourses || 0,
      completedCourses: user.analytics.completedCourses || 0,
      totalHours: user.analytics.totalHours || 0,
      daysStudied: daysStudied || 0,
      studySessions: user.analytics.studySessions || [],
      learningHoursChart: user.analytics.learningHoursChart || [],
      certificates: user.analytics.certificates || [],
    });
  } catch (error) {
    console.error("ANALYTICS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Record study session
// @route   POST /api/analytics/study-session
// @access  Private
const recordStudySession = async (req, res) => {
  try {
    const { hours, date } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Ensure analytics object exists
    const analytics = user.analytics || {
      totalHours: 0,
      daysStudied: 0,
      studySessions: [],
      lastStudyDate: null,
    };

    const sessionDate = date ? new Date(date) : new Date();

    const isNewDay =
      !user.analytics.lastStudyDate ||
      new Date(user.analytics.lastStudyDate).toDateString() !==
      sessionDate.toDateString();

    if (isNewDay) {
      // user.analytics.daysStudied += 1; // shouldn't be calculated like this
      user.analytics.lastStudyDate = sessionDate;
    }

    analytics.totalHours += hours;

    analytics.studySessions.push({
      date: sessionDate,
      hours: hours,
    });

    user.analytics = analytics;
    // For JSONB, we need to tell Sequelize that the object has changed
    user.changed("analytics", true);
    await user.save();

    res.json({
      message: "Study session recorded successfully",
      analytics: user.analytics,
    });
  } catch (error) {
    console.error("STUDY SESSION ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { getUserAnalytics, recordStudySession };
